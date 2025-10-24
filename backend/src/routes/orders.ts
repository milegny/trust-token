import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../db/client';
import { OrderStatus } from '@prisma/client';

const router = Router();

// Get all orders for a user (as buyer or seller)
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.query; // 'buyer' or 'seller'

    const where: any = {};
    if (role === 'buyer') {
      where.buyerId = userId;
    } else if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        review: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
router.post(
  '/',
  [
    body('buyerId').isUUID(),
    body('sellerId').isUUID(),
    body('items').isArray().notEmpty(),
    body('items.*.productId').isUUID(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('shippingAddress').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { buyerId, sellerId, items, shippingAddress } = req.body;

      // Verify buyer and seller exist
      const [buyer, seller] = await Promise.all([
        prisma.user.findUnique({ where: { id: buyerId } }),
        prisma.user.findUnique({ where: { id: sellerId } }),
      ]);

      if (!buyer || !seller) {
        return res.status(404).json({ error: 'Buyer or seller not found' });
      }

      // Fetch products and calculate total
      const productIds = items.map((item: any) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        return res.status(404).json({ error: 'One or more products not found' });
      }

      // Check stock availability
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for product: ${product?.name}`,
          });
        }
      }

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = items.map((item: any) => {
        const product = products.find((p) => p.id === item.productId)!;
        totalAmount += product.price * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        };
      });

      // Create order with items
      const order = await prisma.order.create({
        data: {
          buyerId,
          sellerId,
          status: OrderStatus.CREATED,
          totalAmount,
          shippingAddress,
          items: {
            create: orderItems,
          },
        },
        include: {
          buyer: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// Update order status
router.patch(
  '/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn([
      'CREATED',
      'PAID',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'COMPLETED',
      'CANCELLED',
      'REFUNDED',
    ]),
    body('txSignature').optional().isString(),
    body('trackingNumber').optional().isString(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { status, txSignature, trackingNumber } = req.body;

      const updateData: any = { status };

      // Set timestamps based on status
      const now = new Date();
      if (status === 'PAID') {
        updateData.paidAt = now;
        if (txSignature) updateData.txSignature = txSignature;
      } else if (status === 'SHIPPED') {
        updateData.shippedAt = now;
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = now;
      } else if (status === 'COMPLETED') {
        updateData.completedAt = now;
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = now;
      }

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          buyer: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
);

// Cancel order
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'CREATED' && order.status !== 'PAID') {
      return res.status(400).json({
        error: 'Order cannot be cancelled at this stage',
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        buyer: true,
        seller: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
