import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  StakingTier,
  StakingPosition,
  STAKING_REQUIREMENTS,
  STAKING_DISCOUNTS,
  WEEKLY_STAKING_APY,
} from '../types/treasury';

export const StakingDashboard: React.FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [position, setPosition] = useState<StakingPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<string>('');

  useEffect(() => {
    if (publicKey) {
      fetchStakingPosition();
    }
  }, [publicKey]);

  const fetchStakingPosition = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/staking/position/${publicKey.toBase58()}`);
      const data = await response.json();
      setPosition(data);
    } catch (error) {
      console.error('Error fetching staking position:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!publicKey || !stakeAmount) return;

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setStaking(true);
      const lamports = amount * LAMPORTS_PER_SOL;

      // Get staking wallet from backend
      const configResponse = await fetch('/api/config/staking-wallet');
      const { stakingWallet } = await configResponse.json();

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: stakingWallet,
          lamports,
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Record stake in backend
      const response = await fetch('/api/staking/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          amount,
          txSignature: signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record stake');
      }

      alert(`Successfully staked ${amount} SOL!`);
      setStakeAmount('');
      fetchStakingPosition();
    } catch (error: any) {
      console.error('Error staking:', error);
      alert(`Failed to stake: ${error.message}`);
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!publicKey || !position) return;

    if (!confirm(`Are you sure you want to unstake ${position.amount} SOL?`)) {
      return;
    }

    try {
      setUnstaking(true);

      const response = await fetch('/api/staking/unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unstake');
      }

      const { txSignature } = await response.json();
      alert(`Successfully unstaked! TX: ${txSignature}`);
      fetchStakingPosition();
    } catch (error: any) {
      console.error('Error unstaking:', error);
      alert(`Failed to unstake: ${error.message}`);
    } finally {
      setUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!publicKey || !position || position.pendingRewards === 0) return;

    try {
      setClaiming(true);

      const response = await fetch('/api/staking/claim-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim rewards');
      }

      const { txSignature, amount } = await response.json();
      alert(`Successfully claimed ${amount} SOL! TX: ${txSignature}`);
      fetchStakingPosition();
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      alert(`Failed to claim rewards: ${error.message}`);
    } finally {
      setClaiming(false);
    }
  };

  const getTierColor = (tier: StakingTier) => {
    const colors = {
      [StakingTier.NONE]: 'bg-gray-100 text-gray-800',
      [StakingTier.BRONZE]: 'bg-orange-100 text-orange-800',
      [StakingTier.SILVER]: 'bg-gray-300 text-gray-800',
      [StakingTier.GOLD]: 'bg-yellow-100 text-yellow-800',
    };
    return colors[tier];
  };

  const getTierIcon = (tier: StakingTier) => {
    const icons = {
      [StakingTier.NONE]: '⚪',
      [StakingTier.BRONZE]: '🥉',
      [StakingTier.SILVER]: '🥈',
      [StakingTier.GOLD]: '🥇',
    };
    return icons[tier];
  };

  const getNextTier = (currentTier: StakingTier): StakingTier | null => {
    if (currentTier === StakingTier.NONE) return StakingTier.BRONZE;
    if (currentTier === StakingTier.BRONZE) return StakingTier.SILVER;
    if (currentTier === StakingTier.SILVER) return StakingTier.GOLD;
    return null;
  };

  const calculateAPY = () => {
    return (WEEKLY_STAKING_APY * 100).toFixed(2);
  };

  const calculateWeeklyRewards = (amount: number) => {
    return (amount * WEEKLY_STAKING_APY) / 52;
  };

  const formatSOL = (amount: number) => `${amount.toFixed(4)} SOL`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  if (!publicKey) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-600">Please connect your wallet to view staking</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staking Dashboard</h1>
        <p className="text-gray-600 mt-1">Stake SOL to earn rewards and reduce commission fees</p>
      </div>

      {/* Current Position */}
      {position && position.amount > 0 ? (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{getTierIcon(position.tier)}</div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(position.tier)} bg-white`}>
                  {position.tier} TIER
                </span>
                <p className="text-2xl font-bold mt-2">{formatSOL(position.amount)} Staked</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Commission Discount</p>
              <p className="text-4xl font-bold">{formatPercentage(STAKING_DISCOUNTS[position.tier])}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white border-opacity-20">
            <div>
              <p className="text-blue-100 text-sm">Pending Rewards</p>
              <p className="text-xl font-bold">{formatSOL(position.pendingRewards)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Total Earned</p>
              <p className="text-xl font-bold">{formatSOL(position.totalRewardsEarned)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Staked Since</p>
              <p className="text-xl font-bold">
                {new Date(position.stakedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-6xl mb-4">💎</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Staking Today</h2>
          <p className="text-gray-600 mb-6">
            Earn {calculateAPY()}% APY and reduce your commission fees
          </p>
        </div>
      )}

      {/* Staking Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[StakingTier.BRONZE, StakingTier.SILVER, StakingTier.GOLD].map((tier) => {
          const requirement = STAKING_REQUIREMENTS[tier];
          const discount = STAKING_DISCOUNTS[tier];
          const weeklyReward = calculateWeeklyRewards(requirement);
          const isCurrentTier = position?.tier === tier;
          const canUpgrade = position && position.amount >= requirement && position.tier !== tier;

          return (
            <div
              key={tier}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                isCurrentTier ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 text-white">
                <div className="text-5xl mb-3">{getTierIcon(tier)}</div>
                <h3 className="text-xl font-bold">{tier} TIER</h3>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Minimum Stake</p>
                    <p className="text-2xl font-bold text-gray-900">{requirement} SOL</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Commission Discount</p>
                    <p className="text-2xl font-bold text-green-600">{formatPercentage(discount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Weekly Rewards</p>
                    <p className="text-lg font-bold text-purple-600">~{formatSOL(weeklyReward)}</p>
                  </div>
                </div>

                {isCurrentTier && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-blue-800 text-sm font-medium">✓ Current Tier</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stake */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Stake SOL</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Stake
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleStake}
              disabled={staking || !stakeAmount}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {staking ? 'Staking...' : 'Stake Now'}
            </button>
          </div>
        </div>

        {/* Manage Position */}
        {position && position.amount > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Position</h2>
            <div className="space-y-3">
              <button
                onClick={handleClaimRewards}
                disabled={claiming || position.pendingRewards === 0}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : `Claim ${formatSOL(position.pendingRewards)} Rewards`}
              </button>
              <button
                onClick={handleUnstake}
                disabled={unstaking}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {unstaking ? 'Unstaking...' : 'Unstake All'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Staking Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
            <p className="text-sm text-gray-600">
              Earn {calculateAPY()}% APY on your staked SOL, paid out weekly
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📉</div>
            <h3 className="font-semibold text-gray-900 mb-2">Reduce Fees</h3>
            <p className="text-sm text-gray-600">
              Get up to 1.5% discount on all marketplace commission fees
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🔓</div>
            <h3 className="font-semibold text-gray-900 mb-2">Flexible</h3>
            <p className="text-sm text-gray-600">
              Unstake anytime with no lock-up period or penalties
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How are rewards calculated?</h3>
            <p className="text-sm text-gray-600">
              Rewards are calculated based on your staked amount and the {calculateAPY()}% APY.
              They're distributed weekly and can be claimed anytime.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Is there a lock-up period?</h3>
            <p className="text-sm text-gray-600">
              No! You can unstake your SOL anytime without penalties. However, you'll lose your
              tier benefits and stop earning rewards.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How do commission discounts work?</h3>
            <p className="text-sm text-gray-600">
              Your discount is automatically applied to all marketplace transactions. Higher tiers
              get bigger discounts, saving you money on every purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingDashboard;
