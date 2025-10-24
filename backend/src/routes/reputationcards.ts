import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '../db/client';
import solanaService from '../services/solana';

const router = Router();

// Get reputation cards for a user from on-chain
router.get('/onchain/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { status } = req.query;

    // TODO: Implement on-chain fetching using reputation_card program
    // This will fetch all cards where recipient = walletAddress
    
    // For now, return structure that frontend expects
    res.json({
      cards: [],
      summary: {
        totalCards: 0,
        averageRating: 0,
        cardsByType: {},
      },
    });
  } catch (error) {
    console.error('Error fetching on-chain reputation cards:', error);
    res.status(500).json({ error: 'Failed to fetch reputation cards' });
  }
});

// Record reputation card creation in database (for indexing/caching)
router.post(
  '/record',
  [
    body('cardPDA').isString().notEmpty(),
    body('issuerWallet').isString().notEmpty(),
    body('recipientWallet').isString().notEmpty(),
    body('cardType').isString().notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('message').optional().isString(),
    body('txSignature').isString().notEmpty(),
    body('cardNumber').isInt({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        cardPDA,
        issuerWallet,
        recipientWallet,
        cardType,
        rating,
        message,
        txSignature,
        cardNumber,
      } = req.body;

      // Find or create users
      const [issuer, recipient] = await Promise.all([
        prisma.user.upsert({
          where: { walletAddress: issuerWallet },
          update: {},
          create: { walletAddress: issuerWallet },
        }),
        prisma.user.upsert({
          where: { walletAddress: recipientWallet },
          update: {},
          create: { walletAddress: recipientWallet },
        }),
      ]);

      // Map on-chain card type to database enum
      const typeMapping: Record<string, any> = {
        trustworthy: 'TRUSTWORTHY',
        qualityProducts: 'QUALITY_PRODUCTS',
        fastShipping: 'FAST_SHIPPING',
        goodCommunication: 'GOOD_COMMUNICATION',
        fairPricing: 'FAIR_PRICING',
      };

      const dbType = typeMapping[cardType] || 'TRUSTWORTHY';

      // Create recommendation record in database
      const recommendation = await prisma.recommendation.create({
        data: {
          issuerId: issuer.id,
          recipientId: recipient.id,
          type: dbType,
          message: message || null,
          isActive: true,
          txSignature,
        },
      });

      // Update recipient's reputation score
      await updateReputationScore(recipient.id);

      res.status(201).json({
        recommendation,
        cardPDA,
        cardNumber,
      });
    } catch (error) {
      console.error('Error recording reputation card:', error);
      res.status(500).json({ error: 'Failed to record reputation card' });
    }
  }
);

// Record card revocation
router.post(
  '/revoke',
  [
    body('cardPDA').isString().notEmpty(),
    body('txSignature').isString().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { cardPDA, txSignature } = req.body;

      // Find the recommendation by transaction signature
      const recommendation = await prisma.recommendation.findFirst({
        where: { txSignature: { contains: cardPDA } },
      });

      if (!recommendation) {
        return res.status(404).json({ error: 'Recommendation not found' });
      }

      // Update to revoked
      const updated = await prisma.recommendation.update({
        where: { id: recommendation.id },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });

      // Update recipient's reputation score
      await updateReputationScore(recommendation.recipientId);

      res.json(updated);
    } catch (error) {
      console.error('Error revoking reputation card:', error);
      res.status(500).json({ error: 'Failed to revoke reputation card' });
    }
  }
);

// Get reputation summary for a user
router.get('/summary/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: {
        id: true,
        reputationScore: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get active recommendations
    const recommendations = await prisma.recommendation.findMany({
      where: {
        recipientId: user.id,
        isActive: true,
      },
      include: {
        issuer: {
          select: {
            username: true,
            walletAddress: true,
            isVerified: true,
          },
        },
      },
    });

    // Group by type
    const byType = recommendations.reduce((acc, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { revieweeId: user.id },
    });

    const avgReviewRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reputationScore: user.reputationScore,
      isVerified: user.isVerified,
      totalRecommendations: recommendations.length,
      recommendationsByType: byType,
      totalReviews: reviews.length,
      averageReviewRating: avgReviewRating,
      recommendations: recommendations.map(r => ({
        id: r.id,
        type: r.type,
        message: r.message,
        issuer: r.issuer,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching reputation summary:', error);
    res.status(500).json({ error: 'Failed to fetch reputation summary' });
  }
});

// Sync on-chain cards to database
router.post('/sync/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    // TODO: Implement full sync from on-chain program
    // 1. Fetch all cards from reputation_card program
    // 2. Compare with database records
    // 3. Add missing cards
    // 4. Update status of existing cards
    // 5. Recalculate reputation score

    res.json({
      message: 'Sync functionality will be implemented after program deployment',
      walletAddress,
    });
  } catch (error) {
    console.error('Error syncing reputation cards:', error);
    res.status(500).json({ error: 'Failed to sync reputation cards' });
  }
});

// Helper function to update reputation score
async function updateReputationScore(userId: string): Promise<void> {
  try {
    // Get all active recommendations
    const recommendations = await prisma.recommendation.findMany({
      where: {
        recipientId: userId,
        isActive: true,
      },
    });

    // Get all reviews
    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
    });

    // Calculate weighted score
    // Recommendations: 0.4 weight (count-based)
    // Reviews: 0.6 weight (rating-based)
    
    const recScore = Math.min(recommendations.length * 0.5, 5); // Max 5 from recommendations
    const reviewScore = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const finalScore = (recScore * 0.4) + (reviewScore * 0.6);

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: { reputationScore: finalScore },
    });
  } catch (error) {
    console.error('Error updating reputation score:', error);
  }
}

export default router;
