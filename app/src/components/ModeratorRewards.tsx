import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  ModeratorLevel,
  ModeratorEarnings,
  ModeratorReward,
  RewardRedemption,
  MODERATOR_LEVEL_MULTIPLIERS,
  BASE_DISPUTE_REWARD,
  POINT_REDEMPTION_OPTIONS,
} from '../types/treasury';

export const ModeratorRewards: React.FC = () => {
  const { publicKey } = useWallet();
  const [earnings, setEarnings] = useState<ModeratorEarnings | null>(null);
  const [recentRewards, setRecentRewards] = useState<ModeratorReward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchModeratorData();
    }
  }, [publicKey]);

  const fetchModeratorData = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const wallet = publicKey.toBase58();

      // Fetch earnings and stats
      const earningsResponse = await fetch(`/api/moderator/earnings/${wallet}`);
      const earningsData = await earningsResponse.json();
      setEarnings(earningsData);

      // Fetch recent rewards
      const rewardsResponse = await fetch(`/api/moderator/rewards/${wallet}?limit=20`);
      const rewardsData = await rewardsResponse.json();
      setRecentRewards(rewardsData);

      // Fetch redemption history
      const redemptionsResponse = await fetch(`/api/moderator/redemptions/${wallet}?limit=10`);
      const redemptionsData = await redemptionsResponse.json();
      setRedemptions(redemptionsData);
    } catch (error) {
      console.error('Error fetching moderator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async (rewardId: string) => {
    if (!publicKey || !earnings) return;

    const reward = POINT_REDEMPTION_OPTIONS.find((r) => r.id === rewardId);
    if (!reward) return;

    if (earnings.points < reward.pointsCost) {
      alert('Insufficient points for this reward');
      return;
    }

    try {
      setRedeeming(true);
      const response = await fetch('/api/moderator/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderatorWallet: publicKey.toBase58(),
          rewardId,
          pointsCost: reward.pointsCost,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to redeem reward');
      }

      alert(`Successfully redeemed: ${reward.name}`);
      fetchModeratorData();
      setSelectedReward(null);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const getLevelColor = (level: ModeratorLevel) => {
    const colors = {
      [ModeratorLevel.JUNIOR]: 'bg-gray-100 text-gray-800',
      [ModeratorLevel.SENIOR]: 'bg-blue-100 text-blue-800',
      [ModeratorLevel.ELITE]: 'bg-purple-100 text-purple-800',
    };
    return colors[level];
  };

  const getLevelIcon = (level: ModeratorLevel) => {
    const icons = {
      [ModeratorLevel.JUNIOR]: '🌱',
      [ModeratorLevel.SENIOR]: '⚖️',
      [ModeratorLevel.ELITE]: '👑',
    };
    return icons[level];
  };

  const getNextLevel = (currentLevel: ModeratorLevel): ModeratorLevel | null => {
    if (currentLevel === ModeratorLevel.JUNIOR) return ModeratorLevel.SENIOR;
    if (currentLevel === ModeratorLevel.SENIOR) return ModeratorLevel.ELITE;
    return null;
  };

  const getProgressToNextLevel = () => {
    if (!earnings) return 0;
    
    const thresholds = {
      [ModeratorLevel.JUNIOR]: { disputes: 0, points: 0 },
      [ModeratorLevel.SENIOR]: { disputes: 50, points: 500 },
      [ModeratorLevel.ELITE]: { disputes: 200, points: 2000 },
    };

    const nextLevel = getNextLevel(earnings.level);
    if (!nextLevel) return 100;

    const nextThreshold = thresholds[nextLevel];
    const disputeProgress = (earnings.disputesResolved / nextThreshold.disputes) * 100;
    const pointProgress = (earnings.points / nextThreshold.points) * 100;

    return Math.min((disputeProgress + pointProgress) / 2, 100);
  };

  const formatSOL = (amount: number) => `${amount.toFixed(4)} SOL`;

  if (!publicKey) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-600">Please connect your wallet to view moderator rewards</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-600">No moderator data found for this wallet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Moderator Rewards</h1>
        <p className="text-gray-600 mt-1">Track your earnings and redeem rewards</p>
      </div>

      {/* Level & Stats Card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{getLevelIcon(earnings.level)}</div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(earnings.level)} bg-white`}>
                {earnings.level} MODERATOR
              </span>
              <p className="text-2xl font-bold mt-2">Rank #{earnings.rank}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-100 text-sm">Total Earned</p>
            <p className="text-4xl font-bold">{formatSOL(earnings.totalEarned)}</p>
          </div>
        </div>

        {/* Progress to Next Level */}
        {getNextLevel(earnings.level) && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress to {getNextLevel(earnings.level)}</span>
              <span>{getProgressToNextLevel().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${getProgressToNextLevel()}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Disputes Resolved</p>
          <p className="text-3xl font-bold text-gray-900">{earnings.disputesResolved}</p>
          <p className="text-xs text-gray-500 mt-1">
            Multiplier: {MODERATOR_LEVEL_MULTIPLIERS[earnings.level]}x
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Points Balance</p>
          <p className="text-3xl font-bold text-purple-600">{earnings.points.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Available for redemption</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">This Month</p>
          <p className="text-3xl font-bold text-green-600">{formatSOL(earnings.currentMonthEarned)}</p>
          <p className="text-xs text-gray-500 mt-1">Current period earnings</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Badges Earned</p>
          <p className="text-3xl font-bold text-gray-900">{earnings.badges.length}</p>
          <div className="flex space-x-1 mt-1">
            {earnings.badges.slice(0, 5).map((badge) => (
              <span key={badge} className="text-lg">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reward Redemption */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Redeem Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {POINT_REDEMPTION_OPTIONS.map((reward) => {
            const canAfford = earnings.points >= reward.pointsCost;
            return (
              <div
                key={reward.id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  canAfford
                    ? 'border-purple-200 hover:border-purple-400 cursor-pointer'
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canAfford && setSelectedReward(reward.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                  {reward.value > 0 && (
                    <span className="text-sm text-green-600 font-medium">
                      {formatSOL(reward.value)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {reward.pointsCost.toLocaleString()} points
                  </span>
                  {selectedReward === reward.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRedeemPoints(reward.id);
                      }}
                      disabled={redeeming}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      {redeeming ? 'Redeeming...' : 'Redeem'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Rewards */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Rewards</h2>
        <div className="space-y-3">
          {recentRewards.length > 0 ? (
            recentRewards.map((reward) => (
              <div key={reward.disputeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Dispute #{reward.disputeId.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(reward.timestamp).toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">
                      Base: {formatSOL(reward.baseReward)}
                    </span>
                    <span className="text-xs text-purple-600">
                      × {reward.levelMultiplier} (level)
                    </span>
                    {reward.bonusMultiplier > 1 && (
                      <span className="text-xs text-green-600">
                        × {reward.bonusMultiplier} (bonus)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">+{formatSOL(reward.totalReward)}</p>
                  {reward.txSignature && (
                    <a
                      href={`https://explorer.solana.com/tx/${reward.txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View TX
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No rewards yet</p>
          )}
        </div>
      </div>

      {/* Redemption History */}
      {redemptions.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Redemption History</h2>
          <div className="space-y-3">
            {redemptions.map((redemption) => (
              <div key={redemption.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{redemption.rewardType}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(redemption.redeemedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-600">
                    -{redemption.pointsSpent.toLocaleString()} points
                  </p>
                  {redemption.rewardValue > 0 && (
                    <p className="text-xs text-green-600">{formatSOL(redemption.rewardValue)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorRewards;
