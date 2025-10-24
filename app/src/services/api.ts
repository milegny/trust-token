import api from '../config/api';
import { User, Product, Order, Review, Recommendation, TrustToken } from '../types';

// Users
export const getUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const getUserByWallet = async (address: string): Promise<User> => {
  const response = await api.get(`/users/wallet/${address}`);
  return response.data;
};

export const createOrUpdateUser = async (userData: Partial<User>): Promise<User> => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const getUserReputation = async (id: string) => {
  const response = await api.get(`/users/${id}/reputation`);
  return response.data;
};

// Products
export const getProducts = async (params?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sellerId?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; pagination: any }> => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const getCategories = async (): Promise<{ name: string; count: number }[]> => {
  const response = await api.get('/products/meta/categories');
  return response.data;
};

// Orders
export const getUserOrders = async (userId: string, role?: 'buyer' | 'seller'): Promise<Order[]> => {
  const response = await api.get(`/orders/user/${userId}`, { params: { role } });
  return response.data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (orderData: {
  buyerId: string;
  sellerId: string;
  items: { productId: string; quantity: number }[];
  shippingAddress?: string;
}): Promise<Order> => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const updateOrderStatus = async (
  id: string,
  status: string,
  data?: { txSignature?: string; trackingNumber?: string }
): Promise<Order> => {
  const response = await api.patch(`/orders/${id}/status`, { status, ...data });
  return response.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await api.post(`/orders/${id}/cancel`);
  return response.data;
};

// Reviews
export const getUserReviews = async (userId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};

export const getOrderReview = async (orderId: string): Promise<Review> => {
  const response = await api.get(`/reviews/order/${orderId}`);
  return response.data;
};

export const createReview = async (reviewData: {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}): Promise<Review> => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const updateReview = async (
  id: string,
  reviewData: { rating?: number; comment?: string }
): Promise<Review> => {
  const response = await api.put(`/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(`/reviews/${id}`);
};

// Recommendations
export const getUserRecommendations = async (userId: string, active?: boolean): Promise<Recommendation[]> => {
  const response = await api.get(`/recommendations/user/${userId}`, {
    params: { active },
  });
  return response.data;
};

export const getRecommendation = async (id: string): Promise<Recommendation> => {
  const response = await api.get(`/recommendations/${id}`);
  return response.data;
};

export const createRecommendation = async (recommendationData: {
  issuerId: string;
  recipientId: string;
  type: string;
  message?: string;
  txSignature?: string;
}): Promise<Recommendation> => {
  const response = await api.post('/recommendations', recommendationData);
  return response.data;
};

export const revokeRecommendation = async (id: string): Promise<Recommendation> => {
  const response = await api.post(`/recommendations/${id}/revoke`);
  return response.data;
};

export const restoreRecommendation = async (id: string): Promise<Recommendation> => {
  const response = await api.post(`/recommendations/${id}/restore`);
  return response.data;
};

export const getRecommendationStats = async (userId: string) => {
  const response = await api.get(`/recommendations/stats/${userId}`);
  return response.data;
};

// TrustToken
export const verifyTrustToken = async (mintAddress: string) => {
  const response = await api.get(`/trusttoken/verify/${mintAddress}`);
  return response.data;
};

export const getUserTrustToken = async (walletAddress: string) => {
  const response = await api.get(`/trusttoken/user/${walletAddress}`);
  return response.data;
};

export const recordTrustTokenMint = async (tokenData: {
  userId: string;
  mintAddress: string;
  name: string;
  symbol: string;
  uri: string;
  txSignature?: string;
}): Promise<TrustToken> => {
  const response = await api.post('/trusttoken/record-mint', tokenData);
  return response.data;
};

export const updateTrustTokenVerification = async (
  id: string,
  isVerified: boolean
): Promise<TrustToken> => {
  const response = await api.patch(`/trusttoken/${id}/verification`, { isVerified });
  return response.data;
};

export const getTrustTokenStats = async () => {
  const response = await api.get('/trusttoken/stats/program');
  return response.data;
};

export const getTransaction = async (signature: string) => {
  const response = await api.get(`/trusttoken/transaction/${signature}`);
  return response.data;
};
