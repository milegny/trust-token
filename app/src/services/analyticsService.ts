import {
  SellerMetrics,
  SalesData,
  TopProduct,
  ProductPerformance,
  CompetitorComparison,
  Alert,
  TimePeriod,
  ReportConfig,
  ExportedReport,
  OptimizationSuggestion,
} from '../types/analytics';

/**
 * Get seller metrics for a period
 */
export async function getSellerMetrics(
  sellerId: string,
  period: TimePeriod
): Promise<SellerMetrics> {
  try {
    const response = await fetch(`/api/analytics/seller/${sellerId}/metrics?period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching seller metrics:', error);
    throw error;
  }
}

/**
 * Get sales data over time
 */
export async function getSalesData(
  sellerId: string,
  period: TimePeriod
): Promise<SalesData[]> {
  try {
    const response = await fetch(`/api/analytics/seller/${sellerId}/sales?period=${period}`);
    if (!response.ok) throw new Error('Failed to fetch sales data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return [];
  }
}

/**
 * Get top performing products
 */
export async function getTopProducts(
  sellerId: string,
  period: TimePeriod,
  limit: number = 10
): Promise<TopProduct[]> {
  try {
    const response = await fetch(
      `/api/analytics/seller/${sellerId}/top-products?period=${period}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch top products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
}

/**
 * Get product performance details
 */
export async function getProductPerformance(sellerId: string): Promise<ProductPerformance[]> {
  try {
    const response = await fetch(`/api/analytics/seller/${sellerId}/products/performance`);
    if (!response.ok) throw new Error('Failed to fetch product performance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching product performance:', error);
    return [];
  }
}

/**
 * Get competitor comparisons
 */
export async function getCompetitorComparisons(
  sellerId: string,
  period: TimePeriod
): Promise<CompetitorComparison[]> {
  try {
    const response = await fetch(
      `/api/analytics/seller/${sellerId}/comparisons?period=${period}`
    );
    if (!response.ok) throw new Error('Failed to fetch comparisons');
    return await response.json();
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    return [];
  }
}

/**
 * Get active alerts for seller
 */
export async function getAlerts(sellerId: string): Promise<Alert[]> {
  try {
    const response = await fetch(`/api/analytics/seller/${sellerId}/alerts`);
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(alertId: string): Promise<void> {
  try {
    const response = await fetch(`/api/analytics/alerts/${alertId}/dismiss`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to dismiss alert');
  } catch (error) {
    console.error('Error dismissing alert:', error);
    throw error;
  }
}

/**
 * Get optimization suggestions for a product
 */
export async function getOptimizationSuggestions(
  productId: string
): Promise<OptimizationSuggestion[]> {
  try {
    const response = await fetch(`/api/analytics/products/${productId}/suggestions`);
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}

/**
 * Generate and export report
 */
export async function generateReport(
  sellerId: string,
  config: ReportConfig
): Promise<ExportedReport> {
  try {
    const response = await fetch(`/api/analytics/seller/${sellerId}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to generate report');
    return await response.json();
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

/**
 * Get list of generated reports
 */
export async function getReports(sellerId: string): Promise<ExportedReport[]> {
  try {
    const response = await fetch(`/api/analytics/seller/${sellerId}/reports`);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

/**
 * Download report file
 */
export async function downloadReport(reportId: string): Promise<void> {
  try {
    const response = await fetch(`/api/analytics/reports/${reportId}/download`);
    if (!response.ok) throw new Error('Failed to download report');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}

/**
 * Export data to CSV
 */
export async function exportToCSV(
  sellerId: string,
  dataType: 'sales' | 'products' | 'customers',
  period: TimePeriod
): Promise<void> {
  try {
    const response = await fetch(
      `/api/analytics/seller/${sellerId}/export/${dataType}?period=${period}&format=csv`
    );
    if (!response.ok) throw new Error('Failed to export data');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataType}-${period}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

/**
 * Get performance score breakdown
 */
export async function getPerformanceScore(sellerId: string): Promise<any> {
  try {
    const response = await fetch(`/api/analytics/seller/${sellerId}/performance-score`);
    if (!response.ok) throw new Error('Failed to fetch performance score');
    return await response.json();
  } catch (error) {
    console.error('Error fetching performance score:', error);
    throw error;
  }
}

/**
 * Get market trends for category
 */
export async function getMarketTrends(category: string): Promise<any> {
  try {
    const response = await fetch(`/api/analytics/market/trends/${category}`);
    if (!response.ok) throw new Error('Failed to fetch market trends');
    return await response.json();
  } catch (error) {
    console.error('Error fetching market trends:', error);
    throw error;
  }
}

/**
 * Get revenue forecast
 */
export async function getRevenueForecast(
  sellerId: string,
  months: number = 3
): Promise<any> {
  try {
    const response = await fetch(
      `/api/analytics/seller/${sellerId}/forecast?months=${months}`
    );
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return await response.json();
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

export default {
  getSellerMetrics,
  getSalesData,
  getTopProducts,
  getProductPerformance,
  getCompetitorComparisons,
  getAlerts,
  dismissAlert,
  getOptimizationSuggestions,
  generateReport,
  getReports,
  downloadReport,
  exportToCSV,
  getPerformanceScore,
  getMarketTrends,
  getRevenueForecast,
};
