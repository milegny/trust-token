# The Bit Central - Backend API

RESTful API for The Bit Central marketplace built with Node.js, Express, PostgreSQL, and Prisma.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── db/
│   │   └── client.ts          # Prisma client instance
│   ├── routes/
│   │   ├── users.ts           # User management
│   │   ├── products.ts        # Product CRUD
│   │   ├── orders.ts          # Order management
│   │   ├── reviews.ts         # Review system
│   │   ├── recommendations.ts # Reputation cards
│   │   └── trusttoken.ts      # TrustToken operations
│   ├── services/
│   │   └── solana.ts          # Solana/Anchor integration
│   ├── idl/
│   │   └── trust_token.json   # Anchor program IDL
│   └── server.ts              # Express app setup
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔌 API Endpoints

### Users

- `GET /api/users/:id` - Get user by ID
- `GET /api/users/wallet/:address` - Get user by wallet address
- `POST /api/users` - Create or update user
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/reputation` - Get user reputation stats

### Products

- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (verified sellers only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (soft delete)
- `GET /api/products/meta/categories` - Get product categories

### Orders

- `GET /api/orders/user/:userId` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order

### Reviews

- `GET /api/reviews/user/:userId` - Get user reviews
- `GET /api/reviews/order/:orderId` - Get order review
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Recommendations

- `GET /api/recommendations/user/:userId` - Get user recommendations
- `GET /api/recommendations/:id` - Get recommendation details
- `POST /api/recommendations` - Create recommendation
- `POST /api/recommendations/:id/revoke` - Revoke recommendation
- `POST /api/recommendations/:id/restore` - Restore recommendation
- `GET /api/recommendations/stats/:userId` - Get recommendation stats

### TrustToken

- `GET /api/trusttoken/verify/:mintAddress` - Verify TrustToken
- `GET /api/trusttoken/user/:walletAddress` - Get user's TrustToken
- `POST /api/trusttoken/record-mint` - Record TrustToken mint
- `PATCH /api/trusttoken/:id/verification` - Update verification status
- `GET /api/trusttoken/stats/program` - Get program statistics
- `GET /api/trusttoken/transaction/:signature` - Get transaction details

## 🗄️ Database Schema

### User
- Wallet address (unique)
- Profile information (username, email, bio, avatar)
- TrustToken mint address
- Verification status
- Reputation score

### Product
- Seller reference
- Product details (name, description, price, category)
- Images array
- Stock quantity
- Active status

### Order
- Buyer and seller references
- Order status (CREATED, PAID, SHIPPED, etc.)
- Total amount
- Shipping information
- Transaction signature
- Order items (many-to-many with products)

### Review
- Order reference (one-to-one)
- Reviewer and reviewee references
- Rating (1-5)
- Comment

### Recommendation
- Issuer and recipient references
- Type (TRUSTWORTHY, QUALITY_PRODUCTS, etc.)
- Message
- Active status
- Transaction signature

### TrustToken
- User reference
- Mint address (unique)
- NFT metadata (name, symbol, URI)
- Verification status
- Mint timestamp

## 🔐 Environment Variables

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://..."
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
TRUST_TOKEN_PROGRAM_ID=3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test API endpoints
curl http://localhost:3001/health
```

## 📊 Database Management

```bash
# Open Prisma Studio
npm run prisma:studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (development only!)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## 🚀 Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions.

## 🛠️ Development

```bash
# Watch mode with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Notes

- All prices are in SOL
- Orders are grouped by seller
- Reviews can only be created for completed orders
- Recommendations require completed transactions
- TrustToken verification is synced with on-chain data
