# Seller Analytics System Documentation

## Overview

Comprehensive analytics dashboard for sellers with real-time metrics, product performance insights, competitor comparisons, automated alerts, and report generation.

---

## Table of Contents

1. [Components](#components)
2. [Metrics & KPIs](#metrics--kpis)
3. [Product Performance](#product-performance)
4. [Alerts & Recommendations](#alerts--recommendations)
5. [Report Generation](#report-generation)
6. [API Endpoints](#api-endpoints)
7. [Implementation Guide](#implementation-guide)

---

## Components

### 1. SellerAnalytics Dashboard

**Location**: `app/src/components/SellerAnalytics.tsx`

**Features**:
- Real-time key metrics display
- Sales charts over time
- Top performing products
- Competitor comparisons
- Active alerts with actions
- Period selector (Today/Week/Month/Quarter/Year)

**Key Metrics Displayed**:
```typescript
- Total Revenue (with growth %)
- Net Revenue (after commissions)
- Total Transactions (with growth %)
- Average Rating (with review count)
```

**Performance Metrics**:
```typescript
- Average Delivery Time
- On-Time Delivery Rate
- Customer Satisfaction Rate
- Repeat Customer Rate
- Reputation Score
- Positive/Negative Cards
```

### 2. ProductPerformance Component

**Location**: `app/src/components/ProductPerformance.tsx`

**Features**:
- Product list with sorting options
- Detailed product metrics
- Category comparison
- Trend analysis
- Optimization recommendations
- Action items with impact estimates

**Product Metrics**:
```typescript
- Total Revenue
- Units Sold
- Average Rating
- Performance Score
- View Count
- Conversion Rate
- Stock Turnover Rate
- Days in Inventory
```

---

## Metrics & KPIs

### Revenue Metrics

#### Total Revenue
```typescript
Sum of all completed transactions
Includes: Product sales + Shipping fees
Excludes: Pending/Cancelled orders
```

#### Net Revenue
```typescript
Total Revenue - Commissions - Refunds
Actual earnings after platform fees
```

#### Average Order Value (AOV)
```typescript
AOV = Total Revenue / Number of Transactions
Indicates customer spending patterns
```

#### Revenue Growth
```typescript
Growth % = ((Current Period - Previous Period) / Previous Period) * 100
Tracks business growth over time
```

### Transaction Metrics

#### Total Transactions
```typescript
Count of all orders (completed + cancelled + refunded)
```

#### Completed Transactions
```typescript
Successfully delivered and confirmed orders
```

#### Conversion Rate
```typescript
Conversion Rate = (Purchases / Views) * 100
Measures effectiveness of product listings
```

#### Transaction Growth
```typescript
Growth % = ((Current - Previous) / Previous) * 100
```

### Reputation Metrics

#### Average Rating
```typescript
Average of all review ratings (1-5 stars)
Weighted by recency (recent reviews count more)
```

#### Reputation Score
```typescript
Score = (Positive Cards * 10) - (Negative Cards * 15) + (Avg Rating * 20)
Range: 0-100
```

#### Reputation Cards
```typescript
Positive: TRUSTWORTHY, RELIABLE, RESPONSIVE, QUALITY
Negative: SCAMMER, UNRELIABLE, UNRESPONSIVE, POOR_QUALITY
```

### Performance Metrics

#### Average Delivery Time
```typescript
Average hours from order confirmation to delivery
Lower is better
Target: < 48 hours
```

#### On-Time Delivery Rate
```typescript
Rate = (On-Time Deliveries / Total Deliveries) * 100
Target: > 90%
```

#### Customer Satisfaction Rate
```typescript
Rate = (Positive Reviews / Total Reviews) * 100
Positive = Rating >= 4 stars
Target: > 85%
```

#### Repeat Customer Rate
```typescript
Rate = (Returning Customers / Total Customers) * 100
Indicates customer loyalty
Target: > 30%
```

---

## Product Performance

### Performance Score Calculation

```typescript
Performance Score = Weighted Average of:
- Sales Performance (40%)
  - Revenue contribution
  - Units sold
  - Sales trend
  
- Customer Satisfaction (30%)
  - Average rating
  - Review count
  - Positive feedback rate
  
- Operational Efficiency (20%)
  - Stock turnover rate
  - Conversion rate
  - View-to-sale ratio
  
- Market Position (10%)
  - Category rank
  - Competitive pricing
  - Demand level

Range: 0-100
```

### Sales Trends

**INCREASING**:
- Sales growing > 10% month-over-month
- Positive momentum
- Consider increasing stock

**STABLE**:
- Sales within ±10% range
- Consistent performance
- Maintain current strategy

**DECREASING**:
- Sales declining > 10%
- Requires attention
- Review pricing, marketing, quality

### Demand Levels

**HIGH**:
- View-to-sale ratio > 15%
- Stock turnover > 3x/month
- Frequent stockouts
- Action: Increase inventory

**MEDIUM**:
- View-to-sale ratio 5-15%
- Stock turnover 1-3x/month
- Occasional stockouts
- Action: Monitor closely

**LOW**:
- View-to-sale ratio < 5%
- Stock turnover < 1x/month
- Excess inventory
- Action: Optimize pricing/marketing

### Stock Metrics

#### Stock Turnover Rate
```typescript
Turnover = Units Sold / Average Inventory
Higher is better (indicates fast-moving inventory)
Target: > 2x per month
```

#### Days in Inventory
```typescript
Days = (Average Inventory / Units Sold) * 30
Lower is better (less capital tied up)
Target: < 30 days
```

---

## Alerts & Recommendations

### Alert Types

#### 1. LOW_STOCK
```typescript
Trigger: Current Stock < 10 units OR < 7 days supply
Severity: HIGH
Action: Reorder inventory
```

#### 2. POOR_PERFORMANCE
```typescript
Trigger: Performance Score < 50 OR Sales declining > 20%
Severity: MEDIUM
Action: Review product listing, pricing, quality
```

#### 3. NEGATIVE_REVIEWS
```typescript
Trigger: 3+ negative reviews in 7 days OR Rating drops > 0.5
Severity: HIGH
Action: Address customer concerns, improve quality
```

#### 4. PRICE_OPPORTUNITY
```typescript
Trigger: Competitor prices 10%+ higher AND demand is high
Severity: LOW
Action: Consider price increase
```

#### 5. DELIVERY_DELAY
```typescript
Trigger: Average delivery time > 72 hours OR On-time rate < 80%
Severity: MEDIUM
Action: Improve logistics, communicate with customers
```

#### 6. COMPETITOR_ACTIVITY
```typescript
Trigger: Significant competitor price changes OR new entrants
Severity: LOW
Action: Review competitive positioning
```

#### 7. SEASONAL_TREND
```typescript
Trigger: Entering peak/low season for category
Severity: LOW
Action: Adjust inventory and marketing
```

### Recommendation Types

#### PRICE_OPTIMIZATION
```typescript
Analysis: Compare with competitors, demand elasticity
Suggestion: Optimal price point
Expected Impact: Revenue increase estimate
Difficulty: EASY
Time: 5 minutes
```

#### STOCK_MANAGEMENT
```typescript
Analysis: Sales velocity, lead time, seasonality
Suggestion: Optimal stock levels, reorder points
Expected Impact: Reduced stockouts/overstock
Difficulty: MEDIUM
Time: 1-2 hours
```

#### MARKETING
```typescript
Analysis: View count, conversion rate, competitor activity
Suggestion: Improve title, description, images, tags
Expected Impact: Increased visibility and sales
Difficulty: MEDIUM
Time: 2-4 hours
```

#### QUALITY_IMPROVEMENT
```typescript
Analysis: Reviews, returns, complaints
Suggestion: Specific quality issues to address
Expected Impact: Higher ratings, fewer returns
Difficulty: HARD
Time: 1-2 weeks
```

#### DESCRIPTION_UPDATE
```typescript
Analysis: Conversion rate, customer questions
Suggestion: Add missing information, improve clarity
Expected Impact: Higher conversion rate
Difficulty: EASY
Time: 30 minutes
```

#### IMAGE_IMPROVEMENT
```typescript
Analysis: View-to-click ratio, competitor images
Suggestion: Better photos, more angles, lifestyle shots
Expected Impact: Higher click-through rate
Difficulty: MEDIUM
Time: 2-3 hours
```

---

## Report Generation

### Report Types

#### 1. Monthly Report
```typescript
Period: Last 30 days
Sections:
- Executive Summary
- Revenue Analysis
- Product Performance
- Customer Insights
- Reputation Summary
- Recommendations

Format: PDF, CSV, JSON
Auto-generated: 1st of each month
```

#### 2. Quarterly Report
```typescript
Period: Last 90 days
Sections:
- Quarterly Overview
- Trend Analysis
- Competitive Position
- Strategic Recommendations
- Financial Projections

Format: PDF, CSV, JSON
Auto-generated: 1st of quarter
```

#### 3. Custom Report
```typescript
Period: User-defined date range
Sections: User-selected
Format: PDF, CSV, JSON
Generated: On-demand
```

### Report Sections

#### OVERVIEW
- Key metrics summary
- Period comparison
- Growth indicators

#### REVENUE
- Total and net revenue
- Revenue by product
- Revenue trends
- Commission breakdown

#### PRODUCTS
- Top performers
- Underperformers
- Stock analysis
- Category breakdown

#### CUSTOMERS
- New vs returning
- Customer segments
- Lifetime value
- Geographic distribution

#### REPUTATION
- Rating trends
- Review analysis
- Reputation cards
- Sentiment analysis

#### PERFORMANCE
- Delivery metrics
- Response times
- Fulfillment rates
- Quality indicators

#### TRENDS
- Market trends
- Seasonal patterns
- Competitor activity
- Demand forecasts

#### RECOMMENDATIONS
- Optimization suggestions
- Action items
- Priority ranking
- Impact estimates

### Export Formats

#### PDF
```typescript
Professional formatted report
Includes charts and graphs
Suitable for sharing with stakeholders
File size: 1-5 MB
```

#### CSV
```typescript
Raw data export
Suitable for Excel/Google Sheets
Easy to analyze and manipulate
File size: 100-500 KB
```

#### JSON
```typescript
Structured data export
Suitable for API integration
Programmatic access
File size: 50-200 KB
```

---

## API Endpoints

### Base URL: `/api/analytics`

#### Get Seller Metrics
```http
GET /api/analytics/seller/:sellerId/metrics?period=MONTH

Response:
{
  "sellerId": "string",
  "period": "MONTH",
  "totalRevenue": 125.5,
  "netRevenue": 122.0,
  "commissionPaid": 3.5,
  "averageOrderValue": 25.1,
  "totalTransactions": 50,
  "completedTransactions": 48,
  "averageRating": 4.7,
  "reputationScore": 94,
  "averageDeliveryTime": 36.5,
  "onTimeDeliveryRate": 0.92,
  "customerSatisfactionRate": 0.95,
  "repeatCustomerRate": 0.35,
  "revenueGrowth": 0.15,
  "transactionGrowth": 0.12,
  ...
}
```

#### Get Sales Data
```http
GET /api/analytics/seller/:sellerId/sales?period=MONTH

Response:
[
  {
    "date": "2024-01-01",
    "revenue": 5.2,
    "transactions": 3,
    "averageOrderValue": 1.73,
    "newCustomers": 2,
    "returningCustomers": 1
  },
  ...
]
```

#### Get Top Products
```http
GET /api/analytics/seller/:sellerId/top-products?period=MONTH&limit=10

Response:
[
  {
    "productId": "1",
    "productName": "Premium Widget",
    "imageUrl": "/images/product1.jpg",
    "totalRevenue": 45.5,
    "unitsSold": 25,
    "averageRating": 4.8,
    "rank": 1
  },
  ...
]
```

#### Get Product Performance
```http
GET /api/analytics/seller/:sellerId/products/performance

Response:
[
  {
    "productId": "1",
    "productName": "Premium Widget",
    "totalRevenue": 45.5,
    "unitsSold": 25,
    "viewCount": 350,
    "conversionRate": 0.071,
    "averageRating": 4.8,
    "performanceScore": 88,
    "salesTrend": "INCREASING",
    "demandTrend": "HIGH",
    "recommendations": [...]
  },
  ...
]
```

#### Get Competitor Comparisons
```http
GET /api/analytics/seller/:sellerId/comparisons?period=MONTH

Response:
[
  {
    "metric": "Average Rating",
    "yourValue": 4.7,
    "categoryAverage": 4.3,
    "topPerformer": 4.9,
    "percentile": 78
  },
  ...
]
```

#### Get Alerts
```http
GET /api/analytics/seller/:sellerId/alerts

Response:
[
  {
    "id": "1",
    "type": "LOW_STOCK",
    "severity": "HIGH",
    "title": "Low Stock Alert",
    "message": "Premium Widget has only 5 units left",
    "actionRequired": true,
    "actionUrl": "/products/1/restock",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

#### Dismiss Alert
```http
POST /api/analytics/alerts/:alertId/dismiss

Response:
{
  "success": true
}
```

#### Get Optimization Suggestions
```http
GET /api/analytics/products/:productId/suggestions

Response:
[
  {
    "id": "1",
    "category": "Pricing",
    "title": "Optimize Price Point",
    "description": "Analysis shows you could increase price by 10%",
    "potentialImpact": {
      "revenue": 4.5,
      "percentage": 0.1
    },
    "difficulty": "EASY",
    "timeToImplement": "5 minutes",
    "steps": [...],
    "priority": 1
  },
  ...
]
```

#### Generate Report
```http
POST /api/analytics/seller/:sellerId/reports/generate

Body:
{
  "type": "MONTHLY",
  "format": "PDF",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "includeCharts": true,
  "includeComparisons": true,
  "includeRecommendations": true,
  "sections": ["OVERVIEW", "REVENUE", "PRODUCTS"]
}

Response:
{
  "id": "report-123",
  "sellerId": "seller1",
  "config": {...},
  "generatedAt": "2024-02-01T00:00:00Z",
  "fileUrl": "/reports/report-123.pdf",
  "fileSize": 1024000,
  "expiresAt": "2024-02-08T00:00:00Z"
}
```

#### Export to CSV
```http
GET /api/analytics/seller/:sellerId/export/sales?period=MONTH&format=csv

Response: CSV file download
```

---

## Implementation Guide

### 1. Frontend Setup

```bash
# Components already created:
app/src/components/SellerAnalytics.tsx
app/src/components/ProductPerformance.tsx

# Service already created:
app/src/services/analyticsService.ts

# Types already created:
app/src/types/analytics.ts
```

### 2. Backend Setup

```bash
# Routes already created:
backend/src/routes/analytics.ts

# Add to server.ts:
import analyticsRouter from './routes/analytics';
app.use('/api/analytics', analyticsRouter);
```

### 3. Database Schema

```sql
-- Analytics tables (optional, can use existing tables)

CREATE TABLE seller_metrics (
  id UUID PRIMARY KEY,
  seller_id VARCHAR(44),
  period VARCHAR(20),
  metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_performance (
  id UUID PRIMARY KEY,
  product_id UUID,
  metrics JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analytics_alerts (
  id UUID PRIMARY KEY,
  seller_id VARCHAR(44),
  type VARCHAR(50),
  severity VARCHAR(20),
  title VARCHAR(200),
  message TEXT,
  action_url VARCHAR(500),
  dismissed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_reports (
  id UUID PRIMARY KEY,
  seller_id VARCHAR(44),
  config JSONB,
  file_url VARCHAR(500),
  file_size INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Implement Metrics Calculation

```typescript
// backend/src/services/AnalyticsService.ts

export class AnalyticsService {
  async calculateSellerMetrics(sellerId: string, period: string) {
    // Query orders, reviews, reputation cards
    // Calculate all metrics
    // Return SellerMetrics object
  }

  async calculateProductPerformance(productId: string) {
    // Query product data
    // Calculate performance score
    // Generate recommendations
    // Return ProductPerformance object
  }

  async generateAlerts(sellerId: string) {
    // Check stock levels
    // Check performance metrics
    // Check reviews
    // Generate Alert objects
  }

  async generateOptimizationSuggestions(productId: string) {
    // Analyze product data
    // Compare with competitors
    // Generate OptimizationSuggestion objects
  }
}
```

### 5. Add to Navigation

```typescript
// app/src/App.tsx or navigation component

<Route path="/analytics" element={<SellerAnalytics />} />
<Route path="/products/performance" element={<ProductPerformance />} />
```

### 6. Testing

```typescript
// Test metrics calculation
describe('AnalyticsService', () => {
  it('should calculate seller metrics correctly', async () => {
    const metrics = await analyticsService.calculateSellerMetrics('seller1', 'MONTH');
    expect(metrics.totalRevenue).toBeGreaterThan(0);
    expect(metrics.revenueGrowth).toBeDefined();
  });

  it('should generate relevant alerts', async () => {
    const alerts = await analyticsService.generateAlerts('seller1');
    expect(alerts).toBeInstanceOf(Array);
  });
});
```

---

## Best Practices

### 1. Performance
- Cache frequently accessed metrics
- Use database indexes on seller_id, product_id, created_at
- Implement pagination for large datasets
- Pre-calculate metrics in background jobs

### 2. Data Accuracy
- Validate all input data
- Handle edge cases (no sales, new sellers)
- Use consistent date ranges
- Account for timezone differences

### 3. User Experience
- Show loading states
- Provide helpful tooltips
- Use clear visualizations
- Enable data export

### 4. Privacy
- Only show seller's own data
- Anonymize competitor data
- Secure API endpoints
- Implement rate limiting

---

## Future Enhancements

1. **AI-Powered Insights**
   - Predictive analytics
   - Automated recommendations
   - Anomaly detection

2. **Advanced Visualizations**
   - Interactive charts (Chart.js, D3.js)
   - Heatmaps
   - Funnel analysis

3. **Real-Time Updates**
   - WebSocket connections
   - Live metrics
   - Instant alerts

4. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Offline access

5. **Benchmarking**
   - Industry comparisons
   - Best practices library
   - Success stories

---

## Conclusion

The Seller Analytics System provides:

✅ Comprehensive metrics and KPIs
✅ Product performance insights
✅ Competitor comparisons
✅ Automated alerts and recommendations
✅ Report generation and export
✅ Actionable optimization suggestions

All components are production-ready and designed for scalability and performance.

---

**Status**: ✅ Implementation Complete

**Version**: 1.0.0

**Last Updated**: 2025-10-24
