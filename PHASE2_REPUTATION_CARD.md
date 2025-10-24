# Phase 2: ReputationCard Program Implementation

## ✅ New Program Created

A complete Anchor program for managing reputation cards in The Bit Central marketplace.

---

## 📦 Program Structure

### Location
```
programs/reputation_card/
├── Cargo.toml
├── Xargo.toml
└── src/
    └── lib.rs
```

### Program ID
```
11111111111111111111111111111111 (placeholder - will be updated after deployment)
```

---

## 🎯 Core Features

### 1. **Card Creation**
Users with verified TrustTokens can issue reputation cards to other users.

```rust
create_card(card_type, message, rating)
```

**Parameters:**
- `card_type`: Type of reputation (8 types available)
- `message`: Personal message (max 500 chars)
- `rating`: 1-5 star rating

**Card Types:**
- `Trustworthy` - General trustworthiness
- `QualityProducts` - High-quality items
- `FastShipping` - Quick delivery
- `GoodCommunication` - Responsive and clear
- `FairPricing` - Reasonable prices
- `Reliable` - Consistent performance
- `Professional` - Professional conduct
- `Responsive` - Quick to respond

### 2. **Card Revocation**
Issuers can revoke cards they previously issued.

```rust
revoke_card(reason)
```

**Features:**
- Only issuer can revoke
- Optional reason (max 200 chars)
- Updates program statistics
- Timestamp recorded

### 3. **Card Restoration**
Issuers can restore revoked cards.

```rust
restore_card()
```

**Features:**
- Only issuer can restore
- Clears revocation data
- Updates program statistics

### 4. **Card Disputes**
Recipients can dispute cards issued to them.

```rust
dispute_card(dispute_reason)
```

**Features:**
- Only recipient can dispute
- Reason required (max 500 chars)
- Changes status to Disputed
- Requires authority review

### 5. **Admin Status Update**
Program authority can update any card's status.

```rust
update_card_status(new_status)
```

**Features:**
- Only authority can call
- Used for moderation
- Resolves disputes
- Can suspend cards

---

## 📊 Data Structures

### ProgramState
```rust
pub struct ProgramState {
    pub authority: Pubkey,           // Program authority
    pub total_cards_issued: u64,     // Total cards created
    pub total_cards_revoked: u64,    // Total cards revoked
}
```

### ReputationCard
```rust
pub struct ReputationCard {
    pub issuer: Pubkey,              // Who issued the card
    pub recipient: Pubkey,           // Who received it
    pub card_type: CardType,         // Type of reputation
    pub message: String,             // Personal message
    pub rating: u8,                  // 1-5 rating
    pub status: CardStatus,          // Current status
    pub issued_at: i64,              // Timestamp
    pub revoked_at: Option<i64>,     // Revocation timestamp
    pub revocation_reason: Option<String>,  // Why revoked
    pub dispute_reason: Option<String>,     // Why disputed
    pub card_number: u64,            // Unique ID
}
```

### CardStatus
```rust
pub enum CardStatus {
    Active,      // Card is valid
    Revoked,     // Issuer revoked it
    Disputed,    // Recipient disputed it
    Suspended,   // Authority suspended it
}
```

---

## 🔄 Card Lifecycle

```
┌─────────────┐
│   CREATED   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ACTIVE    │◄──────────┐
└──────┬──────┘           │
       │                  │
       ├──────────────────┤
       │                  │
       ▼                  │
┌─────────────┐    ┌──────────────┐
│   REVOKED   │    │   DISPUTED   │
└──────┬──────┘    └──────┬───────┘
       │                  │
       │                  │
       └──────┬───────────┘
              │
              ▼
       ┌─────────────┐
       │  SUSPENDED  │
       └─────────────┘
```

---

## 🔐 Security Features

### 1. **Authorization Checks**
```rust
// Only issuer can revoke
require!(
    card.issuer == ctx.accounts.issuer.key(),
    ReputationCardError::UnauthorizedRevoke
);

// Only recipient can dispute
require!(
    card.recipient == ctx.accounts.recipient.key(),
    ReputationCardError::UnauthorizedDispute
);

// Only authority can update status
require!(
    ctx.accounts.authority.key() == ctx.accounts.program_state.authority,
    ReputationCardError::UnauthorizedUpdate
);
```

### 2. **Input Validation**
```rust
// Rating must be 1-5
require!(rating >= 1 && rating <= 5, ReputationCardError::InvalidRating);

// Message length limits
require!(message.len() <= 500, ReputationCardError::MessageTooLong);
require!(reason.len() <= 200, ReputationCardError::ReasonTooLong);
```

### 3. **Status Checks**
```rust
// Can only revoke active cards
require!(
    card.status == CardStatus::Active,
    ReputationCardError::CardNotActive
);

// Can only restore revoked cards
require!(
    card.status == CardStatus::Revoked,
    ReputationCardError::CardNotRevoked
);
```

### 4. **PDA-Based Accounts**
```rust
seeds = [
    b"reputation_card",
    issuer.key().as_ref(),
    recipient.key().as_ref(),
    &card_number.to_le_bytes()
]
```

This ensures:
- Unique card addresses
- Deterministic derivation
- Secure account ownership

---

## 🎯 Use Cases

### Scenario 1: Successful Transaction
```
1. Buyer purchases from Seller
2. Transaction completes successfully
3. Buyer issues "Trustworthy" card to Seller
4. Card appears on Seller's profile
5. Seller's reputation increases
```

### Scenario 2: Revocation
```
1. Issuer creates card for Recipient
2. Later discovers issue with Recipient
3. Issuer revokes card with reason
4. Card status changes to Revoked
5. Card no longer counts toward reputation
```

### Scenario 3: Dispute
```
1. Issuer creates negative card for Recipient
2. Recipient believes it's unfair
3. Recipient disputes card with explanation
4. Authority reviews dispute
5. Authority updates status (Active or Suspended)
```

### Scenario 4: Restoration
```
1. Issuer revokes card
2. Issue is resolved
3. Issuer restores card
4. Card becomes Active again
5. Reputation restored
```

---

## 📝 Functions Reference

### initialize()
**Purpose:** Set up the program  
**Who:** Authority (once)  
**Parameters:** None  
**Returns:** ProgramState account

### create_card()
**Purpose:** Issue a reputation card  
**Who:** Any verified user  
**Parameters:**
- `card_type: CardType`
- `message: String`
- `rating: u8`  
**Returns:** ReputationCard account

### revoke_card()
**Purpose:** Revoke a card  
**Who:** Original issuer  
**Parameters:**
- `reason: Option<String>`  
**Returns:** Updated card

### restore_card()
**Purpose:** Restore a revoked card  
**Who:** Original issuer  
**Parameters:** None  
**Returns:** Updated card

### update_card_status()
**Purpose:** Admin status update  
**Who:** Program authority  
**Parameters:**
- `new_status: CardStatus`  
**Returns:** Updated card

### dispute_card()
**Purpose:** Dispute a card  
**Who:** Card recipient  
**Parameters:**
- `dispute_reason: String`  
**Returns:** Updated card

---

## 🧪 Testing Examples

### Test 1: Create Card
```typescript
await program.methods
  .createCard(
    { trustworthy: {} },  // card_type
    "Great seller!",       // message
    5                      // rating
  )
  .accounts({
    issuer: issuerWallet.publicKey,
    recipient: recipientWallet.publicKey,
    // ... other accounts
  })
  .rpc();
```

### Test 2: Revoke Card
```typescript
await program.methods
  .revokeCard("No longer trustworthy")
  .accounts({
    issuer: issuerWallet.publicKey,
    reputationCard: cardPDA,
    // ... other accounts
  })
  .rpc();
```

### Test 3: Dispute Card
```typescript
await program.methods
  .disputeCard("This rating is unfair")
  .accounts({
    recipient: recipientWallet.publicKey,
    reputationCard: cardPDA,
  })
  .rpc();
```

---

## 🔗 Integration with TrustToken

### Verification Check
Before issuing a card, the frontend/backend should verify:

```typescript
// Check if issuer has a verified TrustToken
const trustToken = await getTrustToken(issuerPublicKey);
if (!trustToken || !trustToken.isVerified) {
  throw new Error("Issuer must have a verified TrustToken");
}

// Then create the card
await createCard(...);
```

### Reputation Calculation
```typescript
// Get all active cards for a user
const cards = await getActiveCards(userPublicKey);

// Calculate average rating
const avgRating = cards.reduce((sum, card) => sum + card.rating, 0) / cards.length;

// Count by type
const cardsByType = cards.reduce((acc, card) => {
  acc[card.cardType] = (acc[card.cardType] || 0) + 1;
  return acc;
}, {});
```

---

## 📊 Statistics Tracking

The program tracks:
- **Total cards issued**: Increments on each create
- **Total cards revoked**: Increments on revoke, decrements on restore
- **Active cards**: `total_issued - total_revoked`

### Query Statistics
```typescript
const programState = await program.account.programState.fetch(programStatePDA);
console.log(`Total issued: ${programState.totalCardsIssued}`);
console.log(`Total revoked: ${programState.totalCardsRevoked}`);
console.log(`Active: ${programState.totalCardsIssued - programState.totalCardsRevoked}`);
```

---

## 🚀 Deployment Steps

### 1. Build the Program
```bash
anchor build
```

### 2. Get Program ID
```bash
solana address -k target/deploy/reputation_card-keypair.json
```

### 3. Update Program ID
Update `declare_id!()` in `lib.rs` and `Anchor.toml`

### 4. Rebuild
```bash
anchor build
```

### 5. Deploy
```bash
anchor deploy --provider.cluster devnet
```

### 6. Initialize
```bash
anchor run initialize-reputation
```

---

## 🔄 Migration from Database

If you have existing recommendations in the database:

```typescript
// Fetch from database
const recommendations = await prisma.recommendation.findMany({
  where: { isActive: true }
});

// Migrate to on-chain
for (const rec of recommendations) {
  await program.methods
    .createCard(
      mapTypeToEnum(rec.type),
      rec.message || "",
      5 // default rating
    )
    .accounts({
      issuer: new PublicKey(rec.issuer.walletAddress),
      recipient: new PublicKey(rec.recipient.walletAddress),
      // ...
    })
    .rpc();
}
```

---

## ⚠️ Important Notes

### Card Uniqueness
Cards are unique per issuer-recipient-number combination:
```
PDA = derive([
  "reputation_card",
  issuer_pubkey,
  recipient_pubkey,
  card_number
])
```

This means:
- ✅ One issuer can give multiple cards to same recipient
- ✅ Each card has a unique number
- ✅ Cards are deterministically addressable

### Storage Costs
Each card costs ~0.01 SOL to create (rent-exempt minimum).

### Message Limits
- Card message: 500 characters
- Revocation reason: 200 characters
- Dispute reason: 500 characters

### Rating System
- Ratings are 1-5 (inclusive)
- No half-stars
- Cannot be changed after creation
- To update, revoke and create new card

---

## 🎯 Next Steps

### Phase 3: Frontend Integration
- Display reputation cards on user profiles
- Add "Issue Card" button
- Show card statistics
- Implement card management UI
- Add dispute resolution interface

### Future Enhancements
- Card categories/tags
- Weighted reputation scores
- Time-decay for old cards
- Verified transaction requirement
- Batch operations
- Card templates

---

## ✅ Phase 2 Complete!

The ReputationCard program is now fully implemented with:
- ✅ Card creation with 8 types
- ✅ Revocation and restoration
- ✅ Dispute mechanism
- ✅ Admin moderation
- ✅ Comprehensive security
- ✅ Statistics tracking

**Ready for Phase 3: Frontend Integration**
