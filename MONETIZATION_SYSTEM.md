# Monetization System Documentation

## Overview

The TrustToken marketplace implements a transparent, redistributive monetization system designed to be sustainable, fair, and community-focused. All financial operations are on-chain and publicly auditable.

## Table of Contents

1. [Revenue Streams](#revenue-streams)
2. [Commission System](#commission-system)
3. [Fund Distribution](#fund-distribution)
4. [Insurance Pool](#insurance-pool)
5. [Premium Features](#premium-features)
6. [Staking System](#staking-system)
7. [Moderator Rewards](#moderator-rewards)
8. [Financial Transparency](#financial-transparency)
9. [Automated Reporting](#automated-reporting)
10. [Implementation Guide](#implementation-guide)

---

## Revenue Streams

### 1. Transaction Commissions
- **Primary revenue source**
- Automatically deducted from each marketplace transaction
- Two-tier system based on verification status
- Reduced by staking discounts

### 2. Premium Features
- One-time and recurring payments
- Verification Plus (5 SOL one-time)
- Analytics Pro (10 SOL/month)
- Reputation Boost (2 SOL/30 days)

### 3. Insurance Claim Fees
- Small processing fee for insurance claims
- Covers administrative costs
- Minimal impact on claimants

---

## Commission System

### Tiered Commission Rates

#### Standard Tier (2.5%)
- Applied when at least one user is unverified
- Base commission rate
- Can be reduced with staking

#### Premium Tier (4.0%)
- Applied when both users have TrustToken verification
- Higher rate for verified transactions
- Incentivizes verification
- Can be reduced with staking

### Commission Calculation

```typescript
// Determine tier
const tier = (buyerVerified && sellerVerified) 
  ? CommissionTier.PREMIUM 
  : CommissionTier.STANDARD;

// Calculate base commission
const baseRate = COMMISSION_RATES[tier]; // 0.025 or 0.04
const baseCommission = transactionAmount * baseRate;

// Apply staking discount
const stakingDiscount = transactionAmount * STAKING_DISCOUNTS[stakingTier];
const finalCommission = baseCommission - stakingDiscount;
```

### Automatic Deduction

1. Transaction initiated by buyer
2. Commission calculated based on verification status and staking tier
3. Commission automatically deducted from transaction
4. Funds distributed to treasury
5. Transaction recorded on-chain

---

## Fund Distribution

### Allocation Percentages

All revenue is automatically distributed according to fixed percentages:

| Allocation | Percentage | Purpose |
|------------|-----------|---------|
| **Operations** | 15% | Platform maintenance, development, infrastructure |
| **Insurance Pool** | 25% | User protection fund for disputes and claims |
| **Moderation** | 25% | Rewards for community moderators |
| **Founder** | 35% | Founder compensation and reinvestment |

### Distribution Process

1. **Revenue Collection**: All commissions flow to treasury wallet
2. **Automatic Split**: Smart contract automatically distributes funds
3. **On-Chain Recording**: All distributions recorded on blockchain
4. **Real-Time Updates**: Dashboard shows live distribution data

### Transparency

- All distributions are publicly visible
- Transaction signatures available for verification
- Historical data accessible via API
- Monthly reports generated automatically

---

## Insurance Pool

### Smart Contract: `insurance_pool`

A dedicated Solana program manages the insurance fund with complete transparency.

### Key Features

#### 1. Claim Creation
```rust
pub fn create_claim(
    ctx: Context<CreateClaim>,
    order_id: String,
    amount: u64,
    reason: String,
) -> Result<()>
```

- Minimum claim: 0.1 SOL
- Maximum claim: 100 SOL (coverage limit)
- Automatic validation
- 72-hour voting period

#### 2. Community Voting
```rust
pub fn vote_on_claim(
    ctx: Context<VoteOnClaim>,
    approve: bool,
) -> Result<()>
```

- Any verified user can vote
- One vote per user per claim
- Votes recorded on-chain
- 72-hour voting window

#### 3. Claim Finalization
```rust
pub fn finalize_claim(
    ctx: Context<FinalizeClaim>,
) -> Result<()>
```

- Requires minimum 3 votes
- 66% approval threshold
- Automatic approval/rejection
- Transparent process

#### 4. Payout
```rust
pub fn payout_claim(
    ctx: Context<PayoutClaim>,
) -> Result<()>
```

- Only approved claims
- Automatic transfer to claimant
- Pool balance updated
- Transaction recorded

### Coverage Limits

- **Minimum Claim**: 0.1 SOL
- **Maximum Claim**: 100 SOL
- **Coverage Percentage**: 80% of transaction value
- **Voting Period**: 72 hours
- **Approval Threshold**: 66%

### Pool Health Monitoring

- Real-time balance tracking
- Claim rate monitoring
- Automatic alerts for low balance
- Monthly health reports

---

## Premium Features

### 1. Verification Plus (5 SOL one-time)

**Benefits:**
- Enhanced verification badge
- Priority customer support
- Exclusive marketplace features
- Lower commission rates (4% → 3%)
- Lifetime access

**Use Case:** Serious sellers and frequent buyers

### 2. Analytics Pro (10 SOL/month)

**Benefits:**
- Advanced analytics dashboard
- Detailed transaction insights
- Export data to CSV/PDF
- Custom reports
- Real-time notifications

**Use Case:** Professional sellers and data-driven users

### 3. Reputation Boost (2 SOL/30 days)

**Benefits:**
- Featured placement in search
- Highlighted reputation badge
- Increased visibility
- Priority in recommendations
- Active for 30 days

**Use Case:** New sellers building reputation

### Purchase Flow

1. User selects premium feature
2. Price displayed in SOL
3. Transaction created on Solana
4. Payment confirmed on-chain
5. Feature activated immediately
6. Expiry tracked (if applicable)

---

## Staking System

### Overview

Optional staking system allows users to stake SOL for commission discounts and weekly rewards.

### Staking Tiers

| Tier | Requirement | Discount | Weekly APY |
|------|------------|----------|------------|
| **Bronze** | 10 SOL | 0.5% | 8% |
| **Silver** | 50 SOL | 1.0% | 8% |
| **Gold** | 100 SOL | 1.5% | 8% |

### Benefits

#### 1. Commission Discounts
- Automatically applied to all transactions
- Stacks with tier discounts
- Immediate activation
- No expiry

#### 2. Weekly Rewards
- 8% APY distributed weekly
- Calculated on staked amount
- Claimable anytime
- Compounding available

#### 3. Flexible Unstaking
- No lock-up period
- Unstake anytime
- No penalties
- Instant processing

### Staking Process

```typescript
// Stake SOL
1. User selects amount to stake
2. Transaction created
3. SOL transferred to staking wallet
4. Position recorded on-chain
5. Tier activated immediately

// Claim Rewards
1. Rewards calculated weekly
2. User claims pending rewards
3. SOL transferred to user wallet
4. Rewards history updated

// Unstake
1. User requests unstake
2. Position closed
3. SOL + pending rewards returned
4. Tier benefits removed
```

### Savings Calculator

Example: User with 50 SOL staked (Silver tier)
- Monthly transaction volume: 100 SOL
- Standard commission: 2.5 SOL (2.5%)
- With staking discount: 1.5 SOL (1.5%)
- **Monthly savings: 1 SOL**
- **Annual savings: 12 SOL**
- Plus weekly rewards: ~0.77 SOL/week

---

## Moderator Rewards

### Level System

#### Junior Moderator
- **Multiplier**: 1.0x
- **Requirements**: 0 disputes resolved
- **Base Reward**: 0.1 SOL per dispute

#### Senior Moderator
- **Multiplier**: 1.5x
- **Requirements**: 50 disputes resolved, 500 points
- **Base Reward**: 0.15 SOL per dispute

#### Elite Moderator
- **Multiplier**: 2.0x
- **Requirements**: 200 disputes resolved, 2000 points
- **Base Reward**: 0.2 SOL per dispute

### Reward Calculation

```typescript
const baseReward = 0.1; // SOL
const levelMultiplier = MODERATOR_LEVEL_MULTIPLIERS[level];
const bonusMultiplier = calculateBonus(dispute);
const totalReward = baseReward * levelMultiplier * bonusMultiplier;
```

### Bonus Multipliers

- **Fast Resolution** (< 24h): 1.2x (20% bonus)
- **Quality Resolution**: 1.3x (30% bonus)
- **Complex Case**: 1.5x (50% bonus)
- **Weekend Work**: 1.1x (10% bonus)

### Point System

Points earned for various actions:
- Resolve dispute: 10 points
- Resolve escalated: 20 points
- Resolve critical: 30 points
- Fast resolution: 5 points
- Quality resolution: 15 points
- Help community: 5 points

### Point Redemption

| Reward | Points Cost | Value |
|--------|-------------|-------|
| SOL Reward | 1000 | 1 SOL |
| Commission Discount (30 days) | 500 | 0.5% |
| Premium Trial (7 days) | 300 | Free |
| Custom Badge | 2000 | Unique |
| Priority Support (30 days) | 800 | Premium |

### Payment Process

1. Dispute resolved by moderator
2. Reward calculated based on level and bonuses
3. Payment recorded in backend
4. SOL transferred to moderator wallet
5. Points added to moderator account
6. Stats updated in real-time

---

## Financial Transparency

### Public Dashboard

#### Real-Time Metrics
- Total treasury balance
- Revenue by source
- Distribution by allocation
- Active users
- Transaction volume
- Insurance pool status

#### Historical Data
- Daily/Weekly/Monthly/Quarterly/Yearly views
- Revenue trends
- Distribution history
- User growth
- Transaction patterns

#### Blockchain Verification
- All transactions on-chain
- Public transaction signatures
- Verifiable fund movements
- Immutable records

### API Endpoints

```typescript
// Get current metrics
GET /api/transparency/metrics?period=MONTHLY

// Get historical data
GET /api/transparency/historical?period=MONTHLY&limit=12

// Get specific allocation
GET /api/transparency/allocation/:allocation

// Get revenue breakdown
GET /api/transparency/revenue/breakdown
```

### Data Privacy

- All data is anonymized
- No personal information exposed
- Wallet addresses truncated
- Aggregate statistics only

---

## Automated Reporting

### Report Types

#### 1. Monthly Reports
- Generated on 1st of each month
- Sent to stakeholders
- Includes:
  - Revenue summary
  - Expense breakdown
  - Key metrics
  - User growth
  - Recommendations

#### 2. Quarterly Reports
- Generated every 3 months
- Sent to DAO
- Includes:
  - Comprehensive financial analysis
  - Trend analysis
  - Strategic recommendations
  - Comparative data

#### 3. Annual Reports
- Generated yearly
- Public transparency report
- Includes:
  - Full year financial summary
  - Major milestones
  - Future roadmap
  - Fiscal compliance data

### Report Generation

```typescript
// Automatic generation
- Scheduled via cron jobs
- Data collected from blockchain
- Reports generated automatically
- Distributed to recipients

// Manual generation
- Admin can trigger anytime
- Useful for ad-hoc analysis
- Same format as automatic reports
```

### Report Contents

#### Summary Section
- Total revenue
- Total expenses
- Net income
- Treasury growth

#### Revenue Breakdown
- Commissions
- Premium features
- Insurance fees
- Other sources

#### Expense Breakdown
- Operations costs
- Insurance payouts
- Moderator rewards
- Development costs

#### Key Metrics
- Active users
- Transaction volume
- Average transaction value
- Commission rate
- Insurance claim rate
- Moderator efficiency

#### Recommendations
- AI-generated insights
- Optimization suggestions
- Risk assessments
- Growth opportunities

### Export Formats

- **PDF**: Professional formatted reports
- **CSV**: Raw data for analysis
- **JSON**: API integration

---

## Implementation Guide

### Frontend Components

#### 1. TreasuryDashboard
```typescript
// Location: app/src/components/TreasuryDashboard.tsx
// Purpose: Display real-time treasury data
// Features:
- Live balance updates
- Fund distribution visualization
- Recent revenue/distributions
- Top moderators leaderboard
- Insurance pool status
```

#### 2. ModeratorRewards
```typescript
// Location: app/src/components/ModeratorRewards.tsx
// Purpose: Moderator earnings and rewards
// Features:
- Level progression
- Points balance
- Recent rewards
- Redemption options
- Earnings history
```

#### 3. PremiumFeatures
```typescript
// Location: app/src/components/PremiumFeatures.tsx
// Purpose: Premium feature purchases
// Features:
- Feature cards with pricing
- Purchase flow
- Active features display
- Renewal management
```

#### 4. StakingDashboard
```typescript
// Location: app/src/components/StakingDashboard.tsx
// Purpose: Staking management
// Features:
- Current position display
- Tier comparison
- Stake/unstake actions
- Rewards claiming
- Savings calculator
```

#### 5. TransparencyDashboard
```typescript
// Location: app/src/components/TransparencyDashboard.tsx
// Purpose: Public financial transparency
// Features:
- Period selector
- Key metrics
- Revenue breakdown
- Historical trends
- Transparency statement
```

#### 6. FinancialReports
```typescript
// Location: app/src/components/FinancialReports.tsx
// Purpose: Report viewing and management
// Features:
- Report list with filters
- Report detail view
- PDF/CSV export
- Manual generation
```

### Backend Services

#### 1. Commission Service
```typescript
// Location: app/src/services/commissionService.ts
// Functions:
- determineCommissionTier()
- calculateCommission()
- processCommissionDeduction()
- getCommissionEstimate()
- getCommissionHistory()
```

#### 2. Reporting Service
```typescript
// Location: app/src/services/reportingService.ts
// Functions:
- generateFinancialReport()
- getFinancialReports()
- exportReportToPDF()
- exportReportToCSV()
- scheduleReportGeneration()
```

### Smart Contracts

#### 1. InsurancePool Program
```rust
// Location: programs/insurance_pool/src/lib.rs
// Instructions:
- initialize()
- deposit()
- create_claim()
- vote_on_claim()
- finalize_claim()
- payout_claim()
- update_coverage_limit()
```

### API Endpoints Required

#### Treasury Endpoints
```
GET  /api/treasury/balance/:wallet
GET  /api/treasury/revenue/recent
GET  /api/treasury/distributions/recent
GET  /api/treasury/moderators/top
POST /api/treasury/commission/record
GET  /api/treasury/commission/history/:wallet
```

#### Premium Features Endpoints
```
GET  /api/premium/active/:wallet
POST /api/premium/purchase
GET  /api/premium/history/:wallet
```

#### Staking Endpoints
```
GET  /api/staking/position/:wallet
GET  /api/staking/tier/:wallet
POST /api/staking/stake
POST /api/staking/unstake
POST /api/staking/claim-rewards
```

#### Transparency Endpoints
```
GET /api/transparency/metrics
GET /api/transparency/historical
GET /api/transparency/allocation/:allocation
GET /api/transparency/revenue/breakdown
```

#### Reporting Endpoints
```
POST /api/reports/generate
GET  /api/reports/list
GET  /api/reports/:id
GET  /api/reports/:id/export/pdf
GET  /api/reports/:id/export/csv
POST /api/reports/schedule
GET  /api/reports/schedule
POST /api/reports/send
GET  /api/reports/statistics
```

### Database Schema

#### Tables Required

```sql
-- Treasury transactions
CREATE TABLE treasury_transactions (
  id UUID PRIMARY KEY,
  type VARCHAR(50),
  amount DECIMAL(20, 9),
  from_wallet VARCHAR(44),
  to_wallet VARCHAR(44),
  category VARCHAR(100),
  description TEXT,
  tx_signature VARCHAR(88),
  timestamp TIMESTAMP,
  metadata JSONB
);

-- Commission records
CREATE TABLE commissions (
  id UUID PRIMARY KEY,
  order_id UUID,
  buyer_wallet VARCHAR(44),
  seller_wallet VARCHAR(44),
  transaction_amount DECIMAL(20, 9),
  tier VARCHAR(20),
  commission DECIMAL(20, 9),
  breakdown JSONB,
  tx_signature VARCHAR(88),
  staking_tier VARCHAR(20),
  created_at TIMESTAMP
);

-- Premium purchases
CREATE TABLE premium_purchases (
  id UUID PRIMARY KEY,
  wallet VARCHAR(44),
  feature VARCHAR(50),
  price DECIMAL(20, 9),
  purchased_at TIMESTAMP,
  expires_at TIMESTAMP,
  tx_signature VARCHAR(88),
  active BOOLEAN
);

-- Staking positions
CREATE TABLE staking_positions (
  wallet VARCHAR(44) PRIMARY KEY,
  amount DECIMAL(20, 9),
  tier VARCHAR(20),
  staked_at TIMESTAMP,
  last_reward_claim TIMESTAMP,
  total_rewards_earned DECIMAL(20, 9),
  pending_rewards DECIMAL(20, 9)
);

-- Moderator earnings
CREATE TABLE moderator_earnings (
  moderator_wallet VARCHAR(44) PRIMARY KEY,
  level VARCHAR(20),
  disputes_resolved INTEGER,
  total_earned DECIMAL(20, 9),
  current_month_earned DECIMAL(20, 9),
  points INTEGER,
  badges JSONB,
  rank INTEGER
);

-- Financial reports
CREATE TABLE financial_reports (
  id UUID PRIMARY KEY,
  type VARCHAR(20),
  period VARCHAR(50),
  generated_at TIMESTAMP,
  summary JSONB,
  revenue_breakdown JSONB,
  expense_breakdown JSONB,
  key_metrics JSONB,
  recommendations JSONB
);
```

### Deployment Checklist

- [ ] Deploy InsurancePool smart contract
- [ ] Configure treasury wallet
- [ ] Configure staking wallet
- [ ] Set up database tables
- [ ] Implement API endpoints
- [ ] Deploy frontend components
- [ ] Configure cron jobs for reports
- [ ] Test commission calculations
- [ ] Test insurance claim flow
- [ ] Test premium purchases
- [ ] Test staking flow
- [ ] Verify transparency data
- [ ] Generate test reports
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation review

### Testing Strategy

#### Unit Tests
- Commission calculations
- Fund distribution logic
- Reward calculations
- Report generation

#### Integration Tests
- End-to-end transaction flow
- Insurance claim process
- Premium purchase flow
- Staking operations

#### Security Tests
- Smart contract audits
- API endpoint security
- Wallet connection security
- Data privacy compliance

---

## Best Practices

### Security
1. Never expose private keys
2. Validate all inputs
3. Use secure RPC endpoints
4. Implement rate limiting
5. Regular security audits

### Performance
1. Cache frequently accessed data
2. Use pagination for large datasets
3. Optimize database queries
4. Implement CDN for static assets
5. Monitor API response times

### User Experience
1. Clear pricing information
2. Transparent fee calculations
3. Real-time updates
4. Helpful error messages
5. Mobile-responsive design

### Compliance
1. Maintain financial records
2. Generate regular reports
3. Ensure data privacy
4. Follow blockchain regulations
5. Document all processes

---

## Support and Maintenance

### Monitoring
- Treasury balance alerts
- Insurance pool health
- Commission rate tracking
- User activity monitoring
- Error rate tracking

### Updates
- Regular smart contract audits
- Feature enhancements
- Bug fixes
- Performance optimizations
- Documentation updates

### Community
- Discord support channel
- GitHub issues
- Documentation wiki
- Video tutorials
- FAQ section

---

## Conclusion

The TrustToken monetization system is designed to be:
- **Transparent**: All financial data on-chain and publicly visible
- **Fair**: Redistributive model benefits entire community
- **Sustainable**: Multiple revenue streams ensure long-term viability
- **Flexible**: Optional features and staking for user choice
- **Automated**: Smart contracts and scheduled reports reduce manual work

For questions or support, contact the development team or visit our documentation wiki.
