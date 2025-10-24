# 🚀 Quick Reference Guide - Soulbound TrustToken & Reputation System

## 📋 Quick Links

| Document | Purpose |
|----------|---------|
| [EVOLUTION_SUMMARY.md](EVOLUTION_SUMMARY.md) | Complete overview of all changes |
| [SOULBOUND_REPUTATION_COMPLETE.md](SOULBOUND_REPUTATION_COMPLETE.md) | Comprehensive guide |
| [PHASE1_SOULBOUND.md](PHASE1_SOULBOUND.md) | Soulbound implementation details |
| [PHASE2_REPUTATION_CARD.md](PHASE2_REPUTATION_CARD.md) | ReputationCard program details |
| [PHASE3_FRONTEND.md](PHASE3_FRONTEND.md) | Frontend integration details |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Complete testing procedures |

---

## ⚡ Quick Start

### Build Everything
```bash
# Build programs
anchor build

# Build frontend
cd app && npm run build

# Build backend
cd backend && npm run build
```

### Deploy Programs
```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Initialize programs
anchor run initialize
```

### Run Locally
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd app && npm start
```

---

## 📁 File Locations

### Programs
```
programs/trust_token/src/lib.rs          # Soulbound TrustToken
programs/reputation_card/src/lib.rs      # ReputationCard program
```

### Frontend
```
app/src/components/SoulboundTokenDisplay.tsx    # Token display
app/src/components/ReputationCards.tsx          # Cards viewer
app/src/components/RequestRecommendation.tsx    # Issue form
app/src/pages/ProfilePage.tsx                   # Profile page
```

### Backend
```
backend/src/routes/reputationcards.ts    # Reputation API
backend/src/routes/trusttoken.ts         # TrustToken API
backend/src/server.ts                    # Main server
```

---

## 🔑 Key Functions

### TrustToken Program
```rust
mint()                      // Mint soulbound NFT
verify_soulbound()          // Check if properly bound
burn_transferred_token()    // Burn transferred tokens
revoke_verification()       // Revoke verified status
restore_verification()      // Restore verified status
```

### ReputationCard Program
```rust
initialize()                // Set up program
create_card()              // Issue reputation card
revoke_card()              // Revoke a card
restore_card()             // Restore revoked card
update_card_status()       // Admin status update
dispute_card()             // Dispute a card
```

---

## 🎨 Card Types

| Type | Icon | Description |
|------|------|-------------|
| Trustworthy | 🤝 | General trustworthiness |
| QualityProducts | ⭐ | High-quality items |
| FastShipping | 🚀 | Quick delivery |
| GoodCommunication | 💬 | Responsive and clear |
| FairPricing | 💰 | Reasonable prices |
| Reliable | ✅ | Consistent performance |
| Professional | 👔 | Professional conduct |
| Responsive | ⚡ | Quick to respond |

---

## 🔄 Card Status

| Status | Description |
|--------|-------------|
| Active | Card is valid |
| Revoked | Issuer revoked it |
| Disputed | Recipient disputed it |
| Suspended | Authority suspended it |

---

## 🌐 API Endpoints

### TrustToken
```
GET  /api/trusttoken/verify/:mintAddress
GET  /api/trusttoken/user/:walletAddress
POST /api/trusttoken/record-mint
```

### Reputation Cards
```
GET  /api/reputationcards/onchain/:walletAddress
POST /api/reputationcards/record
POST /api/reputationcards/revoke
GET  /api/reputationcards/summary/:walletAddress
POST /api/reputationcards/sync/:walletAddress
```

---

## 🧪 Quick Tests

### Test Soulbound
```bash
# Mint token
anchor run test-mint

# Try to transfer (should fail)
spl-token transfer MINT 1 RECIPIENT
```

### Test Reputation Card
```typescript
// Create card
await program.methods
  .createCard({ trustworthy: {} }, "Great!", 5)
  .rpc();

// Revoke card
await program.methods
  .revokeCard("Changed mind")
  .rpc();
```

### Test Frontend
```bash
# Start app
npm start

# Navigate to /profile
# Connect wallet
# Test all features
```

---

## 🐛 Common Issues

### Issue: Program won't build
```bash
# Solution
anchor clean
anchor build
```

### Issue: Frontend can't connect
```bash
# Check:
1. Backend is running
2. REACT_APP_API_URL is correct
3. CORS is configured
4. Wallet is connected
```

### Issue: Transaction fails
```bash
# Check:
1. Wallet has SOL
2. Program is deployed
3. Accounts are correct
4. Signer is authorized
```

---

## 📊 Reputation Score

### Calculation
```
recScore = min(recommendations.length * 0.5, 5)
reviewScore = avg(reviews.rating)
finalScore = (recScore * 0.4) + (reviewScore * 0.6)
```

### Example
```
Recommendations: 6 → recScore = 3.0 (capped at 5)
Reviews: [5, 4, 5, 4] → reviewScore = 4.5
Final: (3.0 * 0.4) + (4.5 * 0.6) = 3.9
```

---

## 🔐 Security Checklist

- [ ] Programs deployed with correct IDs
- [ ] Authority wallet secured
- [ ] Environment variables set
- [ ] CORS configured properly
- [ ] Input validation enabled
- [ ] Error handling in place
- [ ] Rate limiting configured (future)

---

## 📱 User Flows

### Get Verified
```
1. Connect wallet
2. Go to Profile
3. Click "Mint TrustToken"
4. Approve transaction
5. Token is soulbound
```

### Issue Card
```
1. Complete transaction
2. Go to Profile → Issue Card
3. Enter recipient address
4. Choose card type
5. Rate 1-5 stars
6. Write message
7. Submit
```

### View Reputation
```
1. Go to Profile
2. Click "Reputation Cards" tab
3. View all cards
4. See summary statistics
```

---

## 🎯 Key Concepts

### Soulbound
- Permanently bound to wallet
- Cannot be transferred
- Frozen on-chain
- Proves identity

### Reputation Cards
- On-chain proof
- Multiple types
- Revocable
- Disputable

### Why On-Chain?
- Transparent
- Immutable
- Verifiable
- Trustless

---

## 📞 Need Help?

1. Check documentation
2. Review code comments
3. Test on devnet first
4. Check console for errors
5. Verify environment variables

---

## ✅ Deployment Checklist

### Programs
- [ ] Built successfully
- [ ] Program IDs updated
- [ ] Deployed to devnet
- [ ] Initialized
- [ ] Tested

### Frontend
- [ ] Built successfully
- [ ] Environment variables set
- [ ] Program IDs updated
- [ ] Deployed to Vercel
- [ ] Tested

### Backend
- [ ] Built successfully
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Deployed to Vercel
- [ ] Tested

---

## 🎉 Quick Wins

### Day 1
- ✅ Build and deploy programs
- ✅ Test basic functions
- ✅ Mint soulbound token

### Day 2
- ✅ Deploy frontend
- ✅ Deploy backend
- ✅ Test integration

### Day 3
- ✅ Create reputation cards
- ✅ Test full flow
- ✅ Go live!

---

## 📚 Learning Path

### Beginner
1. Read [EVOLUTION_SUMMARY.md](EVOLUTION_SUMMARY.md)
2. Understand soulbound concept
3. Test locally

### Intermediate
1. Read phase documentation
2. Understand program code
3. Deploy to devnet

### Advanced
1. Customize features
2. Add new card types
3. Deploy to mainnet

---

## 🔗 External Resources

- [Solana Docs](https://docs.solana.com)
- [Anchor Docs](https://www.anchor-lang.com)
- [Metaplex Docs](https://docs.metaplex.com)
- [React Docs](https://react.dev)

---

## 💡 Pro Tips

1. **Always test on devnet first**
2. **Keep program IDs updated**
3. **Use environment variables**
4. **Check console for errors**
5. **Read error messages carefully**
6. **Backup your keypairs**
7. **Document your changes**

---

## 🎯 Success Criteria

- ✅ Programs build and deploy
- ✅ Frontend connects to programs
- ✅ Backend API works
- ✅ Soulbound tokens work
- ✅ Reputation cards work
- ✅ End-to-end flow works

---

**Quick Reference Complete!** 🚀

For detailed information, see the full documentation files.
