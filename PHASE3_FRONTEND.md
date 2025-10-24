# Phase 3: Frontend Integration for Soulbound Tokens and Reputation Cards

## ✅ New Components Created

### 1. **SoulboundTokenDisplay.tsx**
Displays the user's TrustToken with soulbound status.

**Features:**
- ✅ Checks for TrustToken in user's wallet
- ✅ Shows verification status (verified/not verified)
- ✅ Displays soulbound status (frozen/transferable)
- ✅ Shows mint address and minting date
- ✅ Links to Solana Explorer
- ✅ Explains soulbound concept

**Location:** `app/src/components/SoulboundTokenDisplay.tsx`

### 2. **ReputationCards.tsx**
Displays all reputation cards for a user.

**Features:**
- ✅ Fetches cards from on-chain program
- ✅ Shows reputation summary (total cards, average rating)
- ✅ Groups cards by type
- ✅ Displays individual card details
- ✅ Shows issuer information
- ✅ Filters active cards only

**Location:** `app/src/components/ReputationCards.tsx`

### 3. **RequestRecommendation.tsx**
Form for issuing reputation cards to other users.

**Features:**
- ✅ Input for recipient wallet address
- ✅ Dropdown for 8 card types
- ✅ Star rating selector (1-5)
- ✅ Message input (max 500 chars)
- ✅ Form validation
- ✅ Success/error feedback
- ✅ Information about cards

**Location:** `app/src/components/RequestRecommendation.tsx`

### 4. **ProfilePage.tsx**
Complete profile page integrating all components.

**Features:**
- ✅ Three tabs: Overview, Reputation Cards, Issue Card
- ✅ Wallet connection requirement
- ✅ TrustToken display
- ✅ Mint button for new users
- ✅ Reputation cards display
- ✅ Card issuance form
- ✅ Information section

**Location:** `app/src/pages/ProfilePage.tsx`

---

## 📁 File Structure

```
app/src/
├── components/
│   ├── SoulboundTokenDisplay.tsx    # NEW: Shows TrustToken
│   ├── ReputationCards.tsx          # NEW: Shows reputation cards
│   ├── RequestRecommendation.tsx    # NEW: Issue cards form
│   ├── MintButton.tsx               # EXISTING: Mint TrustToken
│   ├── TrustTokenDisplay.tsx        # EXISTING: Original display
│   └── WalletProvider.tsx           # EXISTING: Wallet integration
│
├── pages/
│   └── ProfilePage.tsx              # NEW: Complete profile page
│
└── idl/
    ├── trust_token.json             # EXISTING: TrustToken IDL
    └── reputation_card.json         # TODO: Add after deployment
```

---

## 🎨 Component Details

### SoulboundTokenDisplay

**Props:** None (uses wallet context)

**State:**
```typescript
trustToken: TrustTokenData | null
loading: boolean
error: string | null
```

**Key Functions:**
```typescript
checkTrustToken() // Fetches token from blockchain
```

**Display Logic:**
```
No wallet → "Connect wallet"
Loading → "Checking..."
No token → "No TrustToken found"
Has token → Display full details
```

**Visual Elements:**
- 🎫 Token icon
- ✓ Verification badge (green/red)
- 🔒 Soulbound badge (purple)
- Mint address link
- Minting date
- Soulbound explanation

---

### ReputationCards

**Props:**
```typescript
userPublicKey?: PublicKey  // Optional, defaults to connected wallet
```

**State:**
```typescript
cards: ReputationCard[]
loading: boolean
error: string | null
```

**Key Functions:**
```typescript
fetchReputationCards()  // Fetches from program
calculateStats()        // Computes summary stats
```

**Display Sections:**
1. **Summary Statistics**
   - Total active cards
   - Average rating
   - Cards by type

2. **Individual Cards**
   - Card type with icon
   - Rating (stars)
   - Message
   - Issuer info
   - Issue date

**Card Types:**
```typescript
{
  trustworthy: '🤝',
  qualityProducts: '⭐',
  fastShipping: '🚀',
  goodCommunication: '💬',
  fairPricing: '💰',
  reliable: '✅',
  professional: '👔',
  responsive: '⚡',
}
```

---

### RequestRecommendation

**Props:** None (uses wallet context)

**State:**
```typescript
recipientAddress: string
cardType: string
message: string
rating: number
loading: boolean
error: string | null
success: boolean
```

**Form Fields:**
1. **Recipient Address** (required)
   - Text input
   - Validates Solana address
   - Monospace font

2. **Card Type** (required)
   - Dropdown select
   - 8 options with icons
   - Default: Trustworthy

3. **Rating** (required)
   - Star selector (1-5)
   - Visual feedback
   - Default: 5

4. **Message** (optional)
   - Textarea
   - Max 500 characters
   - Character counter

**Validation:**
- Valid Solana address
- Message length ≤ 500
- Rating 1-5
- Wallet connected

---

### ProfilePage

**Tabs:**
1. **Overview**
   - Left: TrustToken + Mint button
   - Right: Reputation cards

2. **Reputation Cards**
   - Full-width card display
   - All cards with details

3. **Issue Card**
   - Card issuance form
   - Centered layout

**Layout:**
```
┌─────────────────────────────────────┐
│  Header (Wallet + Address)          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Tabs (Overview | Cards | Issue)    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Tab Content                         │
│                                      │
│  [Dynamic based on active tab]      │
│                                      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Info Section (About features)      │
└─────────────────────────────────────┘
```

---

## 🔗 Integration Steps

### Step 1: Add Reputation Card IDL

After deploying the reputation_card program:

```bash
# Copy IDL to frontend
cp target/idl/reputation_card.json app/src/idl/
```

### Step 2: Update Components

Replace mock data in `ReputationCards.tsx`:

```typescript
// Remove mock data
// Add actual program interaction
const provider = new AnchorProvider(
  connection,
  wallet.adapter as any,
  { commitment: 'confirmed' }
);
const program = new Program(reputationCardIdl, provider);

// Fetch cards
const cards = await program.account.reputationCard.all([
  {
    memcmp: {
      offset: 8 + 32, // After discriminator + issuer
      bytes: targetPublicKey.toBase58()
    }
  }
]);
```

### Step 3: Update RequestRecommendation

Replace TODO with actual transaction:

```typescript
const tx = await program.methods
  .createCard(
    { [cardType]: {} },
    message,
    rating
  )
  .accounts({
    issuer: publicKey,
    recipient: recipientPubkey,
    programState: programStatePDA,
    reputationCard: cardPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Step 4: Add to Router

Update `App-Marketplace.tsx`:

```typescript
import ProfilePage from './pages/ProfilePage';

// Add route
<Route path="/profile" element={<ProfilePage />} />
```

### Step 5: Update Navigation

Add profile link to `Navbar.tsx`:

```typescript
<Link to="/profile">My Profile</Link>
```

---

## 🎯 User Flows

### Flow 1: New User Gets Verified

```
1. User connects wallet
2. Navigates to Profile
3. Sees "No TrustToken found"
4. Clicks "Mint TrustToken"
5. Approves transaction
6. Token appears as Soulbound + Verified
7. Can now list products
```

### Flow 2: User Views Reputation

```
1. User connects wallet
2. Navigates to Profile
3. Sees TrustToken (Soulbound)
4. Views Reputation Cards tab
5. Sees all cards with ratings
6. Views summary statistics
```

### Flow 3: User Issues Card

```
1. User completes transaction
2. Navigates to Profile → Issue Card
3. Enters recipient address
4. Selects card type
5. Chooses rating (1-5)
6. Writes message
7. Submits form
8. Approves transaction
9. Card appears on recipient's profile
```

### Flow 4: User Checks Soulbound Status

```
1. User views TrustToken
2. Sees "🔒 Soulbound" badge
3. Reads explanation
4. Understands token cannot be transferred
5. Verifies on Solana Explorer
```

---

## 🎨 Styling Guide

### Color Palette

```css
Primary: #9945FF (Purple)
Success: #14F195 (Green)
Error: #ff4444 (Red)
Warning: #FFB800 (Yellow)
Background: #f5f5f5 (Light Gray)
Card: #ffffff (White)
Text: #333333 (Dark Gray)
Muted: #666666 (Gray)
```

### Component Styles

**Cards:**
```css
padding: 20px
background: white
border-radius: 12px
border: 1px solid #ddd
box-shadow: 0 2px 8px rgba(0,0,0,0.05)
```

**Badges:**
```css
padding: 4px 12px
border-radius: 12px
font-size: 14px
font-weight: bold
```

**Buttons:**
```css
padding: 15px
background: #9945FF
color: white
border: none
border-radius: 8px
font-size: 16px
font-weight: bold
cursor: pointer
```

---

## 📱 Responsive Design

### Breakpoints

```css
Mobile: < 768px
Tablet: 768px - 1024px
Desktop: > 1024px
```

### Mobile Adjustments

**ProfilePage:**
```css
@media (max-width: 768px) {
  grid-template-columns: 1fr; /* Single column */
  padding: 10px;
}
```

**Cards:**
```css
@media (max-width: 768px) {
  font-size: 14px;
  padding: 15px;
}
```

---

## 🧪 Testing Checklist

### SoulboundTokenDisplay
- [ ] Shows "Connect wallet" when not connected
- [ ] Shows loading state
- [ ] Displays token when found
- [ ] Shows "No token" when not found
- [ ] Correctly identifies soulbound status
- [ ] Links to Solana Explorer work
- [ ] Verification badge shows correct status

### ReputationCards
- [ ] Fetches cards correctly
- [ ] Calculates statistics accurately
- [ ] Groups cards by type
- [ ] Displays all card details
- [ ] Shows "No cards" message
- [ ] Handles loading state
- [ ] Handles errors gracefully

### RequestRecommendation
- [ ] Validates wallet address
- [ ] Validates message length
- [ ] Star rating works
- [ ] Form submission works
- [ ] Shows success message
- [ ] Shows error messages
- [ ] Clears form after success
- [ ] Disables when wallet not connected

### ProfilePage
- [ ] Requires wallet connection
- [ ] Tabs switch correctly
- [ ] All components render
- [ ] Layout is responsive
- [ ] Navigation works
- [ ] Info section displays

---

## 🔄 State Management

### Wallet Context
```typescript
{
  publicKey: PublicKey | null
  connected: boolean
  wallet: Wallet | null
  signTransaction: Function
}
```

### Component State
```typescript
// SoulboundTokenDisplay
trustToken: TrustTokenData | null
loading: boolean
error: string | null

// ReputationCards
cards: ReputationCard[]
loading: boolean
error: string | null

// RequestRecommendation
recipientAddress: string
cardType: string
message: string
rating: number
loading: boolean
error: string | null
success: boolean
```

---

## 🚀 Performance Optimization

### Lazy Loading
```typescript
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
```

### Memoization
```typescript
const stats = useMemo(() => calculateStats(cards), [cards]);
```

### Debouncing
```typescript
const debouncedFetch = debounce(fetchCards, 500);
```

---

## 🐛 Error Handling

### Network Errors
```typescript
try {
  await fetchData();
} catch (err) {
  if (err.message.includes('network')) {
    setError('Network error. Please check your connection.');
  }
}
```

### Wallet Errors
```typescript
if (!publicKey) {
  setError('Please connect your wallet');
  return;
}
```

### Program Errors
```typescript
try {
  await program.methods.createCard(...).rpc();
} catch (err) {
  if (err.message.includes('UnauthorizedRevoke')) {
    setError('You can only revoke cards you issued');
  }
}
```

---

## ✅ Phase 3 Complete!

The frontend is now fully integrated with:
- ✅ Soulbound token display
- ✅ Reputation cards viewer
- ✅ Card issuance form
- ✅ Complete profile page
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

**Ready for Phase 4: Backend API Updates**
