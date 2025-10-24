import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  ProductPerformance as ProductPerformanceType,
  ProductRecommendation,
  RecommendationType,
  OptimizationSuggestion,
} from '../types/analytics';

export const ProductPerformance: React.FC = () => {
  const { publicKey } = useWallet();
  const [products, setProducts] = useState<ProductPerformanceType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductPerformanceType | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'revenue' | 'sales' | 'rating' | 'performance'>('revenue');

  useEffect(() => {
    if (publicKey) {
      fetchProductPerformance();
    }
  }, [publicKey]);

  useEffect(() => {
    if (selectedProduct) {
      fetchOptimizationSuggestions(selectedProduct.productId);
    }
  }, [selectedProduct]);

  const fetchProductPerformance = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const sellerId = publicKey.toBase58();
      const response = await fetch(`/api/analytics/seller/${sellerId}/products/performance`);
      const data = await response.json();
      setProducts(data);
      
      if (data.length > 0) {
        setSelectedProduct(data[0]);
      }
    } catch (error) {
      console.error('Error fetching product performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizationSuggestions = async (productId: string) => {
    try {
      const response = await fetch(`/api/analytics/products/${productId}/suggestions`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'sales':
        return b.unitsSold - a.unitsSold;
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'performance':
        return b.performanceScore - a.performanceScore;
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} SOL`;
  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const getTrendIcon = (trend: string) => {
    if (trend === 'INCREASING') return '📈';
    if (trend === 'DECREASING') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'INCREASING') return 'text-green-600';
    if (trend === 'DECREASING') return 'text-red-600';
    return 'text-gray-600';
  };

  const getDemandColor = (demand: string) => {
    if (demand === 'HIGH') return 'bg-green-100 text-green-800';
    if (demand === 'MEDIUM') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRecommendationIcon = (type: RecommendationType) => {
    const icons = {
      [RecommendationType.PRICE_OPTIMIZATION]: '💰',
      [RecommendationType.STOCK_MANAGEMENT]: '📦',
      [RecommendationType.MARKETING]: '📢',
      [RecommendationType.QUALITY_IMPROVEMENT]: '⭐',
      [RecommendationType.DESCRIPTION_UPDATE]: '📝',
      [RecommendationType.IMAGE_IMPROVEMENT]: '📸',
    };
    return icons[type] || '💡';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'HIGH') return 'bg-red-100 text-red-800 border-red-500';
    if (priority === 'MEDIUM') return 'bg-yellow-100 text-yellow-800 border-yellow-500';
    return 'bg-blue-100 text-blue-800 border-blue-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'EASY') return 'text-green-600';
    if (difficulty === 'MEDIUM') return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!publicKey) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-600">Please connect your wallet to view product performance</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Product Performance</h1>
          <p className="text-gray-600 mt-1">Detailed insights and optimization recommendations</p>
        </div>

        {/* Sort Selector */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="sales">Sort by Sales</option>
          <option value="rating">Sort by Rating</option>
          <option value="performance">Sort by Performance Score</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Your Products</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {sortedProducts.map((product) => (
              <div
                key={product.productId}
                onClick={() => setSelectedProduct(product)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedProduct?.productId === product.productId
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-white border border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{product.productName}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-medium text-green-600">{formatCurrency(product.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Sales</p>
                    <p className="font-medium text-gray-900">{formatNumber(product.unitsSold)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rating</p>
                    <p className="font-medium text-yellow-600">⭐ {product.averageRating.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Score</p>
                    <p className="font-medium text-blue-600">{product.performanceScore.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        {selectedProduct && (
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedProduct.productName}</h2>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedProduct.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Units Sold</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(selectedProduct.unitsSold)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-xl font-bold text-yellow-600">
                    ⭐ {selectedProduct.averageRating.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Performance</p>
                  <p className="text-xl font-bold text-blue-600">
                    {selectedProduct.performanceScore.toFixed(0)}
                  </p>
                </div>
              </div>

              {/* Trends & Status */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Sales Trend</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getTrendIcon(selectedProduct.salesTrend)}</span>
                    <span className={`font-semibold ${getTrendColor(selectedProduct.salesTrend)}`}>
                      {selectedProduct.salesTrend}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Demand Level</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDemandColor(selectedProduct.demandTrend)}`}>
                    {selectedProduct.demandTrend}
                  </span>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">View Count</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(selectedProduct.viewCount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatPercentage(selectedProduct.conversionRate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedProduct.averagePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(selectedProduct.currentStock)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Turnover Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProduct.stockTurnoverRate.toFixed(2)}x
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days in Inventory</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProduct.daysInInventory.toFixed(0)} days
                  </p>
                </div>
              </div>
            </div>

            {/* Category Comparison */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Category Comparison</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Category Rank</span>
                    <span className="text-lg font-bold text-blue-600">
                      #{selectedProduct.categoryRank}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Your Performance</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedProduct.performanceScore.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 rounded-full h-3"
                      style={{ width: `${(selectedProduct.performanceScore / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Category Average</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedProduct.categoryAverage.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gray-400 rounded-full h-3"
                      style={{ width: `${(selectedProduct.categoryAverage / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
              {selectedProduct.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {selectedProduct.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`border-l-4 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getRecommendationIcon(rec.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{rec.description}</p>
                          <p className="text-sm font-medium mb-2">
                            Expected Impact: {rec.expectedImpact}
                          </p>
                          <ul className="text-sm space-y-1">
                            {rec.actionItems.map((item, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <span>•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recommendations available</p>
              )}
            </div>

            {/* Optimization Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Optimization Suggestions</h3>
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                        </div>
                        <span className={`text-sm font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
                          {suggestion.difficulty}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Potential Impact</p>
                          <p className="font-semibold text-green-600">
                            +{formatCurrency(suggestion.potentialImpact.revenue)} (
                            {formatPercentage(suggestion.potentialImpact.percentage)})
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time to Implement</p>
                          <p className="font-semibold text-gray-900">{suggestion.timeToImplement}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Steps:</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
                          {suggestion.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPerformance;
