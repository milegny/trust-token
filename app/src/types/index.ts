export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  trustTokenMint?: string;
  isVerified: boolean;
  reputationScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  seller: {
    id: string;
    username?: string;
    walletAddress: string;
    avatarUrl?: string;
    reputationScore: number;
    isVerified: boolean;
  };
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  priceAtPurchase: number;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyer: {
    id: string;
    username?: string;
    walletAddress: string;
    avatarUrl?: string;
  };
  sellerId: string;
  seller: {
    id: string;
    username?: string;
    walletAddress: string;
    avatarUrl?: string;
  };
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  shippingAddress?: string;
  trackingNumber?: string;
  txSignature?: string;
  escrowAccount?: string;
  items: OrderItem[];
  review?: Review;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewer: {
    id: string;
    username?: string;
    walletAddress: string;
    avatarUrl?: string;
  };
  revieweeId: string;
  reviewee: {
    id: string;
    username?: string;
    walletAddress: string;
    avatarUrl?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export enum RecommendationType {
  TRUSTWORTHY = 'TRUSTWORTHY',
  QUALITY_PRODUCTS = 'QUALITY_PRODUCTS',
  FAST_SHIPPING = 'FAST_SHIPPING',
  GOOD_COMMUNICATION = 'GOOD_COMMUNICATION',
  FAIR_PRICING = 'FAIR_PRICING',
}

export interface Recommendation {
  id: string;
  issuerId: string;
  issuer: {
    id: string;
    username?: string;
    walletAddress: string;
    avatarUrl?: string;
    reputationScore: number;
    isVerified: boolean;
  };
  recipientId: string;
  type: RecommendationType;
  message?: string;
  isActive: boolean;
  txSignature?: string;
  createdAt: string;
  revokedAt?: string;
}

export interface TrustToken {
  id: string;
  userId: string;
  mintAddress: string;
  name: string;
  symbol: string;
  uri: string;
  isVerified: boolean;
  mintedAt: string;
  revokedAt?: string;
  txSignature?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
