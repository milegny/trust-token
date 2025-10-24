export enum CommissionTier {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

export const COMMISSION_RATES = {
  [CommissionTier.STANDARD]: 0.025, // 2.5%
  [CommissionTier.PREMIUM]: 0.04,   // 4.0%
} as const;

export enum FundAllocation {
  OPERATIONS = 'OPERATIONS',
  INSURANCE = 'INSURANCE',
  MODERATION = 'MODERATION',
  FOUNDER = 'FOUNDER',
}

export const ALLOCATION_PERCENTAGES = {
  [FundAllocation.OPERATIONS]: 0.15,   // 15%
  [FundAllocation.INSURANCE]: 0.25,    // 25%
  [FundAllocation.MODERATION]: 0.25,   // 25%
  [FundAllocation.FOUNDER]: 0.35,      // 35%
} as const;

export enum ModeratorLevel {
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  ELITE = 'ELITE',
}

export const MODERATOR_LEVEL_MULTIPLIERS = {
  [ModeratorLevel.JUNIOR]: 1.0,
  [ModeratorLevel.SENIOR]: 1.5,
  [ModeratorLevel.ELITE]: 2.0,
} as const;

export const BASE_DISPUTE_REWARD = 0.1; // 0.1 SOL per dispute resolved

export enum PremiumFeature {
  VERIFICATION_PLUS = 'VERIFICATION_PLUS',
  ANALYTICS_PRO = 'ANALYTICS_PRO',
  REPUTATION_BOOST = 'REPUTATION_BOOST',
}

export const PREMIUM_FEATURE_PRICES = {
  [PremiumFeature.VERIFICATION_PLUS]: 5,    // 5 SOL one-time
  [PremiumFeature.ANALYTICS_PRO]: 10,       // 10 SOL per month
  [PremiumFeature.REPUTATION_BOOST]: 2,     // 2 SOL for 30 days
} as const;

export enum StakingTier {
  NONE = 'NONE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
}

export const STAKING_REQUIREMENTS = {
  [StakingTier.NONE]: 0,
  [StakingTier.BRONZE]: 10,    // 10 SOL
  [StakingTier.SILVER]: 50,    // 50 SOL
  [StakingTier.GOLD]: 100,     // 100 SOL
} as const;

export const STAKING_DISCOUNTS = {
  [StakingTier.NONE]: 0,
  [StakingTier.BRONZE]: 0.005,   // 0.5% discount
  [StakingTier.SILVER]: 0.01,    // 1.0% discount
  [StakingTier.GOLD]: 0.015,     // 1.5% discount
} as const;

export const WEEKLY_STAKING_APY = 0.08; // 8% APY

export interface TreasuryBalance {
  total: number;
  operations: number;
  insurance: number;
  moderation: number;
  founder: number;
  lastUpdated: Date;
}

export interface RevenueStream {
  id: string;
  source: 'COMMISSION' | 'PREMIUM_FEATURE' | 'INSURANCE_CLAIM_FEE';
  amount: number;
  txSignature: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface FundDistribution {
  id: string;
  amount: number;
  allocation: FundAllocation;
  txSignature: string;
  timestamp: Date;
  description: string;
}

export interface ModeratorEarnings {
  moderatorWallet: string;
  level: ModeratorLevel;
  disputesResolved: number;
  totalEarned: number;
  currentMonthEarned: number;
  points: number;
  badges: string[];
  rank: number;
}

export interface InsuranceClaim {
  id: string;
  claimantWallet: string;
  orderId: string;
  amount: number;
  reason: string;
  evidence: string[];
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';
  votesFor: number;
  votesAgainst: number;
  voters: string[];
  createdAt: Date;
  resolvedAt?: Date;
  txSignature?: string;
}

export interface InsurancePoolStats {
  totalBalance: number;
  totalClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalPaidOut: number;
  averageClaimAmount: number;
  coverageLimit: number;
}

export interface StakingPosition {
  wallet: string;
  amount: number;
  tier: StakingTier;
  stakedAt: Date;
  lastRewardClaim: Date;
  totalRewardsEarned: number;
  pendingRewards: number;
}

export interface PremiumFeaturePurchase {
  id: string;
  wallet: string;
  feature: PremiumFeature;
  price: number;
  purchasedAt: Date;
  expiresAt?: Date;
  txSignature: string;
  active: boolean;
}

export interface TransparencyMetrics {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  revenueBySource: Record<string, number>;
  totalDistributed: number;
  distributionByAllocation: Record<FundAllocation, number>;
  activeUsers: number;
  totalTransactions: number;
  averageCommission: number;
  insurancePoolGrowth: number;
  moderatorPayouts: number;
  stakingRewards: number;
}

export interface FinancialReport {
  id: string;
  type: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  period: string;
  generatedAt: Date;
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    treasuryGrowth: number;
  };
  revenueBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
  keyMetrics: {
    activeUsers: number;
    transactionVolume: number;
    averageTransactionValue: number;
    commissionRate: number;
    insuranceClaimRate: number;
    moderatorEfficiency: number;
  };
  recommendations?: string[];
}

export interface CommissionCalculation {
  transactionAmount: number;
  tier: CommissionTier;
  baseCommission: number;
  stakingDiscount: number;
  finalCommission: number;
  breakdown: {
    operations: number;
    insurance: number;
    moderation: number;
    founder: number;
  };
}

export interface ModeratorReward {
  moderatorWallet: string;
  disputeId: string;
  baseReward: number;
  levelMultiplier: number;
  bonusMultiplier: number;
  totalReward: number;
  timestamp: Date;
  txSignature?: string;
}

export interface TreasuryTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'DISTRIBUTION' | 'TRANSFER';
  amount: number;
  from?: string;
  to?: string;
  category: string;
  description: string;
  txSignature: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RewardRedemption {
  id: string;
  moderatorWallet: string;
  pointsSpent: number;
  rewardType: string;
  rewardValue: number;
  redeemedAt: Date;
  txSignature?: string;
}

export const INSURANCE_COVERAGE_LIMITS = {
  MIN_CLAIM: 0.1,      // 0.1 SOL minimum
  MAX_CLAIM: 100,      // 100 SOL maximum
  PERCENTAGE: 0.8,     // 80% of transaction value
} as const;

export const CLAIM_VOTING_THRESHOLDS = {
  MIN_VOTES: 3,
  APPROVAL_PERCENTAGE: 0.66, // 66% approval needed
  VOTING_PERIOD_HOURS: 72,   // 72 hours to vote
} as const;

export const MODERATOR_REWARD_BONUSES = {
  FAST_RESOLUTION: 1.2,      // 20% bonus for resolving within 24h
  QUALITY_RESOLUTION: 1.3,   // 30% bonus for high-quality resolution
  COMPLEX_CASE: 1.5,         // 50% bonus for complex disputes
  WEEKEND_WORK: 1.1,         // 10% bonus for weekend work
} as const;

export const POINT_REDEMPTION_OPTIONS = [
  { id: 'sol_reward', name: 'SOL Reward', pointsCost: 1000, value: 1 },
  { id: 'commission_discount', name: 'Commission Discount (30 days)', pointsCost: 500, value: 0.5 },
  { id: 'premium_trial', name: 'Premium Features Trial (7 days)', pointsCost: 300, value: 0 },
  { id: 'custom_badge', name: 'Custom Badge', pointsCost: 2000, value: 0 },
  { id: 'priority_support', name: 'Priority Support (30 days)', pointsCost: 800, value: 0 },
] as const;
