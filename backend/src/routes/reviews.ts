import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../db/client';

const router = Router();

// Get reviews for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
        order: {
          select: {
            id: true,
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get review by order ID
router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const review = await prisma.review.findUnique({
      where: { orderId },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Create review
router.post(
  '/',
  [
    body('orderId').isUUID(),
    body('reviewerId').isUUID(),
    body('revieweeId').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 1000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { orderId, reviewerId, revieweeId, rating, comment } = req.body;

      // Verify order exists and is completed
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'COMPLETED' && order.status !== 'DELIVERED') {
        return res.status(400).json({
          error: 'Order must be completed or delivered to leave a review',
        });
      }

      // Verify reviewer is the buyer
      if (order.buyerId !== reviewerId) {
        return res.status(403).json({
          error: 'Only the buyer can review this order',
        });
      }

      // Verify reviewee is the seller
      if (order.sellerId !== revieweeId) {
        return res.status(400).json({
          error: 'Reviewee must be the seller of this order',
        });
      }

      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: { orderId },
      });

      if (existingReview) {
        return res.status(400).json({ error: 'Review already exists for this order' });
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          orderId,
          reviewerId,
          revieweeId,
          rating,
          comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
              avatarUrl: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
        },
      });

      // Update seller's reputation score
      const reviewStats = await prisma.review.aggregate({
        where: { revieweeId },
        _avg: { rating: true },
      });

      await prisma.user.update({
        where: { id: revieweeId },
        data: {
          reputationScore: reviewStats._avg.rating || 0,
        },
      });

      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }
);

// Update review
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 1000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await prisma.review.update({
        where: { id },
        data: {
          rating,
          comment,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update seller's reputation score
      const reviewStats = await prisma.review.aggregate({
        where: { revieweeId: review.revieweeId },
        _avg: { rating: true },
      });

      await prisma.user.update({
        where: { id: review.revieweeId },
        data: {
          reputationScore: reviewStats._avg.rating || 0,
        },
      });

      res.json(review);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Failed to update review' });
    }
  }
);

// Delete review
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.review.delete({
      where: { id },
    });

    // Update seller's reputation score
    const reviewStats = await prisma.review.aggregate({
      where: { revieweeId: review.revieweeId },
      _avg: { rating: true },
    });

    await prisma.user.update({
      where: { id: review.revieweeId },
      data: {
        reputationScore: reviewStats._avg.rating || 0,
      },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
