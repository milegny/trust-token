# Deployment Guide for The Bit Central Marketplace

This guide covers deploying both the backend API and frontend application.

---

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Vercel account (for deployment)
- Solana wallet with devnet SOL
- Git repository

---

## 🗄️ Database Setup

### Local PostgreSQL

1. Install PostgreSQL:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

2. Create database:
```bash
createdb bitcentral
```

3. Set DATABASE_URL in backend/.env:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bitcentral?schema=public"
```

### Cloud PostgreSQL (Recommended for Production)

**Option 1: Neon (Serverless PostgreSQL)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to backend/.env

**Option 2: Supabase**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" for serverless)
5. Add to backend/.env

**Option 3: Railway**
1. Sign up at [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Add to backend/.env

---

## 🚀 Backend Deployment

### Local Development

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://..."
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
TRUST_TOKEN_PROGRAM_ID=3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju
CORS_ORIGIN=http://localhost:3000
```

5. Run Prisma migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. Seed the database (optional):
```bash
npm run prisma:seed
```

7. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy backend:
```bash
cd backend
vercel
```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from .env

5. Add build command in Vercel:
   - Build Command: `npm run build && npx prisma generate`
   - Output Directory: `dist`

6. Deploy:
```bash
vercel --prod
```

### Alternative: Railway Deployment

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Initialize project:
```bash
cd backend
railway init
```

4. Add environment variables:
```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set SOLANA_RPC_URL="https://api.devnet.solana.com"
# ... add all other variables
```

5. Deploy:
```bash
railway up
```

---

## 🎨 Frontend Deployment

### Local Development

1. Navigate to app directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
REACT_APP_TRUST_TOKEN_PROGRAM_ID=3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju
```

5. Start development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

### Production Deployment (Vercel)

1. Build the app:
```bash
npm run build
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `REACT_APP_API_URL`: Your backend API URL
   - `REACT_APP_SOLANA_NETWORK`: devnet or mainnet-beta
   - `REACT_APP_SOLANA_RPC_URL`: Your Solana RPC endpoint
   - `REACT_APP_TRUST_TOKEN_PROGRAM_ID`: Your program ID

4. Deploy to production:
```bash
vercel --prod
```

### Alternative: Netlify Deployment

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login:
```bash
netlify login
```

3. Initialize:
```bash
netlify init
```

4. Build and deploy:
```bash
npm run build
netlify deploy --prod --dir=build
```

---

## 🔧 Configuration

### CORS Configuration

Update backend CORS settings for production:

```typescript
// backend/src/server.ts
app.use(cors({
  origin: [
    'https://your-frontend-domain.vercel.app',
    'http://localhost:3000', // for local development
  ],
  credentials: true,
}));
```

### Database Migrations

Run migrations in production:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Or set up automatic migrations in package.json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && npm run build"
  }
}
```

---

## 📊 Monitoring & Logs

### Backend Logs (Vercel)

```bash
vercel logs [deployment-url]
```

### Frontend Logs (Vercel)

```bash
vercel logs [deployment-url]
```

### Database Monitoring

Use Prisma Studio:
```bash
npx prisma studio
```

---

## 🔐 Security Checklist

- [ ] Set strong database passwords
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Use prepared statements (Prisma does this automatically)
- [ ] Validate all user inputs
- [ ] Implement authentication/authorization
- [ ] Regular security updates

---

## 🧪 Testing Deployment

### Backend Health Check

```bash
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "uptime": 123.456
}
```

### Frontend Test

1. Open your deployed frontend URL
2. Connect wallet
3. Browse products
4. Add items to cart
5. Test checkout flow

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (development only!)
npx prisma migrate reset
```

### Build Failures

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### CORS Errors

- Check CORS_ORIGIN in backend .env
- Verify frontend URL matches CORS configuration
- Check browser console for specific error

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Check schema
npx prisma validate
```

---

## 📈 Scaling Considerations

### Database

- Use connection pooling (PgBouncer)
- Enable read replicas for heavy read workloads
- Implement caching (Redis)
- Regular backups

### Backend

- Use serverless functions (Vercel automatically handles this)
- Implement rate limiting
- Add CDN for static assets
- Monitor performance with APM tools

### Frontend

- Enable CDN (automatic with Vercel)
- Optimize images
- Code splitting
- Lazy loading

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Deploy to Vercel
        run: |
          cd backend
          npm install -g vercel
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Deploy to Vercel
        run: |
          cd app
          npm install -g vercel
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Solana Documentation](https://docs.solana.com)
- [React Documentation](https://react.dev)

---

## 🆘 Support

If you encounter issues:

1. Check the logs: `vercel logs`
2. Review environment variables
3. Test locally first
4. Check database connectivity
5. Verify Solana RPC endpoint

---

## 🎉 Success!

Your marketplace should now be live! Test all features:

- ✅ Product browsing
- ✅ Wallet connection
- ✅ Shopping cart
- ✅ Order creation
- ✅ User profiles
- ✅ Reviews and recommendations
- ✅ TrustToken verification

Happy selling! 🚀
