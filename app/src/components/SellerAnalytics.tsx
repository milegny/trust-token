import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  SellerMetrics,
  SalesData,
  TopProduct,
  CompetitorComparison,
  Alert,
  TimePeriod,
  ChartData,
} from '../types/analytics';

export const SellerAnalytics: React.FC = () => {
  const { publicKey } = useWallet();
  const [period, setPeriod] = useState<TimePeriod>('MONTH');
  const [metrics, setMetrics] = useState<SellerMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [comparisons, setComparisons] = useState<CompetitorComparison[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      fetchAnalytics();
    }
  }, [publicKey, period]);

  const fetchAnalytics = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const sellerId = publicKey.toBase58();

      const [metricsRes, salesRes, productsRes, comparisonsRes, alertsRes] = await Promise.all([
        fetch(`/api/analytics/seller/${sellerId}/metrics?period=${period}`),
        fetch(`/api/analytics/seller/${sellerId}/sales?period=${period}`),
        fetch(`/api/analytics/seller/${sellerId}/top-products?period=${period}`),
        fetch(`/api/analytics/seller/${sellerId}/comparisons?period=${period}`),
        fetch(`/api/analytics/seller/${sellerId}/alerts`),
      ]);

      const [metricsData, salesDataRes, productsData, comparisonsData, alertsData] = await Promise.all([
        metricsRes.json(),
        salesRes.json(),
        productsRes.json(),
        comparisonsRes.json(),
        alertsRes.json(),
      ]);

      setMetrics(metricsData);
      setSalesData(salesDataRes);
      setTopProducts(productsData);
      setComparisons(comparisonsData);
      setAlerts(alertsData.filter((a: Alert) => !a.dismissedAt));
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/analytics/alerts/${alertId}/dismiss`, { method: 'POST' });
      setAlerts(alerts.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} SOL`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (num: number) => num.toLocaleString();

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAlertColor = (severity: string) => {
    if (severity === 'HIGH') return 'bg-red-100 border-red-500 text-red-800';
    if (severity === 'MEDIUM') return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    return 'bg-blue-100 border-blue-500 text-blue-800';
  };

  if (!publicKey) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-600">Please connect your wallet to view analytics</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your performance</p>
        </div>

        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['TODAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'] as TimePeriod[]).map((p) => (
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

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-4 ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{alert.title}</span>
                    <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{alert.message}</p>
                  {alert.actionUrl && (
                    <a
                      href={alert.actionUrl}
                      className="text-sm font-medium underline mt-2 inline-block"
                    >
                      Take Action →
                    </a>
                  )}
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics ? formatCurrency(metrics.totalRevenue) : '0.00 SOL'}
          </p>
          {metrics && (
            <p className={`text-sm mt-2 ${getGrowthColor(metrics.revenueGrowth)}`}>
              {metrics.revenueGrowth > 0 ? '↑' : metrics.revenueGrowth < 0 ? '↓' : '→'}{' '}
              {formatPercentage(Math.abs(metrics.revenueGrowth))} vs last period
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Net Revenue</p>
          <p className="text-3xl font-bold text-green-600">
            {metrics ? formatCurrency(metrics.netRevenue) : '0.00 SOL'}
          </p>
          {metrics && (
            <p className="text-sm text-gray-500 mt-2">
              Commission: {formatCurrency(metrics.commissionPaid)}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Transactions</p>
          <p className="text-3xl font-bold text-gray-900">
            {metrics ? formatNumber(metrics.totalTransactions) : '0'}
          </p>
          {metrics && (
            <p className={`text-sm mt-2 ${getGrowthColor(metrics.transactionGrowth)}`}>
              {metrics.transactionGrowth > 0 ? '↑' : metrics.transactionGrowth < 0 ? '↓' : '→'}{' '}
              {formatPercentage(Math.abs(metrics.transactionGrowth))} vs last period
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-1">Average Rating</p>
          <p className="text-3xl font-bold text-yellow-600">
            {metrics ? metrics.averageRating.toFixed(1) : '0.0'} ⭐
          </p>
          {metrics && (
            <p className="text-sm text-gray-500 mt-2">
              {formatNumber(metrics.totalReviews)} reviews
            </p>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Performance</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Avg Delivery Time</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics ? `${metrics.averageDeliveryTime.toFixed(1)}h` : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{
                    width: metrics ? `${Math.min((48 / metrics.averageDeliveryTime) * 100, 100)}%` : '0%',
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">On-Time Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics ? formatPercentage(metrics.onTimeDeliveryRate) : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 rounded-full h-2"
                  style={{
                    width: metrics ? `${metrics.onTimeDeliveryRate * 100}%` : '0%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Metrics</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Satisfaction Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics ? formatPercentage(metrics.customerSatisfactionRate) : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 rounded-full h-2"
                  style={{
                    width: metrics ? `${metrics.customerSatisfactionRate * 100}%` : '0%',
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Repeat Customer Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics ? formatPercentage(metrics.repeatCustomerRate) : 'N/A'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 rounded-full h-2"
                  style={{
                    width: metrics ? `${metrics.repeatCustomerRate * 100}%` : '0%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Reputation</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reputation Score</span>
              <span className="text-2xl font-bold text-blue-600">
                {metrics ? metrics.reputationScore.toFixed(0) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Positive Cards</span>
              <span className="text-sm font-medium text-green-600">
                {metrics ? formatNumber(metrics.positiveReputationCards) : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Negative Cards</span>
              <span className="text-sm font-medium text-red-600">
                {metrics ? formatNumber(metrics.negativeReputationCards) : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Over Time</h2>
        {salesData.length > 0 ? (
          <div className="h-64">
            {/* Simple bar chart visualization */}
            <div className="flex items-end justify-between h-full space-x-2">
              {salesData.slice(-30).map((data, index) => {
                const maxRevenue = Math.max(...salesData.map((d) => d.revenue));
                const height = (data.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                      title={`${new Date(data.date).toLocaleDateString()}: ${formatCurrency(data.revenue)}`}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{salesData[0] ? new Date(salesData[0].date).toLocaleDateString() : ''}</span>
              <span>
                {salesData[salesData.length - 1]
                  ? new Date(salesData[salesData.length - 1].date).toLocaleDateString()
                  : ''}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No sales data available</p>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Products</h2>
        {topProducts.length > 0 ? (
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.productId} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-400">#{product.rank}</div>
                <img
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.productName}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>{formatNumber(product.unitsSold)} sold</span>
                    <span>⭐ {product.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(product.totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No product data available</p>
        )}
      </div>

      {/* Competitor Comparison */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Competitor Comparison</h2>
        {comparisons.length > 0 ? (
          <div className="space-y-4">
            {comparisons.map((comparison, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{comparison.metric}</span>
                  <span className="text-sm text-gray-600">
                    {comparison.percentile}th percentile
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Your Value</p>
                    <p className="font-bold text-blue-600">{comparison.yourValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Category Avg</p>
                    <p className="font-bold text-gray-900">{comparison.categoryAverage.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Top Performer</p>
                    <p className="font-bold text-green-600">{comparison.topPerformer.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 rounded-full h-2"
                    style={{ width: `${comparison.percentile}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No comparison data available</p>
        )}
      </div>
    </div>
  );
};

export default SellerAnalytics;
