# Reputation System Integration

## ✅ Integration Complete

The reputation system has been successfully integrated with the product marketplace, connecting on-chain reputation cards with the product browsing and purchasing experience.

---

## 🎯 Features Implemented

### 1. SellerReputationBadge Component

A comprehensive component that displays seller reputation information:

**Features:**
- ✅ Reputation score display with visual indicators
- ✅ TrustToken verification badge
- ✅ Active reputation cards count
- ✅ Recent reputation cards preview (top 3)
- ✅ Card type icons and labels
- ✅ Link to seller profile
- ✅ Compact mode for product listings
- ✅ Full mode for product details

**Usage:**
```tsx
// Full mode (Product Detail)
<SellerReputationBadge
  sellerId={seller.id}
  sellerWallet={seller.walletAddress}
  sellerUsername={seller.username}
  isVerified={seller.isVerified}
  reputationScore={seller.reputationScore}
  showCards={true}
/>

// Compact mode (Product List)
<SellerReputationBadge
  sellerId={seller.id}
  sellerWallet={seller.walletAddress}
  sellerUsername={seller.username}
  reputationScore={seller.reputationScore}
  compact={true}
/>
```

**Visual Elements:**
- 🌟 Excellent (4.5+) - Green
- ⭐ Very Good (4.0+) - Solana Green
- 👍 Good (3.5+) - Blue
- 👌 Fair (3.0+) - Amber
- 🆕 New Seller (<3.0) - Gray

---

### 2. ProductDetail.tsx Updates

**Changes:**
- ✅ Replaced basic seller info with SellerReputationBadge
- ✅ Shows full reputation details
- ✅ Displays recent reputation cards
- ✅ Shows TrustToken verification status
- ✅ Links to seller profile

**Before:**
```tsx
<div>
  <p>Seller: {seller.username}</p>
  <p>Reputation: {seller.reputationScore} ⭐</p>
</div>
```

**After:**
```tsx
<SellerReputationBadge
  sellerId={seller.id}
  sellerWallet={seller.walletAddress}
  sellerUsername={seller.username}
  isVerified={seller.isVerified}
  reputationScore={seller.reputationScore}
  showCards={true}
/>
```

---

### 3. ProductList.tsx Updates

**New Features:**

#### A. Reputation Filters
Filter products by minimum seller reputation:
- All sellers
- 3.0+ (Fair)
- 4.0+ (Very Good)
- 4.5+ (Excellent)

#### B. Reputation Sorting
Sort products by seller reputation:
- Default (no sorting)
- Reputation: High to Low
- Reputation: Low to High

#### C. Enhanced Product Cards
Each product card now shows:
- Seller reputation score with icon
- Visual reputation indicator
- Verification badge (if applicable)

**UI Changes:**
```tsx
// Reputation indicator on product cards
<div>
  <span>{getReputationIcon(score)}</span>
  <span>{score.toFixed(1)}</span>
  <span>reputation</span>
</div>
```

---

### 4. Reputation Calculation Utilities

**File:** `app/src/utils/reputationCalculator.ts`

**Functions:**

#### Core Calculations
```typescript
// Calculate overall reputation from cards and reviews
calculateReputationScore(cards, reviews, hasTrustToken)

// Get reputation level label
getReputationLevel(score) // Returns: "Excellent", "Very Good", etc.

// Get trust level
getTrustLevel(score) // Returns: 'excellent' | 'very-good' | 'good' | 'fair' | 'new'

// Get reputation color
getReputationColor(score) // Returns: hex color code

// Get reputation icon
getReputationIcon(score) // Returns: emoji icon
```

#### Analysis Functions
```typescript
// Calculate reputation trend
calculateReputationTrend(cards, reviews) // Returns: 'improving' | 'stable' | 'declining' | 'new'

// Get card type distribution
getCardTypeDistribution(cards) // Returns: { cardType: count }

// Get top card types
getTopCardTypes(cards, limit) // Returns: string[]

// Check reputation threshold
meetsReputationThreshold(score, threshold) // Returns: boolean

// Get reputation confidence
getReputationConfidence(totalCards, totalReviews) // Returns: 'high' | 'medium' | 'low'
```

#### Utility Functions
```typescript
// Get reputation badge data
getReputationBadge(score) // Returns: { label, color, icon, description }

// Sort by reputation
sortByReputation(items, direction) // Returns: sorted array

// Filter by minimum reputation
filterByMinReputation(items, minScore) // Returns: filtered array

// Format score for display
formatReputationScore(score) // Returns: "4.5"
```

---

### 5. Reputation Service

**File:** `app/src/services/reputationService.ts`

**API Functions:**

#### Data Fetching
```typescript
// Get reputation cards for a wallet
getReputationCards(walletAddress)

// Get reputation summary
getReputationSummary(walletAddress)

// Get TrustToken info
getTrustTokenInfo(walletAddress)

// Get issued cards
getIssuedCards(walletAddress)

// Get received cards
getReceivedCards(walletAddress)
```

#### On-Chain Operations
```typescript
// Create reputation card
createReputationCard({
  issuerWallet,
  recipientWallet,
  cardType,
  message,
  rating,
  txSignature
})

// Revoke reputation card
revokeReputationCard({
  cardPDA,
  issuerWallet,
  reason,
  txSignature
})

// Sync cards from blockchain
syncReputationCards(walletAddress)
```

#### Calculations
```typescript
// Calculate comprehensive reputation metrics
calculateReputation(walletAddress)
// Returns: {
//   overallScore,
//   cardScore,
//   reviewScore,
//   totalCards,
//   activeCards,
//   totalReviews
// }
```

---

## 🔄 User Flow

### Browsing Products

1. **Product List Page**
   - User sees products with seller reputation indicators
   - Can filter by minimum reputation (3.0+, 4.0+, 4.5+)
   - Can sort by reputation (high to low, low to high)
   - Each product shows seller's reputation score and icon

2. **Product Detail Page**
   - User clicks on a product
   - Sees full SellerReputationBadge with:
     - Reputation score and level
     - TrustToken verification status
     - Active cards count
     - Recent reputation cards (top 3)
   - Can click to view seller's full profile

3. **Seller Profile**
   - User clicks on seller name or "View all cards"
   - Sees complete reputation history
   - Views all reputation cards
   - Sees reviews and ratings

---

## 📊 Reputation Calculation

### Formula

```
Overall Score = (Card Score × 0.6) + (Review Score × 0.4) + TrustToken Bonus

Where:
- Card Score = Average rating of active reputation cards
- Review Score = Average rating of all reviews
- TrustToken Bonus = +0.1 if seller has verified TrustToken (max 5.0)
```

### Weighting Rationale

- **60% Reputation Cards**: On-chain, harder to fake, more trustworthy
- **40% Reviews**: Off-chain, easier to manipulate, but still valuable
- **TrustToken Bonus**: Rewards verified sellers

### Reputation Levels

| Score | Level | Icon | Color | Description |
|-------|-------|------|-------|-------------|
| 4.5+ | Excellent | 🌟 | Green | Outstanding reputation |
| 4.0+ | Very Good | ⭐ | Solana Green | Very reliable seller |
| 3.5+ | Good | 👍 | Blue | Good reputation |
| 3.0+ | Fair | 👌 | Amber | Fair reputation |
| <3.0 | New Seller | 🆕 | Gray | Building reputation |

---

## 🎨 UI Components

### Product List Card

```
┌─────────────────────────────┐
│  [Product Image]            │
├─────────────────────────────┤
│  Product Name               │
│  Description...             │
│                             │
│  $99.99 SOL    Stock: 10    │
│                             │
│  Seller: alice_seller       │
│  ⭐ 4.2 reputation          │
│                             │
│  [Add to Cart]              │
└─────────────────────────────┘
```

### Reputation Badge (Full)

```
┌─────────────────────────────────────┐
│  Alice Seller ✓ Verified            │
│  ⭐ 4.2 /5.0  Very Good             │
├─────────────────────────────────────┤
│  12 Active Cards  |  15 Total Cards │
├─────────────────────────────────────┤
│  Recent Reputation Cards            │
│                                     │
│  🤝 Trustworthy        ⭐⭐⭐⭐⭐    │
│  "Great seller! Fast shipping..."   │
│  Oct 24, 2024                       │
│                                     │
│  ⭐ Quality Products   ⭐⭐⭐⭐⭐    │
│  "Excellent quality products..."    │
│  Oct 23, 2024                       │
│                                     │
│  🚀 Fast Shipping      ⭐⭐⭐⭐      │
│  "Shipped very quickly..."          │
│  Oct 22, 2024                       │
│                                     │
│  View all 12 reputation cards →     │
└─────────────────────────────────────┘
```

### Reputation Badge (Compact)

```
┌──────────────────────┐
│ Alice Seller ✓       │
│ ⭐ 4.2  Very Good    │
│ 12 reputation cards  │
└──────────────────────┘
```

---

## 🔧 Configuration

### Constants

All reputation-related constants are in `app/src/config/constants.ts`:

```typescript
// Card types
export enum CardType {
  Trustworthy = 'trustworthy',
  QualityProducts = 'qualityProducts',
  FastShipping = 'fastShipping',
  GoodCommunication = 'goodCommunication',
  FairPricing = 'fairPricing',
  Reliable = 'reliable',
  Professional = 'professional',
  Responsive = 'responsive',
}

// Card type labels
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  [CardType.Trustworthy]: 'Trustworthy',
  [CardType.QualityProducts]: 'Quality Products',
  // ...
};

// Card type icons
export const CARD_TYPE_ICONS: Record<CardType, string> = {
  [CardType.Trustworthy]: '🤝',
  [CardType.QualityProducts]: '⭐',
  // ...
};
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Product List
- [ ] Products display with reputation indicators
- [ ] Reputation filter works (3.0+, 4.0+, 4.5+)
- [ ] Reputation sorting works (high to low, low to high)
- [ ] Reputation icons display correctly
- [ ] Verified badges show for verified sellers

#### Product Detail
- [ ] SellerReputationBadge displays correctly
- [ ] Reputation score shows with correct icon and color
- [ ] TrustToken verification badge shows (if applicable)
- [ ] Recent reputation cards display (top 3)
- [ ] Card types show correct icons and labels
- [ ] "View all cards" link works
- [ ] Link to seller profile works

#### Reputation Badge
- [ ] Compact mode works in product list
- [ ] Full mode works in product detail
- [ ] Reputation level displays correctly
- [ ] Active cards count is accurate
- [ ] Recent cards show correct information
- [ ] Loading state displays
- [ ] Empty state displays when no cards

---

## 📝 API Endpoints Used

### Reputation Cards
```
GET  /api/reputationcards/onchain/:walletAddress
GET  /api/reputationcards/summary/:walletAddress
GET  /api/reputationcards/issued/:walletAddress
GET  /api/reputationcards/received/:walletAddress
POST /api/reputationcards/record
POST /api/reputationcards/revoke
POST /api/reputationcards/sync/:walletAddress
```

### TrustToken
```
GET  /api/trusttoken/user/:walletAddress
GET  /api/trusttoken/verify/:mintAddress
```

### Reviews
```
GET  /api/reviews/user/:walletAddress
```

---

## 🚀 Next Steps

### Immediate
1. Test the integration with real data
2. Verify TrustToken detection works
3. Test reputation card fetching from blockchain
4. Ensure all links navigate correctly

### Future Enhancements
1. **Real-time Updates**: WebSocket for live reputation updates
2. **Reputation History**: Chart showing reputation over time
3. **Card Filtering**: Filter cards by type, rating, date
4. **Reputation Insights**: Analytics dashboard for sellers
5. **Dispute Resolution**: UI for handling disputed cards
6. **Bulk Operations**: Manage multiple cards at once
7. **Export Data**: Download reputation report
8. **Notifications**: Alert sellers of new cards

---

## 🎉 Summary

The reputation system is now fully integrated with the marketplace:

✅ **Product List**: Shows reputation indicators, filters, and sorting  
✅ **Product Detail**: Displays comprehensive seller reputation  
✅ **Reputation Badge**: Reusable component with compact/full modes  
✅ **Calculation Utils**: Robust reputation scoring system  
✅ **Service Layer**: API integration for reputation data  
✅ **Navigation**: Seamless flow between products and profiles  

Users can now:
- Browse products with confidence using reputation indicators
- Filter products by seller reputation
- Sort products by seller reputation
- View detailed seller reputation before purchasing
- See on-chain reputation cards
- Verify seller authenticity with TrustToken badges

The system provides transparency and trust in the marketplace! 🎊
