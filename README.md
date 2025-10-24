# 🎫 TrustToken

**NFT-Based Identity Verification for The Bit Central Marketplace**

TrustToken is a Solana blockchain-based verification system that issues NFTs to verified users, enabling them to sell on The Bit Central marketplace. Each TrustToken is a unique, non-fungible token that serves as proof of identity verification.

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://explorer.solana.com/address/3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju?cluster=devnet)
[![Anchor](https://img.shields.io/badge/Anchor-0.32.1-663399)](https://www.anchor-lang.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🌟 Features

### Smart Contract
- ✅ **NFT-Based Verification** - Each user receives a unique verification NFT
- ✅ **Self-Minting** - Users can mint their own verification tokens (pending deployment)
- ✅ **Revocable Verification** - Authority can revoke/restore verification status
- ✅ **Metaplex Integration** - Full NFT metadata and master edition support
- ✅ **Secure & Auditable** - Built with Anchor framework on Solana

### Frontend Application
- ✅ **Wallet Integration** - Phantom wallet support via Solana Wallet Adapter
- ✅ **Real-Time Status** - Check verification status instantly
- ✅ **Responsive Design** - Beautiful UI with smooth animations
- ✅ **Transaction Tracking** - View transactions on Solana Explorer
- ✅ **Error Handling** - Graceful error messages and retry functionality

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TrustToken System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Frontend   │◄───────►│   Solana     │                  │
│  │   (React)    │  RPC    │   Program    │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                        │                           │
│         │                        │                           │
│         ▼                        ▼                           │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Phantom    │         │   Metaplex   │                  │
│  │   Wallet     │         │   Metadata   │                  │
│  └──────────────┘         └──────────────┘                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Rust** 1.75+ with Cargo
- **Solana CLI** 1.18+
- **Anchor CLI** 0.32.1
- **Phantom Wallet** browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/trust-token.git
cd trust-token

# Install dependencies
yarn install

# Build the smart contract
anchor build

# Run tests
anchor test
```

### Deploy to Devnet

```bash
# Configure Solana CLI for devnet
solana config set --url devnet

# Airdrop SOL for deployment (if needed)
solana airdrop 2

# Deploy the program
anchor deploy --provider.cluster devnet

# Initialize the program
anchor run initialize
```

### Run Frontend

```bash
# Navigate to frontend directory
cd app

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

---

## 📋 Program Details

### Program ID
```
3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju
```

### Network
```
Solana Devnet
```

### Instructions

#### `initialize()`
Initializes the program state. Must be called once by the authority.

**Accounts:**
- `authority` - The wallet that will control the program
- `program_state` - PDA storing global configuration

#### `mint(name, symbol, uri)`
Mints a TrustToken NFT to a user.

**Arguments:**
- `name` - NFT name (max 32 chars)
- `symbol` - NFT symbol (max 10 chars)
- `uri` - Metadata URI (max 200 chars)

**Accounts:**
- `minter` - User minting the token (pays and receives)
- `program_state` - Program state PDA
- `mint` - New mint account for the NFT
- `token_account` - Associated token account
- `trust_token` - TrustToken data account (PDA)
- `metadata` - Metaplex metadata account
- `master_edition` - Metaplex master edition account
- Plus standard program accounts (Token, ATA, Metadata, System, Rent)

#### `revoke_verification()`
Revokes verification status without burning the NFT.

**Accounts:**
- `authority` - Program authority (must match program_state.authority)
- `trust_token` - TrustToken account to revoke

#### `restore_verification()`
Restores verification status.

**Accounts:**
- `authority` - Program authority
- `trust_token` - TrustToken account to restore

---

## 🧪 Testing

### Run All Tests
```bash
anchor test
```

### Run Specific Test
```bash
anchor test --skip-deploy tests/trust_token_simple.ts
```

### Test Scripts
```bash
# Initialize program
anchor run initialize

# Mint a token
anchor run mint

# Verify mint
anchor run verify
```

---

## 📁 Project Structure

```
trust-token/
├── programs/
│   └── trust_token/
│       ├── src/
│       │   └── lib.rs              # Smart contract code
│       └── Cargo.toml
├── app/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MintButton.tsx      # Minting UI
│   │   │   ├── TrustTokenDisplay.tsx # NFT display
│   │   │   └── WalletProvider.tsx  # Wallet integration
│   │   ├── idl/
│   │   │   └── trust_token.json    # Program IDL
│   │   ├── App.tsx                 # Main app component
│   │   └── index.tsx               # Entry point
│   └── package.json
├── scripts/
│   ├── initialize.ts               # Initialize program
│   ├── mint_nft.ts                 # Mint token script
│   └── test_mint.ts                # Test minting
├── tests/
│   ├── trust_token.ts              # Main tests
│   └── trust_token_simple.ts       # Basic tests
├── Anchor.toml                     # Anchor configuration
├── Cargo.toml                      # Rust workspace
└── README.md
```

---

## 🔧 Configuration

### Anchor.toml
```toml
[programs.devnet]
trust_token = "3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

### Frontend Environment
The frontend automatically connects to Solana Devnet. To change networks, update the connection endpoint in `App.tsx`.

---

## 🎨 Frontend Usage

### Connect Wallet
1. Click "Select Wallet" button
2. Choose Phantom from the list
3. Approve the connection
4. Ensure Phantom is set to **Devnet**

### Check Verification Status
- The app automatically checks if you have a TrustToken
- If found, it displays your verification NFT
- If not found, you'll see the mint button

### Mint TrustToken
1. Click "🎫 Get Your TrustToken"
2. Approve the transaction in Phantom
3. Wait ~5-10 seconds for confirmation
4. Your NFT will appear automatically

### View on Explorer
Click the "View on Solana Explorer" link to see your NFT on-chain.

---

## 🛠️ Development

### Build Program
```bash
anchor build
```

### Generate IDL
```bash
anchor idl build
```

### Update Frontend IDL
```bash
cp target/idl/trust_token.json app/src/idl/
```

### Format Code
```bash
# Rust
cargo fmt

# TypeScript
cd app && npm run format
```

---

## 🐛 Known Issues

### Minting Error
**Status:** 🔴 Active  
**Issue:** Current deployed program requires authority signature for minting  
**Solution:** Updated program ready to deploy (requires ~2.34 SOL for upgrade)  
**Workaround:** Use backend service or wait for program upgrade

### Devnet Faucet Rate Limiting
**Status:** 🟡 Intermittent  
**Issue:** Solana devnet faucet has rate limits  
**Solution:** Use web-based faucets or wait for rate limit reset

---

## 📊 Program State

### ProgramState Account
```rust
pub struct ProgramState {
    pub authority: Pubkey,    // Program authority
    pub total_minted: u64,    // Total tokens minted
}
```

### TrustToken Account
```rust
pub struct TrustToken {
    pub owner: Pubkey,        // Token owner
    pub mint: Pubkey,         // Mint address
    pub is_verified: bool,    // Verification status
    pub minted_at: i64,       // Unix timestamp
}
```

---

## 🔐 Security

- ✅ Authority-based access control for admin functions
- ✅ PDA-based account derivation for security
- ✅ Input validation (string length limits)
- ✅ Overflow protection with checked arithmetic
- ✅ Anchor framework security features

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Program Explorer:** [View on Solana Explorer](https://explorer.solana.com/address/3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju?cluster=devnet)
- **Solana Docs:** [https://docs.solana.com](https://docs.solana.com)
- **Anchor Docs:** [https://www.anchor-lang.com](https://www.anchor-lang.com)
- **Metaplex Docs:** [https://docs.metaplex.com](https://docs.metaplex.com)

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

---

## 🙏 Acknowledgments

- Built with [Anchor Framework](https://www.anchor-lang.com/)
- NFT metadata powered by [Metaplex](https://www.metaplex.com/)
- Wallet integration via [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- Developed for The Bit Central marketplace

---

**Made with ❤️ for the Solana ecosystem**
