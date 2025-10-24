import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../db/client';
import solanaService from '../services/solana';

const router = Router();

// Verify TrustToken by mint address
router.get('/verify/:mintAddress', async (req: Request, res: Response) => {
  try {
    const { mintAddress } = req.params;

    const verification = await solanaService.verifyTrustToken(mintAddress);

    if (!verification.exists) {
      return res.status(404).json({ error: 'TrustToken not found' });
    }

    // Check if it exists in our database
    const dbToken = await prisma.trustToken.findUnique({
      where: { mintAddress },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            reputationScore: true,
          },
        },
      },
    });

    res.json({
      ...verification,
      database: dbToken || null,
    });
  } catch (error) {
    console.error('Error verifying trust token:', error);
    res.status(500).json({ error: 'Failed to verify trust token' });
  }
});

// Get TrustToken for a user by wallet address
router.get('/user/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    const tokenInfo = await solanaService.getUserTrustToken(walletAddress);

    if (!tokenInfo.hasTrustToken) {
      return res.json({
        hasTrustToken: false,
        message: 'No TrustToken found for this wallet',
      });
    }

    // Get database record
    const dbToken = await prisma.trustToken.findUnique({
      where: { mintAddress: tokenInfo.mintAddress },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            reputationScore: true,
            isVerified: true,
          },
        },
      },
    });

    res.json({
      ...tokenInfo,
      database: dbToken || null,
    });
  } catch (error) {
    console.error('Error getting user trust token:', error);
    res.status(500).json({ error: 'Failed to get user trust token' });
  }
});

// Record TrustToken mint in database
router.post(
  '/record-mint',
  [
    body('userId').isUUID(),
    body('mintAddress').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('symbol').isString().notEmpty(),
    body('uri').isString().notEmpty(),
    body('txSignature').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, mintAddress, name, symbol, uri, txSignature } = req.body;

      // Verify the token exists on-chain
      const verification = await solanaService.verifyTrustToken(mintAddress);
      if (!verification.exists) {
        return res.status(400).json({ error: 'TrustToken not found on blockchain' });
      }

      // Check if already recorded
      const existing = await prisma.trustToken.findUnique({
        where: { mintAddress },
      });

      if (existing) {
        return res.status(400).json({ error: 'TrustToken already recorded' });
      }

      // Create database record
      const trustToken = await prisma.trustToken.create({
        data: {
          userId,
          mintAddress,
          name,
          symbol,
          uri,
          isVerified: verification.isVerified,
          txSignature,
        },
      });

      // Update user record
      await prisma.user.update({
        where: { id: userId },
        data: {
          trustTokenMint: mintAddress,
          isVerified: verification.isVerified,
        },
      });

      res.status(201).json(trustToken);
    } catch (error) {
      console.error('Error recording trust token mint:', error);
      res.status(500).json({ error: 'Failed to record trust token mint' });
    }
  }
);

// Update TrustToken verification status
router.patch(
  '/:id/verification',
  [
    param('id').isUUID(),
    body('isVerified').isBoolean(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { isVerified } = req.body;

      const trustToken = await prisma.trustToken.update({
        where: { id },
        data: {
          isVerified,
          revokedAt: isVerified ? null : new Date(),
        },
      });

      // Update user verification status
      await prisma.user.update({
        where: { id: trustToken.userId },
        data: { isVerified },
      });

      res.json(trustToken);
    } catch (error) {
      console.error('Error updating trust token verification:', error);
      res.status(500).json({ error: 'Failed to update trust token verification' });
    }
  }
);

// Get program statistics
router.get('/stats/program', async (req: Request, res: Response) => {
  try {
    const stats = await solanaService.getProgramStats();
    
    const dbStats = await prisma.trustToken.aggregate({
      _count: true,
      where: { isVerified: true },
    });

    res.json({
      onChain: stats,
      database: {
        totalRecorded: dbStats._count,
      },
    });
  } catch (error) {
    console.error('Error getting program stats:', error);
    res.status(500).json({ error: 'Failed to get program stats' });
  }
});

// Get transaction details
router.get('/transaction/:signature', async (req: Request, res: Response) => {
  try {
    const { signature } = req.params;
    
    const tx = await solanaService.getTransactionDetails(signature);
    
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(tx);
  } catch (error) {
    console.error('Error getting transaction details:', error);
    res.status(500).json({ error: 'Failed to get transaction details' });
  }
});

export default router;
