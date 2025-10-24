/**
 * Reputation calculation utilities
 * Calculates reputation scores based on various factors
 */

export interface ReputationCard {
  cardType: string;
  rating: number;
  status: string;
  issuedAt: Date;
  issuer: string;
}

export interface Review {
  rating: number;
  createdAt: string;
}

export interface ReputationMetrics {
  overallScore: number;
  cardScore: number;
  reviewScore: number;
  totalCards: number;
  activeCards: number;
  totalReviews: number;
  averageRating: number;
  reputationLevel: string;
  trustLevel: 'excellent' | 'very-good' | 'good' | 'fair' | 'new';
}

/**
 * Calculate overall reputation score
 * Combines reputation cards and reviews with weighted average
 */
export function calculateReputationScore(
  cards: ReputationCard[],
  reviews: Review[],
  hasTrustToken: boolean = false
): ReputationMetrics {
  const activeCards = cards.filter(card => card.status === 'active');
  
  // Calculate card score (average of all active card ratings)
  const cardScore = activeCards.length > 0
    ? activeCards.reduce((sum, card) => sum + card.rating, 0) / activeCards.length
    : 0;

  // Calculate review score (average of all review ratings)
  const reviewScore = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Weighted average: 60% cards, 40% reviews
  // Cards are more important as they're on-chain and harder to fake
  let overallScore = 0;
  if (activeCards.length > 0 && reviews.length > 0) {
    overallScore = (cardScore * 0.6) + (reviewScore * 0.4);
  } else if (activeCards.length > 0) {
    overallScore = cardScore;
  } else if (reviews.length > 0) {
    overallScore = reviewScore;
  }

  // Bonus for having TrustToken (adds 0.1 to score, max 5.0)
  if (hasTrustToken && overallScore > 0) {
    overallScore = Math.min(5.0, overallScore + 0.1);
  }

  const trustLevel = getTrustLevel(overallScore);

  return {
    overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal
    cardScore: Math.round(cardScore * 10) / 10,
    reviewScore: Math.round(reviewScore * 10) / 10,
    totalCards: cards.length,
    activeCards: activeCards.length,
    totalReviews: reviews.length,
    averageRating: overallScore,
    reputationLevel: getReputationLevel(overallScore),
    trustLevel,
  };
}

/**
 * Get reputation level label based on score
 */
export function getReputationLevel(score: number): string {
  if (score >= 4.5) return 'Excellent';
  if (score >= 4.0) return 'Very Good';
  if (score >= 3.5) return 'Good';
  if (score >= 3.0) return 'Fair';
  if (score > 0) return 'Building Reputation';
  return 'New Seller';
}

/**
 * Get trust level based on score
 */
export function getTrustLevel(score: number): 'excellent' | 'very-good' | 'good' | 'fair' | 'new' {
  if (score >= 4.5) return 'excellent';
  if (score >= 4.0) return 'very-good';
  if (score >= 3.5) return 'good';
  if (score >= 3.0) return 'fair';
  return 'new';
}

/**
 * Get reputation color based on score
 */
export function getReputationColor(score: number): string {
  if (score >= 4.5) return '#10b981'; // green
  if (score >= 4.0) return '#14F195'; // solana green
  if (score >= 3.5) return '#3b82f6'; // blue
  if (score >= 3.0) return '#f59e0b'; // amber
  return '#6b7280'; // gray
}

/**
 * Get reputation icon based on score
 */
export function getReputationIcon(score: number): string {
  if (score >= 4.5) return '🌟';
  if (score >= 4.0) return '⭐';
  if (score >= 3.5) return '👍';
  if (score >= 3.0) return '👌';
  return '🆕';
}

/**
 * Calculate reputation trend (comparing recent vs older cards/reviews)
 */
export function calculateReputationTrend(
  cards: ReputationCard[],
  reviews: Review[]
): 'improving' | 'stable' | 'declining' | 'new' {
  const allItems = [
    ...cards.map(c => ({ rating: c.rating, date: c.issuedAt })),
    ...reviews.map(r => ({ rating: r.rating, date: new Date(r.createdAt) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (allItems.length < 5) return 'new';

  const recentItems = allItems.slice(0, Math.floor(allItems.length / 2));
  const olderItems = allItems.slice(Math.floor(allItems.length / 2));

  const recentAvg = recentItems.reduce((sum, item) => sum + item.rating, 0) / recentItems.length;
  const olderAvg = olderItems.reduce((sum, item) => sum + item.rating, 0) / olderItems.length;

  const difference = recentAvg - olderAvg;

  if (difference > 0.3) return 'improving';
  if (difference < -0.3) return 'declining';
  return 'stable';
}

/**
 * Get card type distribution
 */
export function getCardTypeDistribution(cards: ReputationCard[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  cards.forEach(card => {
    if (card.status === 'active') {
      distribution[card.cardType] = (distribution[card.cardType] || 0) + 1;
    }
  });

  return distribution;
}

/**
 * Get top card types (most common)
 */
export function getTopCardTypes(cards: ReputationCard[], limit: number = 3): string[] {
  const distribution = getCardTypeDistribution(cards);
  
  return Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([type]) => type);
}

/**
 * Check if seller meets minimum reputation threshold
 */
export function meetsReputationThreshold(
  score: number,
  threshold: number = 3.0
): boolean {
  return score >= threshold;
}

/**
 * Calculate reputation confidence level
 * Based on number of data points (cards + reviews)
 */
export function getReputationConfidence(
  totalCards: number,
  totalReviews: number
): 'high' | 'medium' | 'low' {
  const totalDataPoints = totalCards + totalReviews;
  
  if (totalDataPoints >= 20) return 'high';
  if (totalDataPoints >= 10) return 'medium';
  return 'low';
}

/**
 * Format reputation score for display
 */
export function formatReputationScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Get reputation badge data
 */
export function getReputationBadge(score: number): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  if (score >= 4.5) {
    return {
      label: 'Excellent',
      color: '#10b981',
      icon: '🌟',
      description: 'Outstanding reputation with consistently high ratings',
    };
  }
  if (score >= 4.0) {
    return {
      label: 'Very Good',
      color: '#14F195',
      icon: '⭐',
      description: 'Very reliable seller with great feedback',
    };
  }
  if (score >= 3.5) {
    return {
      label: 'Good',
      color: '#3b82f6',
      icon: '👍',
      description: 'Good reputation with positive feedback',
    };
  }
  if (score >= 3.0) {
    return {
      label: 'Fair',
      color: '#f59e0b',
      icon: '👌',
      description: 'Fair reputation, building trust',
    };
  }
  return {
    label: 'New Seller',
    color: '#6b7280',
    icon: '🆕',
    description: 'New to the marketplace, building reputation',
  };
}

/**
 * Sort sellers by reputation
 */
export function sortByReputation<T extends { reputationScore: number }>(
  items: T[],
  direction: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    return direction === 'desc'
      ? b.reputationScore - a.reputationScore
      : a.reputationScore - b.reputationScore;
  });
}

/**
 * Filter by minimum reputation
 */
export function filterByMinReputation<T extends { reputationScore: number }>(
  items: T[],
  minScore: number
): T[] {
  return items.filter(item => item.reputationScore >= minScore);
}
