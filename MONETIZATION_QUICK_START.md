# Monetization System - Quick Start Guide

## 🚀 Quick Overview

The TrustToken marketplace monetization system is **transparent**, **redistributive**, and **automated**. All financial operations are on-chain and publicly auditable.

## 💰 Revenue Streams

### 1. Transaction Commissions (Primary)
- **Standard**: 2.5% (at least one unverified user)
- **Premium**: 4.0% (both users verified with TrustToken)
- **Discounts**: Up to 1.5% with SOL staking

### 2. Premium Features (Secondary)
- **Verification Plus**: 5 SOL (one-time, lifetime access)
- **Analytics Pro**: 10 SOL/month (recurring subscription)
- **Reputation Boost**: 2 SOL/30 days (time-limited boost)

## 📊 Fund Distribution (Automatic)

Every SOL earned is automatically split:
- **15%** → Operations (platform maintenance)
- **25%** → Insurance Pool (user protection)
- **25%** → Moderation (community rewards)
- **35%** → Founder (compensation & reinvestment)

## 🎯 Key Components

### For Users

#### TreasuryDashboard
View real-time financial data:
```typescript
import { TreasuryDashboard } from './components/TreasuryDashboard';

<TreasuryDashboard treasuryWallet="YOUR_TREASURY_WALLET" />
```

#### StakingDashboard
Stake SOL for discounts and rewards:
```typescript
import { StakingDashboard } from './components/StakingDashboard';

<StakingDashboard />
```

#### PremiumFeatures
Purchase premium features:
```typescript
import { PremiumFeatures } from './components/PremiumFeatures';

<PremiumFeatures />
```

### For Moderators

#### ModeratorRewards
Track earnings and redeem points:
```typescript
import { ModeratorRewards } from './components/ModeratorRewards';

<ModeratorRewards />
```

### For Public

#### TransparencyDashboard
View public financial data:
```typescript
import { TransparencyDashboard } from './components/TransparencyDashboard';

<TransparencyDashboard />
```

## 🔧 Quick Implementation

### 1. Commission Calculation
```typescript
import { calculateCommission, CommissionTier } from './services/commissionService';

// Calculate commission for a transaction
const commission = calculateCommission(
  100, // transaction amount in SOL
  CommissionTier.PREMIUM, // or CommissionTier.STANDARD
  StakingTier.SILVER // user's staking tier
);

console.log(commission);
// {
//   transactionAmount: 100,
//   tier: 'PREMIUM',
//   baseCommission: 4.0,
//   stakingDiscount: 1.0,
//   finalCommission: 3.0,
//   breakdown: {
//     operations: 0.45,
//     insurance: 0.75,
//     moderation: 0.75,
//     founder: 1.05
//   }
// }
```

### 2. Process Commission
```typescript
import { processCommissionDeduction } from './services/commissionService';

const result = await processCommissionDeduction(
  orderId,
  transactionAmount,
  buyerWallet,
  sellerWallet,
  txSignature
);

if (result.success) {
  console.log('Commission processed:', result.commission);
}
```

### 3. Insurance Claim
```rust
// Create insurance claim (Rust/Anchor)
pub fn create_claim(
    ctx: Context<CreateClaim>,
    order_id: String,
    amount: u64,
    reason: String,
) -> Result<()> {
    // Claim created with 72-hour voting period
}
```

### 4. Staking
```typescript
// Stake SOL
const handleStake = async (amount: number) => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: userWallet,
      toPubkey: stakingWallet,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );
  
  const signature = await sendTransaction(transaction, connection);
  // Record stake in backend
};
```

## 📋 Staking Tiers

| Tier | Stake | Discount | Weekly APY |
|------|-------|----------|------------|
| Bronze | 10 SOL | 0.5% | 8% |
| Silver | 50 SOL | 1.0% | 8% |
| Gold | 100 SOL | 1.5% | 8% |

**Benefits**:
- ✅ No lock-up period
- ✅ Unstake anytime
- ✅ Weekly rewards
- ✅ Automatic discounts

## 🏆 Moderator Levels

| Level | Multiplier | Requirements |
|-------|-----------|--------------|
| Junior | 1.0x | 0 disputes |
| Senior | 1.5x | 50 disputes, 500 points |
| Elite | 2.0x | 200 disputes, 2000 points |

**Base Reward**: 0.1 SOL per dispute

**Bonuses**:
- Fast resolution (< 24h): +20%
- Quality resolution: +30%
- Complex case: +50%
- Weekend work: +10%

## 🛡️ Insurance Pool

### Coverage
- **Minimum**: 0.1 SOL
- **Maximum**: 100 SOL
- **Coverage**: 80% of transaction value

### Process
1. User creates claim (0.1-100 SOL)
2. Community votes (72 hours)
3. Claim finalized (66% approval needed)
4. Approved claims paid automatically

## 📈 Premium Features

### Verification Plus (5 SOL)
- ✨ Enhanced badge
- 🎯 Priority support
- 🔓 Exclusive features
- 💰 Lower fees (4% → 3%)
- ♾️ Lifetime access

### Analytics Pro (10 SOL/month)
- 📊 Advanced dashboard
- 📈 Detailed insights
- 📥 Export CSV/PDF
- 📋 Custom reports
- 🔔 Real-time alerts

### Reputation Boost (2 SOL/30 days)
- 🚀 Featured placement
- ⭐ Highlighted badge
- 👀 Increased visibility
- 🎯 Priority recommendations
- ⏰ 30-day duration

## 🔍 Transparency Features

### Real-Time Data
- Treasury balance
- Revenue streams
- Fund distributions
- Active users
- Transaction volume

### Historical Trends
- Daily/Weekly/Monthly/Quarterly/Yearly
- Revenue by source
- Distribution by allocation
- User growth
- Transaction patterns

### Public API
```typescript
// Get current metrics
GET /api/transparency/metrics?period=MONTHLY

// Get historical data
GET /api/transparency/historical?period=MONTHLY&limit=12
```

## 📊 Financial Reports

### Automated Generation
- **Monthly**: 1st of each month
- **Quarterly**: Every 3 months
- **Annual**: Yearly comprehensive

### Export Formats
- PDF (professional reports)
- CSV (raw data)
- JSON (API integration)

### Contents
- Revenue summary
- Expense breakdown
- Key metrics
- Recommendations

## 🎯 Quick Wins

### For New Users
1. Connect wallet
2. View transparency dashboard
3. See real-time financial data
4. Understand fee structure

### For Active Users
1. Stake 10 SOL (Bronze tier)
2. Get 0.5% discount on all transactions
3. Earn 8% APY weekly
4. Save money on fees

### For Sellers
1. Get TrustToken verification
2. Purchase Reputation Boost (2 SOL)
3. Increase visibility for 30 days
4. Attract more buyers

### For Moderators
1. Resolve disputes
2. Earn 0.1-0.2 SOL per dispute
3. Collect points
4. Redeem for rewards

## 🚨 Important Notes

### Security
- ✅ All transactions on-chain
- ✅ Smart contract verified
- ✅ No private key exposure
- ✅ Wallet-based authentication

### Transparency
- ✅ Public financial data
- ✅ Verifiable transactions
- ✅ Automated reports
- ✅ Community oversight

### Flexibility
- ✅ No lock-up periods
- ✅ Unstake anytime
- ✅ Optional features
- ✅ User choice

## 📚 Documentation

- **Full Documentation**: `MONETIZATION_SYSTEM.md`
- **Implementation Guide**: `MONETIZATION_IMPLEMENTATION.md`
- **This Quick Start**: `MONETIZATION_QUICK_START.md`

## 🔗 Key Files

### Frontend Components
```
app/src/components/
├── TreasuryDashboard.tsx
├── ModeratorRewards.tsx
├── PremiumFeatures.tsx
├── StakingDashboard.tsx
├── TransparencyDashboard.tsx
└── FinancialReports.tsx
```

### Services
```
app/src/services/
├── commissionService.ts
└── reportingService.ts
```

### Types
```
app/src/types/
└── treasury.ts
```

### Smart Contracts
```
programs/
├── trust_token/
├── reputation_card/
└── insurance_pool/
```

## 💡 Pro Tips

1. **Stake Early**: Get discounts from day one
2. **Verify Account**: Unlock premium tier commissions
3. **Use Insurance**: Protect high-value transactions
4. **Track Metrics**: Monitor your savings
5. **Redeem Points**: Don't let moderator points expire

## 🎓 Learning Path

### Beginner
1. Read this quick start
2. View transparency dashboard
3. Understand fee structure
4. Make first transaction

### Intermediate
1. Stake SOL for discounts
2. Purchase premium feature
3. Track savings
4. Review financial reports

### Advanced
1. Become moderator
2. Optimize staking strategy
3. Use all premium features
4. Contribute to governance

## 📞 Support

- **Documentation**: See `MONETIZATION_SYSTEM.md`
- **Issues**: GitHub Issues
- **Community**: Discord
- **Email**: support@trusttoken.com

---

**Quick Reference Card**

```
Commission Rates:
├── Standard: 2.5%
└── Premium: 4.0%

Staking Tiers:
├── Bronze: 10 SOL → 0.5% discount
├── Silver: 50 SOL → 1.0% discount
└── Gold: 100 SOL → 1.5% discount

Premium Features:
├── Verification Plus: 5 SOL (one-time)
├── Analytics Pro: 10 SOL/month
└── Reputation Boost: 2 SOL/30 days

Fund Distribution:
├── Operations: 15%
├── Insurance: 25%
├── Moderation: 25%
└── Founder: 35%
```

---

**Status**: ✅ Ready to Use

**Version**: 1.0.0

**Last Updated**: 2025-10-24
