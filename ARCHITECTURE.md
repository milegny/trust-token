# 🏗️ System Architecture - The Bit Central Marketplace

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         The Bit Central System                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                  │         │                  │         │              │
│   Web Browser    │◄───────►│   React App      │◄───────►│   Backend    │
│   (User)         │  HTTPS  │   (Frontend)     │  REST   │   API        │
│                  │         │                  │  API    │   (Express)  │
└──────────────────┘         └──────────────────┘         └──────────────┘
        │                            │                            │
        │                            │                            │
        ▼                            ▼                            ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│                  │         │                  │         │              │
│  Phantom Wallet  │         │  Local Storage   │         │  PostgreSQL  │
│  (Solana)        │         │  (Cart State)    │         │  Database    │
│                  │         │                  │         │              │
└──────────────────┘         └──────────────────┘         └──────────────┘
        │                                                         │
        │                                                         │
        ▼                                                         ▼
┌──────────────────┐                                     ┌──────────────┐
│                  │                                     │              │
│  Solana Devnet   │◄────────────────────────────────────│   Prisma     │
│  (Blockchain)    │         Verification                │   ORM        │
│                  │                                     │              │
└──────────────────┘                                     └──────────────┘
        │
        │
        ▼
┌──────────────────┐
│                  │
│  TrustToken      │
│  Program         │
│  (Smart Contract)│
│                  │
└──────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. User Registration & Verification Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Connect Wallet
     ▼
┌─────────────────┐
│  Phantom Wallet │
└────┬────────────┘
     │
     │ 2. Sign Connection
     ▼
┌─────────────────┐
│  Frontend       │
└────┬────────────┘
     │
     │ 3. POST /api/users
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 4. Create User Record
     ▼
┌─────────────────┐
│  Database       │
└────┬────────────┘
     │
     │ 5. User wants to sell
     ▼
┌─────────────────┐
│  Mint TrustToken│
└────┬────────────┘
     │
     │ 6. Call mint instruction
     ▼
┌─────────────────┐
│  Solana Program │
└────┬────────────┘
     │
     │ 7. Mint NFT
     ▼
┌─────────────────┐
│  Blockchain     │
└────┬────────────┘
     │
     │ 8. POST /api/trusttoken/record-mint
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 9. Update User.isVerified = true
     ▼
┌─────────────────┐
│  Database       │
└─────────────────┘
```

### 2. Product Listing Flow

```
┌─────────┐
│ Seller  │
└────┬────┘
     │
     │ 1. Create Product Form
     ▼
┌─────────────────┐
│  Frontend       │
└────┬────────────┘
     │
     │ 2. POST /api/products
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 3. Check seller.isVerified
     ▼
┌─────────────────┐
│  Database       │
└────┬────────────┘
     │
     │ 4. If verified, create product
     ▼
┌─────────────────┐
│  Product Table  │
└────┬────────────┘
     │
     │ 5. Return product data
     ▼
┌─────────────────┐
│  Frontend       │
└────┬────────────┘
     │
     │ 6. Display success
     ▼
┌─────────┐
│ Seller  │
└─────────┘
```

### 3. Purchase Flow

```
┌─────────┐
│  Buyer  │
└────┬────┘
     │
     │ 1. Browse Products
     ▼
┌─────────────────┐
│  Product List   │
└────┬────────────┘
     │
     │ 2. Add to Cart
     ▼
┌─────────────────┐
│  Cart Context   │
└────┬────────────┘
     │
     │ 3. Save to localStorage
     ▼
┌─────────────────┐
│  Local Storage  │
└────┬────────────┘
     │
     │ 4. Checkout
     ▼
┌─────────────────┐
│  Cart Page      │
└────┬────────────┘
     │
     │ 5. Enter shipping address
     ▼
┌─────────────────┐
│  Frontend       │
└────┬────────────┘
     │
     │ 6. POST /api/orders
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 7. Check stock
     ▼
┌─────────────────┐
│  Product Table  │
└────┬────────────┘
     │
     │ 8. Create order & items
     ▼
┌─────────────────┐
│  Order Table    │
└────┬────────────┘
     │
     │ 9. Decrement stock
     ▼
┌─────────────────┐
│  Product Table  │
└────┬────────────┘
     │
     │ 10. Return order
     ▼
┌─────────────────┐
│  Frontend       │
└────┬────────────┘
     │
     │ 11. Clear cart
     ▼
┌─────────┐
│  Buyer  │
└─────────┘
```

### 4. Order Fulfillment Flow

```
┌─────────┐
│ Seller  │
└────┬────┘
     │
     │ 1. View Orders
     ▼
┌─────────────────┐
│  Frontend       │
└────┬────────────┘
     │
     │ 2. GET /api/orders/user/:userId?role=seller
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 3. Fetch orders
     ▼
┌─────────────────┐
│  Order Table    │
└────┬────────────┘
     │
     │ 4. Display orders
     ▼
┌─────────────────┐
│  Frontend       │
└────┬────────────┘
     │
     │ 5. Update status to SHIPPED
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 6. PATCH /api/orders/:id/status
     ▼
┌─────────────────┐
│  Order Table    │
└────┬────────────┘
     │
     │ 7. Set shippedAt timestamp
     ▼
┌─────────────────┐
│  Database       │
└────┬────────────┘
     │
     │ 8. Notify buyer (future)
     ▼
┌─────────┐
│  Buyer  │
└─────────┘
```

### 5. Review & Reputation Flow

```
┌─────────┐
│  Buyer  │
└────┬────┘
     │
     │ 1. Order completed
     ▼
┌─────────────────┐
│  Frontend       │
└────┬────────────┘
     │
     │ 2. Leave Review
     ▼
┌─────────────────┐
│  Review Form    │
└────┬────────────┘
     │
     │ 3. POST /api/reviews
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 4. Verify order.status = COMPLETED
     ▼
┌─────────────────┐
│  Order Table    │
└────┬────────────┘
     │
     │ 5. Create review
     ▼
┌─────────────────┐
│  Review Table   │
└────┬────────────┘
     │
     │ 6. Calculate avg rating
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 7. Update seller.reputationScore
     ▼
┌─────────────────┐
│  User Table     │
└────┬────────────┘
     │
     │ 8. Display updated reputation
     ▼
┌─────────┐
│ Seller  │
└─────────┘
```

---

## 🗄️ Database Schema Relationships

```
┌──────────────────┐
│      User        │
│──────────────────│
│ id (PK)          │◄──────────┐
│ walletAddress    │           │
│ trustTokenMint   │           │
│ isVerified       │           │
│ reputationScore  │           │
└──────────────────┘           │
        │                      │
        │ 1:N                  │
        ▼                      │
┌──────────────────┐           │
│    Product       │           │
│──────────────────│           │
│ id (PK)          │           │
│ sellerId (FK)    │───────────┘
│ name             │
│ price            │
│ stock            │
└──────────────────┘
        │
        │ N:M (via OrderItem)
        ▼
┌──────────────────┐
│    OrderItem     │
│──────────────────│
│ id (PK)          │
│ orderId (FK)     │───────────┐
│ productId (FK)   │           │
│ quantity         │           │
└──────────────────┘           │
                               │
                               ▼
┌──────────────────┐     ┌──────────────────┐
│      Order       │     │      Review      │
│──────────────────│     │──────────────────│
│ id (PK)          │◄────│ orderId (FK)     │
│ buyerId (FK)     │     │ reviewerId (FK)  │
│ sellerId (FK)    │     │ revieweeId (FK)  │
│ status           │     │ rating           │
│ totalAmount      │     └──────────────────┘
└──────────────────┘
        │
        │ N:1
        ▼
┌──────────────────┐
│      User        │
│──────────────────│
│ (buyer/seller)   │
└──────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│ Recommendation   │
│──────────────────│
│ id (PK)          │
│ issuerId (FK)    │
│ recipientId (FK) │
│ type             │
│ isActive         │
└──────────────────┘

┌──────────────────┐
│   TrustToken     │
│──────────────────│
│ id (PK)          │
│ userId (FK)      │───────────┐
│ mintAddress      │           │
│ isVerified       │           │
└──────────────────┘           │
                               │ 1:1
                               ▼
                        ┌──────────────────┐
                        │      User        │
                        │──────────────────│
                        │ trustTokenMint   │
                        └──────────────────┘
```

---

## 🔌 API Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Express Server                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Helmet     │  │     CORS     │  │    Morgan    │      │
│  │  (Security)  │  │  (Cross-Org) │  │  (Logging)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Request Validation                       │   │
│  │              (express-validator)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Route Handlers                      │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  /api/users          │  User management              │   │
│  │  /api/products       │  Product CRUD                 │   │
│  │  /api/orders         │  Order management             │   │
│  │  /api/reviews        │  Review system                │   │
│  │  /api/recommendations│  Reputation cards             │   │
│  │  /api/trusttoken     │  TrustToken ops               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Service Layer                        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Solana Service  │  Blockchain interaction           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Data Layer                           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Prisma Client   │  ORM & Query Builder              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Error Handler                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   Database       │
                    └──────────────────┘
```

---

## 🎨 Frontend Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              WalletProvider                           │   │
│  │              (Solana Wallet Adapter)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CartProvider                             │   │
│  │              (Shopping Cart Context)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Router                                   │   │
│  │              (React Router)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│         ┌────────────────────┼────────────────────┐         │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Product    │    │  Product    │    │    Cart     │    │
│  │  List       │    │  Detail     │    │    Page     │    │
│  │  Page       │    │  Page       │    │             │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│         │                    │                    │         │
│         └────────────────────┼────────────────────┘         │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Service Layer                        │   │
│  │              (Axios HTTP Client)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │   Backend API    │
                    └──────────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Network Security                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • HTTPS/TLS encryption                              │   │
│  │  • CORS configuration                                │   │
│  │  • Helmet.js security headers                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Layer 2: Input Validation                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • express-validator                                 │   │
│  │  • Type checking (TypeScript)                        │   │
│  │  • Sanitization                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Layer 3: Database Security                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Prisma ORM (SQL injection prevention)             │   │
│  │  • Prepared statements                               │   │
│  │  • Connection pooling                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Layer 4: Blockchain Security                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Wallet signature verification                     │   │
│  │  • On-chain verification                             │   │
│  │  • PDA-based access control                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Layer 5: Application Security                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Environment variables                             │   │
│  │  • Error handling                                    │   │
│  │  • Logging & monitoring                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   Vercel CDN     │         │   Vercel CDN     │          │
│  │   (Frontend)     │         │   (Backend)      │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  React App       │         │  Express API     │          │
│  │  (Static)        │◄────────│  (Serverless)    │          │
│  └──────────────────┘  REST   └────────┬─────────┘          │
│                                         │                     │
│                                         ▼                     │
│                              ┌──────────────────┐            │
│                              │  PostgreSQL      │            │
│                              │  (Neon/Supabase) │            │
│                              └────────┬─────────┘            │
│                                       │                       │
│                                       ▼                       │
│                              ┌──────────────────┐            │
│                              │  Prisma Client   │            │
│                              └──────────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │  Solana Devnet       │
                    │  (Blockchain)        │
                    └──────────────────────┘
```

---

## 📊 Performance Considerations

### Backend Optimizations
- **Database Indexing**: Indexes on frequently queried fields
- **Connection Pooling**: Prisma connection pooling
- **Query Optimization**: Efficient Prisma queries with includes
- **Caching**: (Future) Redis for frequently accessed data

### Frontend Optimizations
- **Code Splitting**: React lazy loading
- **Asset Optimization**: Image optimization
- **Local Storage**: Cart persistence
- **CDN**: Static asset delivery via Vercel

### Blockchain Optimizations
- **RPC Caching**: Cache blockchain queries
- **Batch Requests**: Batch multiple RPC calls
- **Connection Reuse**: Persistent RPC connections

---

## 🔄 State Management

### Frontend State
```
┌─────────────────────────────────────────┐
│         Application State                │
├─────────────────────────────────────────┤
│                                          │
│  Global State (Context)                  │
│  ├── WalletContext                       │
│  │   ├── publicKey                       │
│  │   ├── connected                       │
│  │   └── signTransaction                 │
│  │                                        │
│  └── CartContext                         │
│      ├── cart[]                          │
│      ├── addToCart()                     │
│      ├── removeFromCart()                │
│      └── getTotalPrice()                 │
│                                          │
│  Component State (useState)              │
│  ├── Loading states                      │
│  ├── Error states                        │
│  ├── Form data                           │
│  └── UI state                            │
│                                          │
│  Local Storage                           │
│  └── cart (persisted)                    │
│                                          │
└─────────────────────────────────────────┘
```

### Backend State
```
┌─────────────────────────────────────────┐
│         Backend State                    │
├─────────────────────────────────────────┤
│                                          │
│  Database (PostgreSQL)                   │
│  ├── Users                               │
│  ├── Products                            │
│  ├── Orders                              │
│  ├── Reviews                             │
│  ├── Recommendations                     │
│  └── TrustTokens                         │
│                                          │
│  Blockchain (Solana)                     │
│  ├── TrustToken NFTs                     │
│  ├── Program State                       │
│  └── Transaction History                 │
│                                          │
└─────────────────────────────────────────┘
```

---

## 🎯 Summary

This architecture provides:

- **Separation of Concerns**: Clear boundaries between layers
- **Scalability**: Serverless backend, CDN frontend
- **Security**: Multiple security layers
- **Performance**: Optimized queries and caching
- **Maintainability**: Clean code structure
- **Extensibility**: Easy to add new features

The system is designed to be:
- **Reliable**: Error handling at every layer
- **Fast**: Optimized queries and caching
- **Secure**: Multiple security measures
- **Scalable**: Serverless architecture
- **Maintainable**: Clear structure and documentation
