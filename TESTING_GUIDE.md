# 🧪 Complete Testing Guide - Soulbound TrustToken & Reputation System

## Overview

This guide provides comprehensive testing procedures for all phases of the system.

---

## 📋 Pre-Testing Checklist

### Environment Setup
- [ ] Solana CLI installed and configured
- [ ] Anchor CLI installed (v0.32.1)
- [ ] Node.js 18+ installed
- [ ] Phantom wallet installed
- [ ] Devnet SOL in wallet
- [ ] PostgreSQL running (for backend)

### Build Status
- [ ] Programs built successfully (`anchor build`)
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend builds without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] All dependencies installed

---

## Phase 1: Soulbound TrustToken Testing

### Test 1.1: Build and Deploy

```bash
# Build the program
cd /workspaces/trust-token
anchor build

# Check program ID
solana address -k target/deploy/trust_token-keypair.json

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show YOUR_PROGRAM_ID --url devnet
```

**Expected Result:**
- ✅ Program builds without errors
- ✅ Program deploys successfully
- ✅ Program ID matches in Anchor.toml

### Test 1.2: Initialize Program

```bash
# Run initialization script
anchor run initialize

# Or manually:
anchor test --skip-deploy tests/trust_token.ts
```

**Expected Result:**
- ✅ ProgramState account created
- ✅ Authority set correctly
- ✅ total_minted = 0

### Test 1.3: Mint Soulbound Token

```typescript
// Test script
const tx = await program.methods
  .mint("Trust Token #1", "TRUST", "https://example.com/metadata.json")
  .accounts({
    minter: wallet.publicKey,
    // ... other accounts
  })
  .rpc();

console.log("Mint transaction:", tx);

// Verify token account is frozen
const tokenAccount = await getAccount(connection, tokenAccountAddress);
console.log("Is frozen:", tokenAccount.isFrozen); // Should be true
```

**Expected Result:**
- ✅ Transaction succeeds
- ✅ NFT minted to wallet
- ✅ Token account is frozen
- ✅ TrustToken account created
- ✅ is_verified = true

### Test 1.4: Verify Soulbound Status

```typescript
// Call verify_soulbound
const result = await program.methods
  .verifySoulbound()
  .accounts({
    trustToken: trustTokenPDA,
    mint: mintAddress,
    tokenAccount: tokenAccountAddress,
  })
  .rpc();

console.log("Verification passed!");
```

**Expected Result:**
- ✅ Verification succeeds
- ✅ No errors thrown
- ✅ Confirms token is properly bound

### Test 1.5: Attempt Transfer (Should Fail)

```bash
# Try to transfer the frozen token
spl-token transfer YOUR_MINT 1 RECIPIENT_ADDRESS --owner YOUR_WALLET

# Expected error: "Error: Account is frozen"
```

**Expected Result:**
- ❌ Transfer fails
- ✅ Error message: "Account is frozen"
- ✅ Token remains in original wallet

### Test 1.6: Revoke Verification

```typescript
// Authority revokes verification
const tx = await program.methods
  .revokeVerification()
  .accounts({
    authority: authorityWallet.publicKey,
    programState: programStatePDA,
    trustToken: trustTokenPDA,
  })
  .signers([authorityWallet])
  .rpc();

// Check status
const trustToken = await program.account.trustToken.fetch(trustTokenPDA);
console.log("Is verified:", trustToken.isVerified); // Should be false
```

**Expected Result:**
- ✅ Transaction succeeds
- ✅ is_verified = false
- ✅ Token still exists
- ✅ Still soulbound (frozen)

---

## Phase 2: ReputationCard Program Testing

### Test 2.1: Build and Deploy

```bash
# Build reputation_card program
anchor build

# Get program ID
solana address -k target/deploy/reputation_card-keypair.json

# Update declare_id! in lib.rs
# Update Anchor.toml

# Rebuild
anchor build

# Deploy
anchor deploy --provider.cluster devnet
```

**Expected Result:**
- ✅ Program builds successfully
- ✅ Program deploys to devnet
- ✅ Program ID updated correctly

### Test 2.2: Initialize Program

```typescript
const tx = await reputationProgram.methods
  .initialize()
  .accounts({
    authority: wallet.publicKey,
    programState: programStatePDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// Verify
const state = await reputationProgram.account.programState.fetch(programStatePDA);
console.log("Authority:", state.authority.toString());
console.log("Total cards issued:", state.totalCardsIssued.toNumber());
```

**Expected Result:**
- ✅ ProgramState created
- ✅ Authority set
- ✅ totalCardsIssued = 0
- ✅ totalCardsRevoked = 0

### Test 2.3: Create Reputation Card

```typescript
const tx = await reputationProgram.methods
  .createCard(
    { trustworthy: {} },  // card type
    "Excellent seller! Very trustworthy.",  // message
    5  // rating
  )
  .accounts({
    issuer: issuerWallet.publicKey,
    recipient: recipientWallet.publicKey,
    programState: programStatePDA,
    reputationCard: cardPDA,
    systemProgram: SystemProgram.programId,
  })
  .signers([issuerWallet])
  .rpc();

// Verify card
const card = await reputationProgram.account.reputationCard.fetch(cardPDA);
console.log("Card created:", {
  issuer: card.issuer.toString(),
  recipient: card.recipient.toString(),
  type: card.cardType,
  rating: card.rating,
  status: card.status,
});
```

**Expected Result:**
- ✅ Card created successfully
- ✅ Correct issuer and recipient
- ✅ Rating = 5
- ✅ Status = Active
- ✅ Message stored correctly
- ✅ totalCardsIssued incremented

### Test 2.4: Revoke Card

```typescript
const tx = await reputationProgram.methods
  .revokeCard("Changed my mind")
  .accounts({
    issuer: issuerWallet.publicKey,
    programState: programStatePDA,
    reputationCard: cardPDA,
  })
  .signers([issuerWallet])
  .rpc();

// Verify
const card = await reputationProgram.account.reputationCard.fetch(cardPDA);
console.log("Status:", card.status); // Should be Revoked
console.log("Revoked at:", card.revokedAt);
console.log("Reason:", card.revocationReason);
```

**Expected Result:**
- ✅ Card revoked successfully
- ✅ Status = Revoked
- ✅ revokedAt timestamp set
- ✅ Reason stored
- ✅ totalCardsRevoked incremented

### Test 2.5: Restore Card

```typescript
const tx = await reputationProgram.methods
  .restoreCard()
  .accounts({
    issuer: issuerWallet.publicKey,
    programState: programStatePDA,
    reputationCard: cardPDA,
  })
  .signers([issuerWallet])
  .rpc();

// Verify
const card = await reputationProgram.account.reputationCard.fetch(cardPDA);
console.log("Status:", card.status); // Should be Active
console.log("Revoked at:", card.revokedAt); // Should be null
```

**Expected Result:**
- ✅ Card restored successfully
- ✅ Status = Active
- ✅ revokedAt = null
- ✅ revocationReason = null
- ✅ totalCardsRevoked decremented

### Test 2.6: Dispute Card

```typescript
const tx = await reputationProgram.methods
  .disputeCard("This rating is unfair and inaccurate")
  .accounts({
    recipient: recipientWallet.publicKey,
    reputationCard: cardPDA,
  })
  .signers([recipientWallet])
  .rpc();

// Verify
const card = await reputationProgram.account.reputationCard.fetch(cardPDA);
console.log("Status:", card.status); // Should be Disputed
console.log("Dispute reason:", card.disputeReason);
```

**Expected Result:**
- ✅ Card disputed successfully
- ✅ Status = Disputed
- ✅ Dispute reason stored
- ✅ Only recipient can dispute

### Test 2.7: Admin Update Status

```typescript
const tx = await reputationProgram.methods
  .updateCardStatus({ suspended: {} })
  .accounts({
    authority: authorityWallet.publicKey,
    programState: programStatePDA,
    reputationCard: cardPDA,
  })
  .signers([authorityWallet])
  .rpc();

// Verify
const card = await reputationProgram.account.reputationCard.fetch(cardPDA);
console.log("Status:", card.status); // Should be Suspended
```

**Expected Result:**
- ✅ Status updated successfully
- ✅ Only authority can update
- ✅ Status = Suspended

---

## Phase 3: Frontend Testing

### Test 3.1: Component Rendering

```bash
# Start frontend
cd app
npm start

# Open browser to http://localhost:3000
```

**Test Checklist:**
- [ ] App loads without errors
- [ ] Wallet connection button visible
- [ ] No console errors
- [ ] All components render

### Test 3.2: Wallet Connection

**Steps:**
1. Click "Select Wallet"
2. Choose Phantom
3. Approve connection
4. Verify wallet address displays

**Expected Result:**
- ✅ Wallet connects successfully
- ✅ Address displays correctly
- ✅ Disconnect button appears

### Test 3.3: SoulboundTokenDisplay

**Steps:**
1. Connect wallet
2. Navigate to Profile
3. View TrustToken section

**Test Cases:**

**Case A: No Token**
- ✅ Shows "No TrustToken found"
- ✅ Shows mint button
- ✅ Explanation text visible

**Case B: Has Token**
- ✅ Shows token details
- ✅ Verification badge correct
- ✅ Soulbound badge shows
- ✅ Mint address link works
- ✅ Date displays correctly

### Test 3.4: ReputationCards

**Steps:**
1. Navigate to Profile → Reputation Cards
2. View cards section

**Test Cases:**

**Case A: No Cards**
- ✅ Shows "No reputation cards yet"
- ✅ Helpful message displays

**Case B: Has Cards**
- ✅ Summary statistics correct
- ✅ Average rating calculated
- ✅ Cards by type grouped
- ✅ Individual cards display
- ✅ Issuer info shows
- ✅ Dates formatted correctly

### Test 3.5: RequestRecommendation

**Steps:**
1. Navigate to Profile → Issue Card
2. Fill out form

**Test Cases:**

**Valid Submission:**
- Input: Valid wallet address
- Type: Trustworthy
- Rating: 5 stars
- Message: "Great seller!"
- ✅ Form submits successfully
- ✅ Success message shows
- ✅ Form clears

**Invalid Submissions:**
- Invalid address → ✅ Error message
- Message > 500 chars → ✅ Error message
- No wallet connected → ✅ Error message

### Test 3.6: ProfilePage

**Steps:**
1. Navigate to /profile
2. Test all tabs

**Test Checklist:**
- [ ] Overview tab shows TrustToken + Cards
- [ ] Reputation Cards tab shows all cards
- [ ] Issue Card tab shows form
- [ ] Tab switching works
- [ ] Layout is responsive
- [ ] Info section displays

---

## Phase 4: Backend Testing

### Test 4.1: Server Startup

```bash
cd backend
npm run dev
```

**Expected Result:**
- ✅ Server starts on port 3001
- ✅ No errors in console
- ✅ Database connection successful

### Test 4.2: Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "uptime": 123.456
}
```

### Test 4.3: Reputation Cards API

**Test: Get On-chain Cards**
```bash
curl http://localhost:3001/api/reputationcards/onchain/YOUR_WALLET_ADDRESS
```

**Expected Response:**
```json
{
  "cards": [],
  "summary": {
    "totalCards": 0,
    "averageRating": 0,
    "cardsByType": {}
  }
}
```

**Test: Record Card**
```bash
curl -X POST http://localhost:3001/api/reputationcards/record \
  -H "Content-Type: application/json" \
  -d '{
    "cardPDA": "...",
    "issuerWallet": "...",
    "recipientWallet": "...",
    "cardType": "trustworthy",
    "rating": 5,
    "message": "Great!",
    "txSignature": "...",
    "cardNumber": 1
  }'
```

**Expected Response:**
```json
{
  "recommendation": { ... },
  "cardPDA": "...",
  "cardNumber": 1
}
```

**Test: Get Summary**
```bash
curl http://localhost:3001/api/reputationcards/summary/YOUR_WALLET_ADDRESS
```

**Expected Response:**
```json
{
  "reputationScore": 4.5,
  "isVerified": true,
  "totalRecommendations": 3,
  "recommendationsByType": {
    "TRUSTWORTHY": 2,
    "QUALITY_PRODUCTS": 1
  },
  "totalReviews": 5,
  "averageReviewRating": 4.8,
  "recommendations": [...]
}
```

---

## Integration Testing

### Test I.1: End-to-End Flow

**Scenario: New User Gets Verified and Receives Card**

1. **User A: Mint TrustToken**
   ```
   - Connect wallet
   - Click "Mint TrustToken"
   - Approve transaction
   - Verify token appears
   - Check soulbound status
   ```

2. **User A: List Product**
   ```
   - Navigate to marketplace
   - Create product listing
   - Verify requires verification
   - Product appears in listings
   ```

3. **User B: Purchase Product**
   ```
   - Browse products
   - Add to cart
   - Checkout
   - Complete transaction
   ```

4. **User B: Issue Reputation Card**
   ```
   - Navigate to Profile → Issue Card
   - Enter User A's address
   - Select "Trustworthy"
   - Rate 5 stars
   - Write message
   - Submit
   - Approve transaction
   ```

5. **User A: View Card**
   ```
   - Navigate to Profile → Reputation Cards
   - See new card
   - Verify details correct
   - Check reputation score updated
   ```

**Expected Result:**
- ✅ All steps complete successfully
- ✅ Card appears on User A's profile
- ✅ Reputation score increases
- ✅ Card is on-chain

### Test I.2: Card Lifecycle

**Scenario: Issue, Revoke, Restore**

1. **Issue Card**
   - User A issues card to User B
   - Card status = Active

2. **Revoke Card**
   - User A revokes card
   - Card status = Revoked
   - Reason stored

3. **Restore Card**
   - User A restores card
   - Card status = Active
   - Reason cleared

4. **Dispute Card**
   - User B disputes card
   - Card status = Disputed
   - Dispute reason stored

5. **Admin Resolution**
   - Authority reviews dispute
   - Updates status to Suspended or Active

**Expected Result:**
- ✅ All status changes work
- ✅ Only authorized users can perform actions
- ✅ Data persists correctly

---

## Performance Testing

### Test P.1: Load Testing

```bash
# Test concurrent card creations
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/reputationcards/record \
    -H "Content-Type: application/json" \
    -d '{ ... }' &
done
wait
```

**Expected Result:**
- ✅ All requests succeed
- ✅ No race conditions
- ✅ Response time < 2s

### Test P.2: Large Dataset

```bash
# Create 100 cards
# Fetch all cards
# Measure response time
```

**Expected Result:**
- ✅ Fetching 100 cards < 1s
- ✅ Pagination works
- ✅ No memory leaks

---

## Security Testing

### Test S.1: Authorization

**Test: Non-issuer tries to revoke**
```typescript
// Should fail
await program.methods
  .revokeCard("reason")
  .accounts({
    issuer: wrongWallet.publicKey,  // Not the original issuer
    reputationCard: cardPDA,
  })
  .signers([wrongWallet])
  .rpc();
```

**Expected Result:**
- ❌ Transaction fails
- ✅ Error: "UnauthorizedRevoke"

**Test: Non-recipient tries to dispute**
```typescript
// Should fail
await program.methods
  .disputeCard("reason")
  .accounts({
    recipient: wrongWallet.publicKey,  // Not the recipient
    reputationCard: cardPDA,
  })
  .signers([wrongWallet])
  .rpc();
```

**Expected Result:**
- ❌ Transaction fails
- ✅ Error: "UnauthorizedDispute"

### Test S.2: Input Validation

**Test: Invalid rating**
```typescript
// Should fail
await program.methods
  .createCard({ trustworthy: {} }, "message", 6)  // Rating > 5
  .rpc();
```

**Expected Result:**
- ❌ Transaction fails
- ✅ Error: "InvalidRating"

**Test: Message too long**
```typescript
// Should fail
await program.methods
  .createCard({ trustworthy: {} }, "x".repeat(501), 5)  // > 500 chars
  .rpc();
```

**Expected Result:**
- ❌ Transaction fails
- ✅ Error: "MessageTooLong"

---

## Regression Testing

### After Each Change

- [ ] All programs build
- [ ] All tests pass
- [ ] Frontend builds
- [ ] Backend builds
- [ ] No new console errors
- [ ] Existing features still work

---

## Test Results Template

```markdown
## Test Run: [Date]

### Environment
- Solana: devnet
- Programs: [versions]
- Frontend: [version]
- Backend: [version]

### Phase 1: Soulbound TrustToken
- [ ] Test 1.1: Build and Deploy
- [ ] Test 1.2: Initialize Program
- [ ] Test 1.3: Mint Soulbound Token
- [ ] Test 1.4: Verify Soulbound Status
- [ ] Test 1.5: Attempt Transfer
- [ ] Test 1.6: Revoke Verification

### Phase 2: ReputationCard Program
- [ ] Test 2.1: Build and Deploy
- [ ] Test 2.2: Initialize Program
- [ ] Test 2.3: Create Card
- [ ] Test 2.4: Revoke Card
- [ ] Test 2.5: Restore Card
- [ ] Test 2.6: Dispute Card
- [ ] Test 2.7: Admin Update

### Phase 3: Frontend
- [ ] Test 3.1: Component Rendering
- [ ] Test 3.2: Wallet Connection
- [ ] Test 3.3: SoulboundTokenDisplay
- [ ] Test 3.4: ReputationCards
- [ ] Test 3.5: RequestRecommendation
- [ ] Test 3.6: ProfilePage

### Phase 4: Backend
- [ ] Test 4.1: Server Startup
- [ ] Test 4.2: Health Check
- [ ] Test 4.3: Reputation Cards API

### Integration
- [ ] Test I.1: End-to-End Flow
- [ ] Test I.2: Card Lifecycle

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional notes]
```

---

## ✅ Testing Complete!

When all tests pass:
- ✅ Programs work correctly
- ✅ Frontend integrates properly
- ✅ Backend API functions
- ✅ Security measures effective
- ✅ Performance acceptable

**System is ready for production deployment!**
