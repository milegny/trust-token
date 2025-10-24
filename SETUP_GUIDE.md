# 🚀 Complete Setup Guide - The Bit Central Marketplace

This guide will walk you through setting up the entire marketplace from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Database Setup](#database-setup)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

1. **Node.js 18+**
   ```bash
   # Check version
   node --version
   
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **PostgreSQL 14+**
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14
   
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install postgresql-14
   sudo systemctl start postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

3. **Git**
   ```bash
   # Check version
   git --version
   
   # Install if needed
   # macOS: brew install git
   # Ubuntu: sudo apt-get install git
   # Windows: https://git-scm.com/download/win
   ```

4. **Phantom Wallet**
   - Install browser extension from [phantom.app](https://phantom.app)
   - Create wallet or import existing
   - Switch to Devnet

### Optional Tools

- **Prisma Studio**: Included with Prisma
- **Postman/Insomnia**: For API testing
- **VS Code**: Recommended IDE with extensions:
  - Prisma
  - ESLint
  - Prettier

---

## Project Structure

```
trust-token/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── db/             # Database client
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── package.json
│
├── app/                     # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── services/       # API calls
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── programs/                # Solana smart contracts
│   └── trust_token/
│
└── MARKETPLACE_README.md    # Main documentation
```

---

## Backend Setup

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Express.js (web framework)
- Prisma (ORM)
- @solana/web3.js (Solana integration)
- @coral-xyz/anchor (Anchor framework)
- And other dependencies

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bitcentral?schema=public"

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
TRUST_TOKEN_PROGRAM_ID=3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Step 4: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Seed with sample data
npm run prisma:seed
```

Expected output:
```
🌱 Seeding database...
✅ Created users: { user1: 'alice_seller', user2: 'bob_buyer' }
✅ Created products: { product1: 'Wireless Bluetooth Headphones', ... }
✅ Created order: <order-id>
✅ Created review: <review-id>
✅ Created recommendation: <recommendation-id>
🎉 Seeding completed successfully!
```

### Step 5: Start Backend Server

```bash
npm run dev
```

Expected output:
```
🚀 Server running on port 3001
📡 Environment: development
🔗 Solana Network: devnet
```

### Step 6: Test Backend

Open another terminal:

```bash
# Health check
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"...","uptime":...}

# Get products
curl http://localhost:3001/api/products

# Expected: JSON array of products
```

---

## Frontend Setup

### Step 1: Navigate to Frontend

```bash
cd app
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- React 19
- React Router
- Solana Wallet Adapter
- Axios (HTTP client)
- And other dependencies

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
REACT_APP_TRUST_TOKEN_PROGRAM_ID=3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju
```

### Step 4: Start Frontend

```bash
npm start
```

Expected output:
```
Compiled successfully!

You can now view app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

### Step 5: Test Frontend

1. Open browser to `http://localhost:3000`
2. You should see the marketplace homepage
3. Products should be loaded from the backend

---

## Database Setup

### Option 1: Local PostgreSQL

1. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE bitcentral;
   
   # Create user (optional)
   CREATE USER bitcentral_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE bitcentral TO bitcentral_user;
   
   # Exit
   \q
   ```

2. **Update DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://bitcentral_user:your_password@localhost:5432/bitcentral?schema=public"
   ```

### Option 2: Cloud PostgreSQL (Recommended for Production)

#### Using Neon (Serverless)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

#### Using Supabase

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (use "Connection pooling" for serverless)
5. Update `.env`

#### Using Railway

1. Sign up at [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Copy connection string from variables
4. Update `.env`

---

## Testing

### Backend Testing

1. **Health Check**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Get Products**
   ```bash
   curl http://localhost:3001/api/products
   ```

3. **Get Specific Product**
   ```bash
   curl http://localhost:3001/api/products/<product-id>
   ```

4. **Get User by Wallet**
   ```bash
   curl http://localhost:3001/api/users/wallet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
   ```

### Frontend Testing

1. **Browse Products**
   - Navigate to `http://localhost:3000`
   - Products should load
   - Try filtering by category
   - Try search

2. **Product Details**
   - Click on a product
   - Should show full details
   - Seller information visible
   - Reviews displayed

3. **Shopping Cart**
   - Add product to cart
   - Cart icon should show count
   - Navigate to cart
   - Update quantities
   - Remove items

4. **Wallet Connection**
   - Click "Select Wallet"
   - Choose Phantom
   - Approve connection
   - Wallet address should display

5. **User Profile**
   - Click on a seller's name
   - Should show profile page
   - Products, reviews, and recommendations visible

### Database Testing

1. **Open Prisma Studio**
   ```bash
   cd backend
   npm run prisma:studio
   ```

2. **Verify Data**
   - Browse to `http://localhost:5555`
   - Check Users table
   - Check Products table
   - Check Orders table
   - Verify relationships

---

## Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3002
```

#### Database Connection Error
```bash
# Test PostgreSQL connection
psql -U postgres -d bitcentral

# Check if PostgreSQL is running
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Restart PostgreSQL
# macOS: brew services restart postgresql
# Linux: sudo systemctl restart postgresql
```

#### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Check schema
npx prisma validate
```

### Frontend Issues

#### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Wallet Connection Issues
1. Make sure Phantom is installed
2. Switch Phantom to Devnet
3. Check browser console for errors
4. Try disconnecting and reconnecting

#### API Connection Issues
1. Verify backend is running
2. Check REACT_APP_API_URL in .env
3. Check CORS settings in backend
4. Check browser console for CORS errors

### Database Issues

#### Migration Failed
```bash
# Drop database and recreate
dropdb bitcentral
createdb bitcentral

# Run migrations again
npx prisma migrate dev
```

#### Seed Failed
```bash
# Check if tables exist
npx prisma studio

# Reset and reseed
npx prisma migrate reset
npm run prisma:seed
```

---

## Next Steps

1. **Customize the Marketplace**
   - Update branding and colors
   - Add your own product categories
   - Customize email templates

2. **Deploy to Production**
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md)
   - Set up production database
   - Configure environment variables

3. **Add Features**
   - Implement escrow contract
   - Add messaging system
   - Create admin dashboard

4. **Security Hardening**
   - Add authentication
   - Implement rate limiting
   - Set up monitoring

---

## 🎉 Success!

If you've made it this far, you should have:

- ✅ Backend API running on port 3001
- ✅ Frontend running on port 3000
- ✅ Database with seed data
- ✅ Wallet connection working
- ✅ Full marketplace functionality

**Happy building! 🚀**

---

## 📚 Additional Resources

- [Backend README](backend/README.md)
- [Marketplace README](MARKETPLACE_README.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Solana Documentation](https://docs.solana.com)
- [React Documentation](https://react.dev)

---

## 🆘 Need Help?

- Check the troubleshooting section above
- Review error messages carefully
- Check browser console for frontend issues
- Check terminal output for backend issues
- Open an issue on GitHub
