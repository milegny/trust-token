import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
    update: {},
    create: {
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      username: 'alice_seller',
      email: 'alice@example.com',
      bio: 'Trusted seller of electronics and gadgets',
      isVerified: true,
      reputationScore: 4.8,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { walletAddress: '8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV' },
    update: {},
    create: {
      walletAddress: '8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV',
      username: 'bob_buyer',
      email: 'bob@example.com',
      bio: 'Tech enthusiast and collector',
      isVerified: false,
      reputationScore: 4.5,
    },
  });

  console.log('✅ Created users:', { user1: user1.username, user2: user2.username });

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      sellerId: user1.id,
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 0.5,
      currency: 'SOL',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944',
      ],
      stock: 10,
      isActive: true,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sellerId: user1.id,
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB mechanical keyboard with Cherry MX switches',
      price: 0.8,
      currency: 'SOL',
      category: 'Electronics',
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
      ],
      stock: 5,
      isActive: true,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      sellerId: user1.id,
      name: 'Vintage Leather Wallet',
      description: 'Handcrafted genuine leather wallet',
      price: 0.2,
      currency: 'SOL',
      category: 'Fashion',
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93',
      ],
      stock: 15,
      isActive: true,
    },
  });

  console.log('✅ Created products:', {
    product1: product1.name,
    product2: product2.name,
    product3: product3.name,
  });

  // Create a sample order
  const order1 = await prisma.order.create({
    data: {
      buyerId: user2.id,
      sellerId: user1.id,
      status: 'COMPLETED',
      totalAmount: 0.5,
      currency: 'SOL',
      shippingAddress: '123 Main St, San Francisco, CA 94102',
      txSignature: 'sample_tx_signature_123',
      paidAt: new Date('2024-01-15'),
      shippedAt: new Date('2024-01-16'),
      deliveredAt: new Date('2024-01-20'),
      completedAt: new Date('2024-01-21'),
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            priceAtPurchase: 0.5,
          },
        ],
      },
    },
  });

  console.log('✅ Created order:', order1.id);

  // Create a sample review
  const review1 = await prisma.review.create({
    data: {
      orderId: order1.id,
      reviewerId: user2.id,
      revieweeId: user1.id,
      rating: 5,
      comment: 'Excellent product and fast shipping! Highly recommended.',
    },
  });

  console.log('✅ Created review:', review1.id);

  // Create a sample recommendation
  const recommendation1 = await prisma.recommendation.create({
    data: {
      issuerId: user2.id,
      recipientId: user1.id,
      type: 'TRUSTWORTHY',
      message: 'Alice is a trustworthy seller with great products.',
      isActive: true,
    },
  });

  console.log('✅ Created recommendation:', recommendation1.id);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
