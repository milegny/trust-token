import {
  CommissionTier,
  COMMISSION_RATES,
  ALLOCATION_PERCENTAGES,
  FundAllocation,
  CommissionCalculation,
  StakingTier,
  STAKING_DISCOUNTS,
} from '../types/treasury';

/**
 * Determine commission tier based on transaction participants
 */
export function determineCommissionTier(
  buyerVerified: boolean,
  sellerVerified: boolean
): CommissionTier {
  // Premium tier if both users are verified
  if (buyerVerified && sellerVerified) {
    return CommissionTier.PREMIUM;
  }
  return CommissionTier.STANDARD;
}

/**
 * Calculate commission with staking discount
 */
export function calculateCommission(
  transactionAmount: number,
  tier: CommissionTier,
  stakingTier: StakingTier = StakingTier.NONE
): CommissionCalculation {
  // Base commission rate
  const baseRate = COMMISSION_RATES[tier];
  const baseCommission = transactionAmount * baseRate;

  // Apply staking discount
  const stakingDiscount = transactionAmount * STAKING_DISCOUNTS[stakingTier];
  const finalCommission = baseCommission - stakingDiscount;

  // Calculate breakdown by allocation
  const breakdown = {
    operations: finalCommission * ALLOCATION_PERCENTAGES[FundAllocation.OPERATIONS],
    insurance: finalCommission * ALLOCATION_PERCENTAGES[FundAllocation.INSURANCE],
    moderation: finalCommission * ALLOCATION_PERCENTAGES[FundAllocation.MODERATION],
    founder: finalCommission * ALLOCATION_PERCENTAGES[FundAllocation.FOUNDER],
  };

  return {
    transactionAmount,
    tier,
    baseCommission,
    stakingDiscount,
    finalCommission,
    breakdown,
  };
}

/**
 * Process commission deduction from transaction
 */
export async function processCommissionDeduction(
  orderId: string,
  transactionAmount: number,
  buyerWallet: string,
  sellerWallet: string,
  txSignature: string
): Promise<{ success: boolean; commission: CommissionCalculation; error?: string }> {
  try {
    // Check verification status
    const [buyerStatus, sellerStatus, buyerStaking] = await Promise.all([
      checkVerificationStatus(buyerWallet),
      checkVerificationStatus(sellerWallet),
      getStakingTier(buyerWallet),
    ]);

    // Determine tier and calculate commission
    const tier = determineCommissionTier(buyerStatus.verified, sellerStatus.verified);
    const commission = calculateCommission(transactionAmount, tier, buyerStaking);

    // Record commission in backend
    const response = await fetch('/api/treasury/commission/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        buyerWallet,
        sellerWallet,
        transactionAmount,
        tier,
        commission: commission.finalCommission,
        breakdown: commission.breakdown,
        txSignature,
        stakingTier: buyerStaking,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to record commission');
    }

    return { success: true, commission };
  } catch (error: any) {
    console.error('Error processing commission:', error);
    return {
      success: false,
      commission: calculateCommission(transactionAmount, CommissionTier.STANDARD),
      error: error.message || 'Failed to process commission',
    };
  }
}

/**
 * Check if user has TrustToken verification
 */
async function checkVerificationStatus(
  wallet: string
): Promise<{ verified: boolean; trustTokenId?: string }> {
  try {
    const response = await fetch(`/api/trust-token/status/${wallet}`);
    const data = await response.json();
    return {
      verified: data.hasToken && data.isActive,
      trustTokenId: data.tokenId,
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return { verified: false };
  }
}

/**
 * Get user's staking tier
 */
async function getStakingTier(wallet: string): Promise<StakingTier> {
  try {
    const response = await fetch(`/api/staking/tier/${wallet}`);
    const data = await response.json();
    return data.tier || StakingTier.NONE;
  } catch (error) {
    console.error('Error fetching staking tier:', error);
    return StakingTier.NONE;
  }
}

/**
 * Get commission estimate for display
 */
export async function getCommissionEstimate(
  transactionAmount: number,
  buyerWallet: string,
  sellerWallet: string
): Promise<CommissionCalculation> {
  try {
    const [buyerStatus, sellerStatus, buyerStaking] = await Promise.all([
      checkVerificationStatus(buyerWallet),
      checkVerificationStatus(sellerWallet),
      getStakingTier(buyerWallet),
    ]);

    const tier = determineCommissionTier(buyerStatus.verified, sellerStatus.verified);
    return calculateCommission(transactionAmount, tier, buyerStaking);
  } catch (error) {
    console.error('Error getting commission estimate:', error);
    return calculateCommission(transactionAmount, CommissionTier.STANDARD);
  }
}

/**
 * Get commission history for a user
 */
export async function getCommissionHistory(
  wallet: string,
  limit: number = 20
): Promise<any[]> {
  try {
    const response = await fetch(`/api/treasury/commission/history/${wallet}?limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching commission history:', error);
    return [];
  }
}

/**
 * Get total commissions paid by user
 */
export async function getTotalCommissionsPaid(wallet: string): Promise<number> {
  try {
    const response = await fetch(`/api/treasury/commission/total/${wallet}`);
    const data = await response.json();
    return data.total || 0;
  } catch (error) {
    console.error('Error fetching total commissions:', error);
    return 0;
  }
}

/**
 * Calculate potential savings with staking
 */
export function calculateStakingSavings(
  monthlyTransactionVolume: number,
  currentTier: StakingTier,
  targetTier: StakingTier
): {
  currentDiscount: number;
  targetDiscount: number;
  monthlySavings: number;
  annualSavings: number;
} {
  const currentDiscount = monthlyTransactionVolume * STAKING_DISCOUNTS[currentTier];
  const targetDiscount = monthlyTransactionVolume * STAKING_DISCOUNTS[targetTier];
  const monthlySavings = targetDiscount - currentDiscount;
  const annualSavings = monthlySavings * 12;

  return {
    currentDiscount,
    targetDiscount,
    monthlySavings,
    annualSavings,
  };
}

export default {
  determineCommissionTier,
  calculateCommission,
  processCommissionDeduction,
  getCommissionEstimate,
  getCommissionHistory,
  getTotalCommissionsPaid,
  calculateStakingSavings,
};
