import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '../db/client';

const router = Router();

// Get all products with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sellerId,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: {
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
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            avatarUrl: true,
            reputationScore: true,
            isVerified: true,
            reviewsReceived: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post(
  '/',
  [
    body('sellerId').isUUID(),
    body('name').isString().notEmpty().isLength({ max: 200 }),
    body('description').isString().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('currency').optional().isString(),
    body('category').isString().notEmpty(),
    body('images').isArray(),
    body('stock').isInt({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        sellerId,
        name,
        description,
        price,
        currency,
        category,
        images,
        stock,
      } = req.body;

      // Verify seller exists and is verified
      const seller = await prisma.user.findUnique({
        where: { id: sellerId },
      });

      if (!seller) {
        return res.status(404).json({ error: 'Seller not found' });
      }

      if (!seller.isVerified) {
        return res.status(403).json({ error: 'Seller must be verified to list products' });
      }

      const product = await prisma.product.create({
        data: {
          sellerId,
          name,
          description,
          price,
          currency: currency || 'SOL',
          category,
          images,
          stock,
        },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
              reputationScore: true,
            },
          },
        },
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Update product
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().isString().isLength({ max: 200 }),
    body('description').optional().isString(),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().isString(),
    body('images').optional().isArray(),
    body('stock').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              walletAddress: true,
            },
          },
        },
      });

      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// Delete product (soft delete by setting isActive to false)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get product categories
router.get('/meta/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true,
    });

    res.json(
      categories.map((c) => ({
        name: c.category,
        count: c._count,
      }))
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
