import React, { useState, useEffect } from 'react';
import {
  TransparencyMetrics,
  FundAllocation,
  ALLOCATION_PERCENTAGES,
} from '../types/treasury';

type TimePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export const TransparencyDashboard: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>('MONTHLY');
  const [metrics, setMetrics] = useState<TransparencyMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<TransparencyMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransparencyData();
  }, [period]);

  const fetchTransparencyData = async () => {
    try {
      setLoading(true);

      // Fetch current period metrics
      const metricsResponse = await fetch(`/api/transparency/metrics?period=${period}`);
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch historical data
      const historicalResponse = await fetch(`/api/transparency/historical?period=${period}&limit=12`);
      const historicalData = await historicalResponse.json();
      setHistoricalData(historicalData);
    } catch (error) {
      console.error('Error fetching transparency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSOL = (amount: number) => `${amount.toFixed(2)} SOL`;
  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const getPeriodLabel = (period: TimePeriod) => {
    const labels = {
      DAILY: 'Today',
      WEEKLY: 'This Week',
      MONTHLY: 'This Month',
      QUARTERLY: 'This Quarter',
      YEARLY: 'This Year',
    };
    return labels[period];
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

  if (loading && !metrics) {
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
          <h1 className="text-3xl font-bold text-gray-900">Financial Transparency</h1>
          <p className="text-gray-600 mt-1">Public financial data updated in real-time</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics ? formatSOL(metrics.totalRevenue) : '0.00 SOL'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{getPeriodLabel(period)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total Distributed</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics ? formatSOL(metrics.totalDistributed) : '0.00 SOL'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{getPeriodLabel(period)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics ? formatNumber(metrics.activeUsers) : '0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{getPeriodLabel(period)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Transactions</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics ? formatNumber(metrics.totalTransactions) : '0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{getPeriodLabel(period)}</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Sources</h2>
        {metrics && Object.keys(metrics.revenueBySource).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(metrics.revenueBySource).map(([source, amount]) => {
              const percentage = (amount / metrics.totalRevenue) * 100;
              return (
                <div key={source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{source}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatSOL(amount)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No revenue data available</p>
        )}
      </div>

      {/* Fund Distribution */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Fund Distribution</h2>
        
        {/* Visual Bar */}
        <div className="mb-6">
          <div className="flex h-12 rounded-lg overflow-hidden">
            {Object.entries(ALLOCATION_PERCENTAGES).map(([allocation, percentage]) => (
              <div
                key={allocation}
                className={`${getAllocationColor(allocation as FundAllocation)} flex items-center justify-center text-white text-sm font-medium`}
                style={{ width: `${percentage * 100}%` }}
              >
                {formatPercentage(percentage)}
              </div>
            ))}
          </div>
        </div>

        {/* Distribution Details */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.distributionByAllocation).map(([allocation, amount]) => (
              <div key={allocation} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-4 h-4 ${getAllocationColor(allocation as FundAllocation)} rounded-full mx-auto mb-2`}></div>
                <p className="text-xs text-gray-600 mb-1">{allocation}</p>
                <p className="text-lg font-bold text-gray-900">{formatSOL(amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Average Commission</h3>
          <p className="text-3xl font-bold text-blue-600">
            {metrics ? formatPercentage(metrics.averageCommission) : '0%'}
          </p>
          <p className="text-sm text-gray-600 mt-2">Per transaction</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Insurance Pool Growth</h3>
          <p className="text-3xl font-bold text-green-600">
            {metrics ? formatSOL(metrics.insurancePoolGrowth) : '0.00 SOL'}
          </p>
          <p className="text-sm text-gray-600 mt-2">{getPeriodLabel(period)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Moderator Payouts</h3>
          <p className="text-3xl font-bold text-purple-600">
            {metrics ? formatSOL(metrics.moderatorPayouts) : '0.00 SOL'}
          </p>
          <p className="text-sm text-gray-600 mt-2">{getPeriodLabel(period)}</p>
        </div>
      </div>

      {/* Historical Trend */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historical Trend</h2>
        {historicalData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Period</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Distributed</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Users</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {historicalData.map((data, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {formatSOL(data.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {formatSOL(data.totalDistributed)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {formatNumber(data.activeUsers)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {formatNumber(data.totalTransactions)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No historical data available</p>
        )}
      </div>

      {/* Transparency Statement */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Our Commitment to Transparency</h3>
        <p className="text-sm text-blue-800 mb-4">
          All financial data is sourced directly from the Solana blockchain and updated in real-time.
          We believe in complete transparency and accountability to our community.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">✓</span>
            <span className="text-blue-900">All transactions are on-chain and verifiable</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">✓</span>
            <span className="text-blue-900">Fund distribution is automated by smart contracts</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">✓</span>
            <span className="text-blue-900">Financial reports are generated automatically</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransparencyDashboard;
