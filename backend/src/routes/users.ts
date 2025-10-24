import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../db/client';

const router = Router();

// Get user by wallet address
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      include: {
        products: {
          where: { isActive: true },
          take: 10,
        },
        reviewsReceived: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        recommendationsReceived: {
          where: { isActive: true },
          include: {
            issuer: {
              select: {
                username: true,
                walletAddress: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
        },
        reviewsReceived: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create or update user
router.post(
  '/',
  [
    body('walletAddress').isString().notEmpty(),
    body('username').optional().isString(),
    body('email').optional().isEmail(),
    body('bio').optional().isString(),
    body('avatarUrl').optional().isURL(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { walletAddress, username, email, bio, avatarUrl } = req.body;

      const user = await prisma.user.upsert({
        where: { walletAddress },
        update: {
          username,
          email,
          bio,
          avatarUrl,
        },
        create: {
          walletAddress,
          username,
          email,
          bio,
          avatarUrl,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ error: 'Failed to create/update user' });
    }
  }
);

// Update user profile
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('username').optional().isString(),
    body('email').optional().isEmail(),
    body('bio').optional().isString(),
    body('avatarUrl').optional().isURL(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { username, email, bio, avatarUrl } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: {
          username,
          email,
          bio,
          avatarUrl,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// Get user's reputation stats
router.get('/:id/reputation', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        reputationScore: true,
        isVerified: true,
        trustTokenMint: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const reviewStats = await prisma.review.aggregate({
      where: { revieweeId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const recommendations = await prisma.recommendation.groupBy({
      by: ['type'],
      where: {
        recipientId: id,
        isActive: true,
      },
      _count: true,
    });

    res.json({
      reputationScore: user.reputationScore,
      isVerified: user.isVerified,
      hasTrustToken: !!user.trustTokenMint,
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count.rating,
      recommendations: recommendations.map((r) => ({
        type: r.type,
        count: r._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching reputation:', error);
    res.status(500).json({ error: 'Failed to fetch reputation' });
  }
});

export default router;
