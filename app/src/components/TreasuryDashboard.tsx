import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import {
  TreasuryBalance,
  RevenueStream,
  FundDistribution,
  ModeratorEarnings,
  FundAllocation,
  ALLOCATION_PERCENTAGES,
} from '../types/treasury';

interface TreasuryDashboardProps {
  treasuryWallet: string;
}

export const TreasuryDashboard: React.FC<TreasuryDashboardProps> = ({ treasuryWallet }) => {
  const { connection } = useConnection();
  const [balance, setBalance] = useState<TreasuryBalance | null>(null);
  const [recentRevenue, setRecentRevenue] = useState<RevenueStream[]>([]);
  const [recentDistributions, setRecentDistributions] = useState<FundDistribution[]>([]);
  const [topModerators, setTopModerators] = useState<ModeratorEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchTreasuryData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchTreasuryData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [treasuryWallet, autoRefresh]);

  const fetchTreasuryData = async () => {
    try {
      setLoading(true);
      
      // Fetch real-time balance from blockchain
      const response = await fetch(`/api/treasury/balance/${treasuryWallet}`);
      const balanceData = await response.json();
      setBalance(balanceData);

      // Fetch recent revenue streams
      const revenueResponse = await fetch(`/api/treasury/revenue/recent?limit=10`);
      const revenueData = await revenueResponse.json();
      setRecentRevenue(revenueData);

      // Fetch recent distributions
      const distributionsResponse = await fetch(`/api/treasury/distributions/recent?limit=10`);
      const distributionsData = await distributionsResponse.json();
      setRecentDistributions(distributionsData);

      // Fetch top moderators
      const moderatorsResponse = await fetch(`/api/treasury/moderators/top?limit=10`);
      const moderatorsData = await moderatorsResponse.json();
      setTopModerators(moderatorsData);

    } catch (error) {
      console.error('Error fetching treasury data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSOL = (amount: number) => {
    return `${amount.toFixed(4)} SOL`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getAllocationColor = (allocation: FundAllocation) => {
    const colors = {
      [FundAllocation.OPERATIONS]: 'bg-blue-500',
      [FundAllocation.INSURANCE]: 'bg-green-500',
      [FundAllocation.MODERATION]: 'bg-purple-500',
      [FundAllocation.FOUNDER]: 'bg-orange-500',
    };
    return colors[allocation];
  };

  if (loading && !balance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Treasury Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time financial transparency</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={fetchTreasuryData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Treasury Balance</p>
            <p className="text-4xl font-bold mt-2">{balance ? formatSOL(balance.total) : '0.0000 SOL'}</p>
            <p className="text-blue-100 text-sm mt-2">
              Last updated: {balance ? new Date(balance.lastUpdated).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="text-6xl opacity-20">💰</div>
        </div>
      </div>

      {/* Fund Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fund Distribution</h2>
        
        {/* Visual Distribution Bar */}
        <div className="mb-6">
          <div className="flex h-8 rounded-lg overflow-hidden">
            {Object.entries(ALLOCATION_PERCENTAGES).map(([allocation, percentage]) => (
              <div
                key={allocation}
                className={`${getAllocationColor(allocation as FundAllocation)} flex items-center justify-center text-white text-xs font-medium`}
                style={{ width: `${percentage * 100}%` }}
              >
                {formatPercentage(percentage)}
              </div>
            ))}
          </div>
        </div>

        {/* Distribution Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="text-sm font-medium text-gray-700">Operations</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {balance ? formatSOL(balance.operations) : '0.0000 SOL'}
            </p>
            <p className="text-xs text-gray-500 mt-1">15% of revenue</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm font-medium text-gray-700">Insurance Pool</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {balance ? formatSOL(balance.insurance) : '0.0000 SOL'}
            </p>
            <p className="text-xs text-gray-500 mt-1">25% of revenue</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <p className="text-sm font-medium text-gray-700">Moderation</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {balance ? formatSOL(balance.moderation) : '0.0000 SOL'}
            </p>
            <p className="text-xs text-gray-500 mt-1">25% of revenue</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <p className="text-sm font-medium text-gray-700">Founder</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {balance ? formatSOL(balance.founder) : '0.0000 SOL'}
            </p>
            <p className="text-xs text-gray-500 mt-1">35% of revenue</p>
          </div>
        </div>
      </div>

      {/* Recent Revenue & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Revenue</h2>
          <div className="space-y-3">
            {recentRevenue.length > 0 ? (
              recentRevenue.map((revenue) => (
                <div key={revenue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{revenue.source}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(revenue.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">+{formatSOL(revenue.amount)}</p>
                    <a
                      href={`https://explorer.solana.com/tx/${revenue.txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View TX
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent revenue</p>
            )}
          </div>
        </div>

        {/* Recent Distributions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Distributions</h2>
          <div className="space-y-3">
            {recentDistributions.length > 0 ? (
              recentDistributions.map((distribution) => (
                <div key={distribution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{distribution.allocation}</p>
                    <p className="text-xs text-gray-500">{distribution.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">-{formatSOL(distribution.amount)}</p>
                    <a
                      href={`https://explorer.solana.com/tx/${distribution.txSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View TX
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent distributions</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Moderators */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Moderators</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Moderator</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Level</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Disputes</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Points</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Earned</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">This Month</th>
              </tr>
            </thead>
            <tbody>
              {topModerators.length > 0 ? (
                topModerators.map((moderator, index) => (
                  <tr key={moderator.moderatorWallet} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">
                        {moderator.moderatorWallet.slice(0, 4)}...{moderator.moderatorWallet.slice(-4)}
                      </p>
                      <div className="flex space-x-1 mt-1">
                        {moderator.badges.slice(0, 3).map((badge) => (
                          <span key={badge} className="text-xs">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        moderator.level === 'ELITE' ? 'bg-purple-100 text-purple-800' :
                        moderator.level === 'SENIOR' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {moderator.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {moderator.disputesResolved}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {moderator.points.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">
                      {formatSOL(moderator.totalEarned)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-green-600">
                      {formatSOL(moderator.currentMonthEarned)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No moderator data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insurance Pool Status */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Insurance Pool Status</h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Active
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {balance ? formatSOL(balance.insurance) : '0.0000 SOL'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Coverage Limit</p>
            <p className="text-2xl font-bold text-gray-900">100 SOL</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Pool Health</p>
            <p className="text-2xl font-bold text-green-600">Excellent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryDashboard;
