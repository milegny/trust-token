import { api } from '../config/api';

export interface ReputationCard {
  issuer: string;
  recipient: string;
  cardType: string;
  message: string;
  rating: number;
  status: string;
  issuedAt: string;
  cardNumber: number;
  revokedAt?: string;
  revocationReason?: string;
  disputeReason?: string;
}

export interface ReputationSummary {
  walletAddress: string;
  totalCards: number;
  activeCards: number;
  revokedCards: number;
  disputedCards: number;
  averageRating: number;
  cardsByType: Record<string, number>;
  recentCards: ReputationCard[];
}

export interface TrustTokenInfo {
  hasTrustToken: boolean;
  mintAddress?: string;
  isVerified?: boolean;
  mintedAt?: string;
}

/**
 * Get reputation cards for a wallet address
 */
export async function getReputationCards(
  walletAddress: string
): Promise<ReputationCard[]> {
  try {
    const response = await api.get(`/reputationcards/onchain/${walletAddress}`);
    return response.data.cards || [];
  } catch (error) {
    console.error('Error fetching reputation cards:', error);
    return [];
  }
}

/**
 * Get reputation summary for a wallet address
 */
export async function getReputationSummary(
  walletAddress: string
): Promise<ReputationSummary | null> {
  try {
    const response = await api.get(`/reputationcards/summary/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reputation summary:', error);
    return null;
  }
}

/**
 * Get TrustToken information for a wallet address
 */
export async function getTrustTokenInfo(
  walletAddress: string
): Promise<TrustTokenInfo> {
  try {
    const response = await api.get(`/trusttoken/user/${walletAddress}`);
    return {
      hasTrustToken: response.data.hasTrustToken,
      mintAddress: response.data.mintAddress,
      isVerified: response.data.isVerified,
      mintedAt: response.data.mintedAt,
    };
  } catch (error) {
    console.error('Error fetching TrustToken info:', error);
    return { hasTrustToken: false };
  }
}

/**
 * Create a new reputation card (on-chain transaction)
 */
export async function createReputationCard(data: {
  issuerWallet: string;
  recipientWallet: string;
  cardType: string;
  message: string;
  rating: number;
  txSignature: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/reputationcards/record', data);
    return { success: true };
  } catch (error: any) {
    console.error('Error recording reputation card:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to record reputation card',
    };
  }
}

/**
 * Revoke a reputation card
 */
export async function revokeReputationCard(data: {
  cardPDA: string;
  issuerWallet: string;
  reason?: string;
  txSignature: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await api.post('/reputationcards/revoke', data);
    return { success: true };
  } catch (error: any) {
    console.error('Error revoking reputation card:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to revoke reputation card',
    };
  }
}

/**
 * Sync reputation cards from blockchain
 */
export async function syncReputationCards(
  walletAddress: string
): Promise<{ success: boolean; synced: number; error?: string }> {
  try {
    const response = await api.post(`/reputationcards/sync/${walletAddress}`);
    return {
      success: true,
      synced: response.data.synced || 0,
    };
  } catch (error: any) {
    console.error('Error syncing reputation cards:', error);
    return {
      success: false,
      synced: 0,
      error: error.response?.data?.error || 'Failed to sync reputation cards',
    };
  }
}

/**
 * Get reputation cards issued by a wallet
 */
export async function getIssuedCards(
  walletAddress: string
): Promise<ReputationCard[]> {
  try {
    const response = await api.get(`/reputationcards/issued/${walletAddress}`);
    return response.data.cards || [];
  } catch (error) {
    console.error('Error fetching issued cards:', error);
    return [];
  }
}

/**
 * Get reputation cards received by a wallet
 */
export async function getReceivedCards(
  walletAddress: string
): Promise<ReputationCard[]> {
  try {
    const response = await api.get(`/reputationcards/received/${walletAddress}`);
    return response.data.cards || [];
  } catch (error) {
    console.error('Error fetching received cards:', error);
    return [];
  }
}

/**
 * Calculate reputation metrics from cards and reviews
 */
export async function calculateReputation(
  walletAddress: string
): Promise<{
  overallScore: number;
  cardScore: number;
  reviewScore: number;
  totalCards: number;
  activeCards: number;
  totalReviews: number;
}> {
  try {
    // Get reputation cards
    const cards = await getReputationCards(walletAddress);
    const activeCards = cards.filter(card => card.status === 'active');
    
    // Calculate card score
    const cardScore = activeCards.length > 0
      ? activeCards.reduce((sum, card) => sum + card.rating, 0) / activeCards.length
      : 0;

    // Get reviews (from existing API)
    const reviewsResponse = await api.get(`/reviews/user/${walletAddress}`);
    const reviews = reviewsResponse.data || [];
    
    // Calculate review score
    const reviewScore = reviews.length > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0;

    // Weighted average: 60% cards, 40% reviews
    let overallScore = 0;
    if (activeCards.length > 0 && reviews.length > 0) {
      overallScore = (cardScore * 0.6) + (reviewScore * 0.4);
    } else if (activeCards.length > 0) {
      overallScore = cardScore;
    } else if (reviews.length > 0) {
      overallScore = reviewScore;
    }

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      cardScore: Math.round(cardScore * 10) / 10,
      reviewScore: Math.round(reviewScore * 10) / 10,
      totalCards: cards.length,
      activeCards: activeCards.length,
      totalReviews: reviews.length,
    };
  } catch (error) {
    console.error('Error calculating reputation:', error);
    return {
      overallScore: 0,
      cardScore: 0,
      reviewScore: 0,
      totalCards: 0,
      activeCards: 0,
      totalReviews: 0,
    };
  }
}

export default {
  getReputationCards,
  getReputationSummary,
  getTrustTokenInfo,
  createReputationCard,
  revokeReputationCard,
  syncReputationCards,
  getIssuedCards,
  getReceivedCards,
  calculateReputation,
};
