export interface SellerMetrics {
  sellerId: string;
  period: TimePeriod;
  
  // Revenue metrics
  totalRevenue: number;
  netRevenue: number;
  commissionPaid: number;
  averageOrderValue: number;
  
  // Transaction metrics
  totalTransactions: number;
  completedTransactions: number;
  cancelledTransactions: number;
  refundedTransactions: number;
  conversionRate: number;
  
  // Reputation metrics
  averageRating: number;
  totalReviews: number;
  positiveReputationCards: number;
  negativeReputationCards: number;
  reputationScore: number;
  
  // Performance metrics
  averageDeliveryTime: number; // in hours
  onTimeDeliveryRate: number;
  customerSatisfactionRate: number;
  repeatCustomerRate: number;
  
  // Growth metrics
  revenueGrowth: number; // percentage
  transactionGrowth: number; // percentage
  customerGrowth: number; // percentage
  
  // Timestamps
  startDate: Date;
  endDate: Date;
  lastUpdated: Date;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  
  // Sales metrics
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  unitsSold: number;
  
  // Performance metrics
  viewCount: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
  
  // Inventory metrics
  currentStock: number;
  stockTurnoverRate: number;
  daysInInventory: number;
  
  // Comparison metrics
  categoryRank: number;
  categoryAverage: number;
  performanceScore: number;
  
  // Trends
  salesTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  demandTrend: 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Recommendations
  recommendations: ProductRecommendation[];
}

export interface ProductRecommendation {
  type: RecommendationType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  expectedImpact: string;
  actionItems: string[];
}

export enum RecommendationType {
  PRICE_OPTIMIZATION = 'PRICE_OPTIMIZATION',
  STOCK_MANAGEMENT = 'STOCK_MANAGEMENT',
  MARKETING = 'MARKETING',
  QUALITY_IMPROVEMENT = 'QUALITY_IMPROVEMENT',
  DESCRIPTION_UPDATE = 'DESCRIPTION_UPDATE',
  IMAGE_IMPROVEMENT = 'IMAGE_IMPROVEMENT',
}

export interface SalesData {
  date: Date;
  revenue: number;
  transactions: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  imageUrl: string;
  totalRevenue: number;
  unitsSold: number;
  averageRating: number;
  rank: number;
}

export interface CustomerInsight {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  repeatRate: number;
  averageLifetimeValue: number;
  topCustomers: TopCustomer[];
}

export interface TopCustomer {
  customerId: string;
  totalSpent: number;
  orderCount: number;
  averageOrderValue: number;
  lastPurchase: Date;
}

export interface CompetitorComparison {
  metric: string;
  yourValue: number;
  categoryAverage: number;
  topPerformer: number;
  percentile: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: Date;
  dismissedAt?: Date;
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  POOR_PERFORMANCE = 'POOR_PERFORMANCE',
  NEGATIVE_REVIEWS = 'NEGATIVE_REVIEWS',
  PRICE_OPPORTUNITY = 'PRICE_OPPORTUNITY',
  DELIVERY_DELAY = 'DELIVERY_DELAY',
  COMPETITOR_ACTIVITY = 'COMPETITOR_ACTIVITY',
  SEASONAL_TREND = 'SEASONAL_TREND',
}

export interface MarketTrend {
  category: string;
  trend: 'RISING' | 'STABLE' | 'FALLING';
  growthRate: number;
  topProducts: string[];
  averagePrice: number;
  demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  seasonality: SeasonalityData;
}

export interface SeasonalityData {
  peakMonths: number[];
  lowMonths: number[];
  currentPhase: 'PEAK' | 'NORMAL' | 'LOW';
}

export interface ReportConfig {
  type: 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
  format: 'PDF' | 'CSV' | 'JSON';
  startDate: Date;
  endDate: Date;
  includeCharts: boolean;
  includeComparisons: boolean;
  includeRecommendations: boolean;
  sections: ReportSection[];
}

export enum ReportSection {
  OVERVIEW = 'OVERVIEW',
  REVENUE = 'REVENUE',
  PRODUCTS = 'PRODUCTS',
  CUSTOMERS = 'CUSTOMERS',
  REPUTATION = 'REPUTATION',
  PERFORMANCE = 'PERFORMANCE',
  TRENDS = 'TRENDS',
  RECOMMENDATIONS = 'RECOMMENDATIONS',
}

export interface ExportedReport {
  id: string;
  sellerId: string;
  config: ReportConfig;
  generatedAt: Date;
  fileUrl: string;
  fileSize: number;
  expiresAt: Date;
}

export type TimePeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
}

export interface AnalyticsFilter {
  period: TimePeriod;
  dateRange?: DateRange;
  productIds?: string[];
  categories?: string[];
  minRevenue?: number;
  maxRevenue?: number;
}

export interface PerformanceScore {
  overall: number;
  sales: number;
  reputation: number;
  delivery: number;
  customerService: number;
  breakdown: {
    [key: string]: {
      score: number;
      weight: number;
      description: string;
    };
  };
}

export interface OptimizationSuggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  potentialImpact: {
    revenue: number;
    percentage: number;
  };
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeToImplement: string;
  steps: string[];
  priority: number;
}

export interface BenchmarkData {
  metric: string;
  yourValue: number;
  categoryAverage: number;
  topQuartile: number;
  bottomQuartile: number;
  yourPercentile: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface RevenueBreakdown {
  productSales: number;
  shippingFees: number;
  otherIncome: number;
  totalGross: number;
  commissions: number;
  refunds: number;
  totalNet: number;
}

export interface CustomerSegment {
  segment: string;
  customerCount: number;
  averageOrderValue: number;
  totalRevenue: number;
  percentage: number;
  characteristics: string[];
}

export interface ForecastData {
  period: string;
  predictedRevenue: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factors: string[];
}
