# 🛍️ The Bit Central Marketplace

A decentralized marketplace built on Solana with NFT-based identity verification (TrustToken). Buy and sell products with confidence using blockchain-verified seller identities and on-chain reputation.

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana)](https://explorer.solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)

---

## 🌟 Features

### 🎫 TrustToken Verification
- **NFT-Based Identity**: Sellers mint unique TrustTokens as proof of verification
- **Soulbound Tokens**: Non-transferable identity verification
- **On-Chain Verification**: All verification status stored on Solana blockchain
- **Revocable**: Authority can revoke/restore verification status

### 🛒 Marketplace
- **Product Listings**: Browse products by category, search, and filter
- **Shopping Cart**: Add multiple items from different sellers
- **Order Management**: Track orders from creation to completion
- **Multi-Seller Support**: Orders automatically grouped by seller

### ⭐ Reputation System
- **Reviews**: Buyers rate sellers after completed transactions
- **Recommendations**: Issue reputation cards for trustworthy sellers
- **Reputation Score**: Calculated from reviews and recommendations
- **Transparent History**: All reviews and recommendations visible on profiles

### 💳 Solana Integration
- **Wallet Connection**: Phantom wallet support
- **Transaction Tracking**: All transactions recorded on-chain
- **SOL Payments**: Native Solana token for all transactions
- **Escrow Support**: (Coming soon) Secure payment escrow

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    The Bit Central System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────┐ │
│  │   Frontend   │◄───────►│   Backend    │◄───────►│ Database │ │
│  │   (React)    │  REST   │   (Express)  │  Prisma │  (Postgres)│
│  └──────────────┘         └──────────────┘         └──────────┘ │
│         │                        │                                │
│         │                        │                                │
│         ▼                        ▼                                │
│  ┌──────────────┐         ┌──────────────┐                       │
│  │   Phantom    │         │   Solana     │                       │
│  │   Wallet     │         │   Program    │                       │
│  └──────────────┘         └──────────────┘                       │
│                                  │                                │
│                                  ▼                                │
│                           ┌──────────────┐                        │
│                           │   Metaplex   │                        │
│                           │   Metadata   │                        │
│                           └──────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Solana CLI (for smart contract deployment)
- Phantom Wallet browser extension

### 1. Clone Repository

```bash
git clone https://github.com/milegny/trust-token.git
cd trust-token
```

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and settings

# Set up database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Set Up Frontend

```bash
cd app

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend API URL

# Start frontend
npm start
```

Frontend will run on `http://localhost:3000`

### 4. Connect Wallet

1. Install Phantom wallet extension
2. Switch to Solana Devnet
3. Get devnet SOL from faucet
4. Connect wallet in the app

---

## 📋 User Flows

### Buyer Flow

1. **Browse Products**
   - View all products or filter by category
   - Search for specific items
   - View product details and seller reputation

2. **Add to Cart**
   - Select quantity
   - Add multiple items from different sellers
   - Review cart before checkout

3. **Checkout**
   - Enter shipping address
   - Connect wallet
   - Confirm transaction
   - Orders created (grouped by seller)

4. **Track Order**
   - View order status
   - See tracking information
   - Receive notifications on status changes

5. **Leave Review**
   - Rate seller (1-5 stars)
   - Write review comment
   - Review updates seller's reputation

### Seller Flow

1. **Get Verified**
   - Mint TrustToken NFT
   - Verification recorded on-chain
   - Gain ability to list products

2. **List Products**
   - Create product listing
   - Upload images
   - Set price and stock
   - Choose category

3. **Manage Orders**
   - View incoming orders
   - Update order status
   - Add tracking information
   - Mark as shipped/delivered

4. **Build Reputation**
   - Receive reviews from buyers
   - Get recommendations from satisfied customers
   - Increase reputation score
   - Attract more buyers

---

## 🗄️ Database Schema

### Core Entities

**User**
- Profile information
- Wallet address
- TrustToken mint
- Verification status
- Reputation score

**Product**
- Product details
- Seller reference
- Images
- Price and stock
- Category

**Order**
- Buyer and seller
- Order items
- Status tracking
- Shipping info
- Transaction signature

**Review**
- Order reference
- Rating and comment
- Reviewer/reviewee

**Recommendation**
- Issuer and recipient
- Type and message
- Active status

**TrustToken**
- User reference
- Mint address
- Verification status
- Metadata

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
Currently using wallet address for identification. JWT authentication coming soon.

### Key Endpoints

#### Products
```bash
# List products
GET /products?category=Electronics&page=1&limit=20

# Get product
GET /products/:id

# Create product (verified sellers only)
POST /products
{
  "sellerId": "uuid",
  "name": "Product Name",
  "description": "Description",
  "price": 0.5,
  "category": "Electronics",
  "images": ["url1", "url2"],
  "stock": 10
}
```

#### Orders
```bash
# Create order
POST /orders
{
  "buyerId": "uuid",
  "sellerId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 1 }
  ],
  "shippingAddress": "123 Main St..."
}

# Update order status
PATCH /orders/:id/status
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123"
}
```

#### Reviews
```bash
# Create review
POST /reviews
{
  "orderId": "uuid",
  "reviewerId": "uuid",
  "revieweeId": "uuid",
  "rating": 5,
  "comment": "Great seller!"
}
```

See [backend/README.md](backend/README.md) for complete API documentation.

---

## 🎨 Frontend Components

### Pages
- **ProductList**: Browse and search products
- **ProductDetail**: View product details and seller info
- **Cart**: Review cart and checkout
- **UserProfile**: View user profile, products, reviews, recommendations

### Components
- **Navbar**: Navigation and wallet connection
- **WalletProvider**: Solana wallet integration
- **MintButton**: TrustToken minting
- **TrustTokenDisplay**: Display verification status

### Context
- **CartContext**: Shopping cart state management

---

## 🔐 Security Features

- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Environment variable protection
- ✅ Wallet signature verification (coming soon)
- ✅ Rate limiting (coming soon)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd app
npm test
```

### Manual Testing Checklist

- [ ] Connect wallet
- [ ] Browse products
- [ ] Search and filter
- [ ] View product details
- [ ] Add to cart
- [ ] Update cart quantities
- [ ] Checkout process
- [ ] View orders
- [ ] Update order status
- [ ] Leave review
- [ ] View user profile
- [ ] Mint TrustToken

---

## 📊 Database Seeding

The seed script creates sample data:
- 2 users (Alice - verified seller, Bob - buyer)
- 3 products (Electronics and Fashion)
- 1 completed order
- 1 review
- 1 recommendation

```bash
cd backend
npm run prisma:seed
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Backend (Vercel)**
```bash
cd backend
vercel --prod
```

**Frontend (Vercel)**
```bash
cd app
vercel --prod
```

---

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd app
npm start  # Starts with hot reload
```

### Database Management
```bash
# Open Prisma Studio
npm run prisma:studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

---

## 📈 Roadmap

### Phase 1: MVP (Current)
- ✅ Basic marketplace functionality
- ✅ TrustToken integration
- ✅ Review system
- ✅ Recommendation system

### Phase 2: Enhanced Features
- [ ] Escrow smart contract
- [ ] Dispute resolution
- [ ] Multi-currency support (USDC)
- [ ] Advanced search and filters
- [ ] Wishlist functionality

### Phase 3: Advanced Features
- [ ] Messaging system
- [ ] Auction functionality
- [ ] NFT marketplace integration
- [ ] Mobile app
- [ ] Analytics dashboard

### Phase 4: Scaling
- [ ] Mainnet deployment
- [ ] Performance optimization
- [ ] CDN integration
- [ ] Advanced caching
- [ ] Load balancing

---

## 🐛 Known Issues

1. **User ID vs Wallet Address**: Currently using wallet addresses where user IDs should be used. Need to implement proper user registration flow.

2. **Transaction Signing**: Order creation doesn't yet require on-chain transaction. Escrow contract needed.

3. **Image Upload**: Currently using URLs. Need to implement IPFS or cloud storage.

4. **Real-time Updates**: No WebSocket support yet for order status updates.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🔗 Links

- **Smart Contract**: [View on Solana Explorer](https://explorer.solana.com/address/3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju?cluster=devnet)
- **Documentation**: See individual README files in backend/ and app/
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments

---

## 🙏 Acknowledgments

- Built with [Anchor Framework](https://www.anchor-lang.com/)
- NFT metadata powered by [Metaplex](https://www.metaplex.com/)
- Wallet integration via [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- Database ORM by [Prisma](https://www.prisma.io/)

---

**Made with ❤️ for the Solana ecosystem**

🎫 **The Bit Central** - Where trust meets commerce on the blockchain
