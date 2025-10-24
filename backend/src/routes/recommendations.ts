import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../db/client';
import { RecommendationType } from '@prisma/client';

const router = Router();

// Get recommendations for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { active } = req.query;

    const where: any = { recipientId: userId };
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const recommendations = await prisma.recommendation.findMany({
      where,
      include: {
        issuer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
            reputationScore: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get recommendation by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: {
        issuer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
        recipient: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation' });
  }
});

// Create recommendation
router.post(
  '/',
  [
    body('issuerId').isUUID(),
    body('recipientId').isUUID(),
    body('type').isIn([
      'TRUSTWORTHY',
      'QUALITY_PRODUCTS',
      'FAST_SHIPPING',
      'GOOD_COMMUNICATION',
      'FAIR_PRICING',
    ]),
    body('message').optional().isString().isLength({ max: 500 }),
    body('txSignature').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { issuerId, recipientId, type, message, txSignature } = req.body;

      // Verify issuer and recipient exist
      const [issuer, recipient] = await Promise.all([
        prisma.user.findUnique({ where: { id: issuerId } }),
        prisma.user.findUnique({ where: { id: recipientId } }),
      ]);

      if (!issuer || !recipient) {
        return res.status(404).json({ error: 'Issuer or recipient not found' });
      }

      // Check if issuer has completed transactions with recipient
      const hasTransaction = await prisma.order.findFirst({
        where: {
          OR: [
            { buyerId: issuerId, sellerId: recipientId },
            { buyerId: recipientId, sellerId: issuerId },
          ],
          status: 'COMPLETED',
        },
      });

      if (!hasTransaction) {
        return res.status(400).json({
          error: 'You must have completed a transaction with this user to recommend them',
        });
      }

      const recommendation = await prisma.recommendation.create({
        data: {
          issuerId,
          recipientId,
          type: type as RecommendationType,
          message,
          txSignature,
          isActive: true,
        },
        include: {
          issuer: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
              avatarUrl: true,
            },
          },
          recipient: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
        },
      });

      res.status(201).json(recommendation);
    } catch (error) {
      console.error('Error creating recommendation:', error);
      res.status(500).json({ error: 'Failed to create recommendation' });
    }
  }
);

// Revoke recommendation
router.post('/:id/revoke', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const recommendation = await prisma.recommendation.update({
      where: { id },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
      include: {
        issuer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
        recipient: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
      },
    });

    res.json(recommendation);
  } catch (error) {
    console.error('Error revoking recommendation:', error);
    res.status(500).json({ error: 'Failed to revoke recommendation' });
  }
});

// Restore recommendation
router.post('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const recommendation = await prisma.recommendation.update({
      where: { id },
      data: {
        isActive: true,
        revokedAt: null,
      },
      include: {
        issuer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
        recipient: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
      },
    });

    res.json(recommendation);
  } catch (error) {
    console.error('Error restoring recommendation:', error);
    res.status(500).json({ error: 'Failed to restore recommendation' });
  }
});

// Get recommendation statistics
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await prisma.recommendation.groupBy({
      by: ['type'],
      where: {
        recipientId: userId,
        isActive: true,
      },
      _count: true,
    });

    const total = await prisma.recommendation.count({
      where: {
        recipientId: userId,
        isActive: true,
      },
    });

    res.json({
      total,
      byType: stats.map((s) => ({
        type: s.type,
        count: s._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching recommendation stats:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation stats' });
  }
});

export default router;
