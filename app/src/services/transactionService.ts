import { api } from '../config/api';

export interface TransactionData {
  orderId: string;
  buyerWallet: string;
  sellerWallet: string;
  amount: number;
  currency: string;
  txSignature: string;
  status: string;
}

export interface OrderStatusUpdate {
  status: 'CREATED' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  txSignature?: string;
  trackingNumber?: string;
}

/**
 * Record a transaction in the backend
 */
export async function recordTransaction(
  data: TransactionData
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post('/transactions/record', data);
    return { success: true };
  } catch (error: any) {
    console.error('Error recording transaction:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to record transaction',
    };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  update: OrderStatusUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.patch(`/orders/${orderId}/status`, update);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update order status',
    };
  }
}

/**
 * Get order details
 */
export async function getOrder(orderId: string): Promise<any> {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(
  walletAddress: string,
  type: 'buyer' | 'seller' = 'buyer'
): Promise<any[]> {
  try {
    const response = await api.get(`/orders/user/${walletAddress}`, {
      params: { type },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

/**
 * Confirm delivery
 */
export async function confirmDelivery(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post(`/orders/${orderId}/confirm-delivery`);
    return { success: true };
  } catch (error: any) {
    console.error('Error confirming delivery:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to confirm delivery',
    };
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post(`/orders/${orderId}/cancel`, { reason });
    return { success: true };
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to cancel order',
    };
  }
}

/**
 * Request refund
 */
export async function requestRefund(
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post(`/orders/${orderId}/refund`, { reason });
    return { success: true };
  } catch (error: any) {
    console.error('Error requesting refund:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to request refund',
    };
  }
}

/**
 * Get pending transactions for a user
 */
export async function getPendingTransactions(
  walletAddress: string
): Promise<any[]> {
  try {
    const response = await api.get(`/transactions/pending/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    return [];
  }
}

/**
 * Mark transaction as completed
 */
export async function completeTransaction(
  orderId: string,
  reputationCardTxSignature?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.post(`/orders/${orderId}/complete`, {
      reputationCardTxSignature,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error completing transaction:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to complete transaction',
    };
  }
}

/**
 * Get transaction statistics for a user
 */
export async function getTransactionStats(
  walletAddress: string
): Promise<{
  totalPurchases: number;
  totalSales: number;
  totalSpent: number;
  totalEarned: number;
  pendingOrders: number;
  completedOrders: number;
}> {
  try {
    const response = await api.get(`/transactions/stats/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return {
      totalPurchases: 0,
      totalSales: 0,
      totalSpent: 0,
      totalEarned: 0,
      pendingOrders: 0,
      completedOrders: 0,
    };
  }
}

/**
 * Verify transaction on blockchain
 */
export async function verifyTransaction(
  txSignature: string
): Promise<{
  verified: boolean;
  amount?: number;
  from?: string;
  to?: string;
  timestamp?: number;
}> {
  try {
    const response = await api.get(`/transactions/verify/${txSignature}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { verified: false };
  }
}

export default {
  recordTransaction,
  updateOrderStatus,
  getOrder,
  getUserOrders,
  confirmDelivery,
  cancelOrder,
  requestRefund,
  getPendingTransactions,
  completeTransaction,
  getTransactionStats,
  verifyTransaction,
};
