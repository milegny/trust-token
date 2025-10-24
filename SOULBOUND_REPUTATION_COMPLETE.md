# 🎯 Complete Soulbound TrustToken & Reputation System

## Overview

This document provides a complete guide to the evolved TrustToken system with Soulbound NFTs and on-chain reputation cards.

---

## 📋 Table of Contents

1. [Phase 1: Soulbound TrustToken](#phase-1-soulbound-trusttoken)
2. [Phase 2: ReputationCard Program](#phase-2-reputationcard-program)
3. [Phase 3: Frontend Integration](#phase-3-frontend-integration)
4. [Phase 4: Backend API](#phase-4-backend-api)
5. [Deployment Guide](#deployment-guide)
6. [Testing Guide](#testing-guide)
7. [User Guide](#user-guide)

---

## Phase 1: Soulbound TrustToken

### What Changed

The TrustToken NFT is now **permanently bound** to the minter's wallet:

✅ **Automatic Freezing**: Token account is frozen immediately after minting  
✅ **Transfer Prevention**: Frozen tokens cannot be transferred  
✅ **Verification Function**: `verify_soulbound()` checks token integrity  
✅ **Emergency Burn**: Authority can burn transferred tokens  

### Key Functions

| Function | Purpose | Who Can Call |
|----------|---------|--------------|
| `mint()` | Mint soulbound NFT | Anyone |
| `verify_soulbound()` | Check if token is properly bound | Anyone |
| `burn_transferred_token()` | Burn transferred tokens | Authority only |
| `revoke_verification()` | Revoke verified status | Authority only |
| `restore_verification()` | Restore verified status | Authority only |

### Files Modified

- `programs/trust_token/src/lib.rs` - Added soulbound logic

### Documentation

- [PHASE1_SOULBOUND.md](PHASE1_SOULBOUND.md) - Detailed Phase 1 docs

---

## Phase 2: ReputationCard Program

### What Was Created

A complete Anchor program for managing reputation cards:

✅ **8 Card Types**: Trustworthy, Quality Products, Fast Shipping, etc.  
✅ **Rating System**: 1-5 star ratings  
✅ **Revocation**: Issuers can revoke cards  
✅ **Disputes**: Recipients can dispute cards  
✅ **Admin Controls**: Authority can moderate  

### Program Structure

```
programs/reputation_card/
├── Cargo.toml
├── Xargo.toml
└── src/
    └── lib.rs (600+ lines)
```

### Key Functions

| Function | Purpose | Who Can Call |
|----------|---------|--------------|
| `initialize()` | Set up program | Authority (once) |
| `create_card()` | Issue reputation card | Any verified user |
| `revoke_card()` | Revoke a card | Original issuer |
| `restore_card()` | Restore revoked card | Original issuer |
| `update_card_status()` | Admin status update | Authority only |
| `dispute_card()` | Dispute a card | Card recipient |

### Card Types

```rust
pub enum CardType {
    Trustworthy,        // 🤝
    QualityProducts,    // ⭐
    FastShipping,       // 🚀
    GoodCommunication,  // 💬
    FairPricing,        // 💰
    Reliable,           // ✅
    Professional,       // 👔
    Responsive,         // ⚡
}
```

### Card Status

```rust
pub enum CardStatus {
    Active,      // Card is valid
    Revoked,     // Issuer revoked it
    Disputed,    // Recipient disputed it
    Suspended,   // Authority suspended it
}
```

### Files Created

- `programs/reputation_card/Cargo.toml`
- `programs/reputation_card/Xargo.toml`
- `programs/reputation_card/src/lib.rs`

### Documentation

- [PHASE2_REPUTATION_CARD.md](PHASE2_REPUTATION_CARD.md) - Detailed Phase 2 docs

---

## Phase 3: Frontend Integration

### What Was Created

Complete React components for the new system:

✅ **SoulboundTokenDisplay**: Shows TrustToken with soulbound status  
✅ **ReputationCards**: Displays all reputation cards  
✅ **RequestRecommendation**: Form to issue cards  
✅ **ProfilePage**: Complete profile with all features  

### Components

#### 1. SoulboundTokenDisplay.tsx

Displays user's TrustToken:
- Verification status badge
- Soulbound status badge
- Mint address link
- Minting date
- Explanation of soulbound

#### 2. ReputationCards.tsx

Shows reputation cards:
- Summary statistics
- Average rating
- Cards by type
- Individual card details
- Issuer information

#### 3. RequestRecommendation.tsx

Form to issue cards:
- Recipient address input
- Card type selector
- Star rating (1-5)
- Message input (500 chars)
- Form validation

#### 4. ProfilePage.tsx

Complete profile page:
- Three tabs: Overview, Cards, Issue
- TrustToken display
- Mint button
- Reputation cards
- Card issuance form

### Files Created

- `app/src/components/SoulboundTokenDisplay.tsx`
- `app/src/components/ReputationCards.tsx`
- `app/src/components/RequestRecommendation.tsx`
- `app/src/pages/ProfilePage.tsx`

### Documentation

- [PHASE3_FRONTEND.md](PHASE3_FRONTEND.md) - Detailed Phase 3 docs

---

## Phase 4: Backend API

### What Was Created

New API endpoints for reputation cards:

✅ **On-chain Fetching**: Get cards from blockchain  
✅ **Recording**: Cache cards in database  
✅ **Revocation**: Track revoked cards  
✅ **Summary**: Reputation statistics  
✅ **Sync**: Sync on-chain to database  

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/reputationcards/onchain/:walletAddress` | GET | Fetch on-chain cards |
| `/api/reputationcards/record` | POST | Record card creation |
| `/api/reputationcards/revoke` | POST | Record revocation |
| `/api/reputationcards/summary/:walletAddress` | GET | Get reputation summary |
| `/api/reputationcards/sync/:walletAddress` | POST | Sync on-chain to DB |

### Reputation Score Calculation

```typescript
// Weighted score:
// - Recommendations: 40% (count-based, max 5)
// - Reviews: 60% (rating-based, 1-5)

recScore = min(recommendations.length * 0.5, 5)
reviewScore = avg(reviews.rating)
finalScore = (recScore * 0.4) + (reviewScore * 0.6)
```

### Files Created

- `backend/src/routes/reputationcards.ts`

### Files Modified

- `backend/src/server.ts` - Added new route

---

## Deployment Guide

### Step 1: Build Programs

```bash
# Build both programs
anchor build

# Get program IDs
solana address -k target/deploy/trust_token-keypair.json
solana address -k target/deploy/reputation_card-keypair.json
```

### Step 2: Update Program IDs

Update `declare_id!()` in:
- `programs/trust_token/src/lib.rs`
- `programs/reputation_card/src/lib.rs`

Update `Anchor.toml`:
```toml
[programs.devnet]
trust_token = "YOUR_TRUST_TOKEN_ID"
reputation_card = "YOUR_REPUTATION_CARD_ID"
```

### Step 3: Rebuild and Deploy

```bash
# Rebuild with correct IDs
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Initialize programs
anchor run initialize
```

### Step 4: Update Frontend

```bash
# Copy IDLs to frontend
cp target/idl/trust_token.json app/src/idl/
cp target/idl/reputation_card.json app/src/idl/

# Update program IDs in frontend
# Edit app/src/components/*.tsx with new IDs
```

### Step 5: Deploy Backend

```bash
cd backend

# Set environment variables
export DATABASE_URL="your_postgres_url"
export TRUST_TOKEN_PROGRAM_ID="your_trust_token_id"

# Run migrations
npx prisma migrate deploy

# Deploy to Vercel
vercel --prod
```

### Step 6: Deploy Frontend

```bash
cd app

# Set environment variables
export REACT_APP_API_URL="your_backend_url"
export REACT_APP_TRUST_TOKEN_PROGRAM_ID="your_trust_token_id"
export REACT_APP_REPUTATION_CARD_PROGRAM_ID="your_reputation_card_id"

# Build and deploy
npm run build
vercel --prod
```

---

## Testing Guide

### Test 1: Mint Soulbound Token

```bash
# Mint a TrustToken
anchor run test-mint

# Verify it's frozen
solana account YOUR_TOKEN_ACCOUNT

# Try to transfer (should fail)
spl-token transfer YOUR_MINT 1 RECIPIENT_ADDRESS
# Expected: Error - account is frozen
```

### Test 2: Create Reputation Card

```typescript
// Issue a card
await program.methods
  .createCard(
    { trustworthy: {} },
    "Great seller!",
    5
  )
  .accounts({
    issuer: issuerWallet.publicKey,
    recipient: recipientWallet.publicKey,
    // ...
  })
  .rpc();

// Verify card exists
const [cardPDA] = PublicKey.findProgramAddressSync(...);
const card = await program.account.reputationCard.fetch(cardPDA);
console.log(card);
```

### Test 3: Revoke Card

```typescript
// Revoke the card
await program.methods
  .revokeCard("No longer trustworthy")
  .accounts({
    issuer: issuerWallet.publicKey,
    reputationCard: cardPDA,
    // ...
  })
  .rpc();

// Verify status changed
const card = await program.account.reputationCard.fetch(cardPDA);
assert(card.status === CardStatus.Revoked);
```

### Test 4: Frontend Integration

```bash
# Start frontend
cd app
npm start

# Test flow:
1. Connect wallet
2. Navigate to Profile
3. Mint TrustToken
4. Verify soulbound status
5. Issue reputation card
6. View cards on profile
```

---

## User Guide

### For Buyers

#### 1. Get Started
```
1. Install Phantom wallet
2. Switch to Devnet
3. Get devnet SOL from faucet
4. Connect wallet to The Bit Central
```

#### 2. Browse and Buy
```
1. Browse products
2. Check seller's reputation
3. View their TrustToken (soulbound)
4. Check reputation cards
5. Add to cart and checkout
```

#### 3. Leave Feedback
```
1. Complete transaction
2. Go to Profile → Issue Card
3. Enter seller's wallet address
4. Choose card type
5. Rate 1-5 stars
6. Write message
7. Submit
```

### For Sellers

#### 1. Get Verified
```
1. Connect wallet
2. Go to Profile
3. Click "Mint TrustToken"
4. Approve transaction
5. Token is now soulbound
6. You can list products
```

#### 2. Build Reputation
```
1. Complete transactions
2. Receive reputation cards
3. View cards on profile
4. Share profile link
5. Reputation score increases
```

#### 3. Manage Cards
```
1. View all cards received
2. Dispute unfair cards
3. Issue cards to buyers
4. Revoke cards if needed
```

### Understanding Soulbound

**What is Soulbound?**
- Token is permanently linked to your wallet
- Cannot be transferred or sold
- Proves authentic identity
- Frozen on-chain

**Why Soulbound?**
- Prevents identity theft
- Ensures authenticity
- Builds trust
- Standard for identity tokens

**What if I lose my wallet?**
- Token is lost with wallet
- Mint new token with new wallet
- Old token remains frozen
- This is intentional for security

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Profile     │  │  Reputation  │  │  Issue Card  │  │
│  │  Page        │  │  Cards       │  │  Form        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Users       │  │  Reputation  │  │  TrustToken  │  │
│  │  Routes      │  │  Cards       │  │  Routes      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Solana Blockchain                       │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │  TrustToken  │  │  Reputation  │                     │
│  │  Program     │  │  Card        │                     │
│  │  (Soulbound) │  │  Program     │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## Key Features Summary

### Soulbound TrustToken
- ✅ Permanently bound to wallet
- ✅ Cannot be transferred
- ✅ Frozen on-chain
- ✅ Verifiable identity
- ✅ Emergency burn capability

### Reputation Cards
- ✅ 8 card types
- ✅ 1-5 star ratings
- ✅ Personal messages
- ✅ Revocable by issuer
- ✅ Disputable by recipient
- ✅ Admin moderation

### Frontend
- ✅ Soulbound status display
- ✅ Reputation card viewer
- ✅ Card issuance form
- ✅ Complete profile page
- ✅ Responsive design

### Backend
- ✅ On-chain integration
- ✅ Database caching
- ✅ Reputation scoring
- ✅ Sync functionality
- ✅ RESTful API

---

## Statistics

### Code Added
- **Phase 1**: ~150 lines (Rust)
- **Phase 2**: ~600 lines (Rust)
- **Phase 3**: ~800 lines (TypeScript/React)
- **Phase 4**: ~200 lines (TypeScript/Node)
- **Total**: ~1,750 lines

### Files Created
- **Programs**: 3 files
- **Frontend**: 4 files
- **Backend**: 1 file
- **Documentation**: 5 files
- **Total**: 13 files

### Features Implemented
- **Soulbound**: 3 new functions
- **Reputation**: 6 new functions
- **Frontend**: 4 new components
- **Backend**: 5 new endpoints
- **Total**: 18 new features

---

## Next Steps

### Immediate
1. Deploy programs to devnet
2. Test all functions
3. Update frontend with real program IDs
4. Test end-to-end flow

### Short Term
1. Add more card types
2. Implement weighted reputation
3. Add time-decay for old cards
4. Create admin dashboard

### Long Term
1. Deploy to mainnet
2. Add dispute resolution
3. Implement card templates
4. Create analytics dashboard
5. Add batch operations

---

## Resources

### Documentation
- [PHASE1_SOULBOUND.md](PHASE1_SOULBOUND.md)
- [PHASE2_REPUTATION_CARD.md](PHASE2_REPUTATION_CARD.md)
- [PHASE3_FRONTEND.md](PHASE3_FRONTEND.md)
- [MARKETPLACE_README.md](MARKETPLACE_README.md)
- [SETUP_GUIDE.md](SETUP_GUIDE.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

### Code
- Programs: `programs/trust_token/`, `programs/reputation_card/`
- Frontend: `app/src/components/`, `app/src/pages/`
- Backend: `backend/src/routes/`

### External
- [Solana Docs](https://docs.solana.com)
- [Anchor Docs](https://www.anchor-lang.com)
- [Metaplex Docs](https://docs.metaplex.com)

---

## Support

For issues or questions:
1. Check the documentation
2. Review code comments
3. Test on devnet first
4. Open an issue on GitHub

---

## 🎉 Complete!

All phases are now implemented:
- ✅ Phase 1: Soulbound TrustToken
- ✅ Phase 2: ReputationCard Program
- ✅ Phase 3: Frontend Integration
- ✅ Phase 4: Backend API

**The system is ready for deployment and testing!**
