-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "trustTokenMint" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "reputationScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SOL',
    "category" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SOL',
    "shippingAddress" TEXT,
    "trackingNumber" TEXT,
    "txSignature" TEXT,
    "escrowAccount" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issuerId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "txSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    CONSTRAINT "Recommendation_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recommendation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrustToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "mintedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    "txSignature" TEXT
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderId" TEXT,
    "reputationCardId" TEXT,
    "productId" TEXT,
    "assignedTo" TEXT,
    "moderatorLevel" TEXT NOT NULL DEFAULT 'COMMUNITY',
    "resolution" TEXT,
    "resolutionType" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" DATETIME,
    "txSignature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DisputeEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisputeEvidence_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisputeComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DisputeComment_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisputeAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisputeAction_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisputeVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "disputeId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "reasoning" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisputeVote_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "Dispute" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModeratorStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moderatorId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'COMMUNITY',
    "disputesResolved" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" REAL NOT NULL DEFAULT 0,
    "currentMonthEarned" REAL NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "badges" JSONB NOT NULL DEFAULT [],
    "rank" INTEGER NOT NULL DEFAULT 0,
    "averageResolutionTime" REAL,
    "accuracyRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DisputeStatistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "totalDisputes" INTEGER NOT NULL DEFAULT 0,
    "openDisputes" INTEGER NOT NULL DEFAULT 0,
    "resolvedDisputes" INTEGER NOT NULL DEFAULT 0,
    "averageResolutionTime" REAL,
    "resolutionRate" REAL,
    "disputesByType" JSONB NOT NULL DEFAULT {},
    "disputesBySeverity" JSONB NOT NULL DEFAULT {},
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_trustTokenMint_key" ON "User"("trustTokenMint");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_trustTokenMint_idx" ON "User"("trustTokenMint");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Order_txSignature_key" ON "Order"("txSignature");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_sellerId_idx" ON "Order"("sellerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_txSignature_idx" ON "Order"("txSignature");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_revieweeId_idx" ON "Review"("revieweeId");

-- CreateIndex
CREATE INDEX "Review_orderId_idx" ON "Review"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_txSignature_key" ON "Recommendation"("txSignature");

-- CreateIndex
CREATE INDEX "Recommendation_issuerId_idx" ON "Recommendation"("issuerId");

-- CreateIndex
CREATE INDEX "Recommendation_recipientId_idx" ON "Recommendation"("recipientId");

-- CreateIndex
CREATE INDEX "Recommendation_isActive_idx" ON "Recommendation"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TrustToken_userId_key" ON "TrustToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustToken_mintAddress_key" ON "TrustToken"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "TrustToken_txSignature_key" ON "TrustToken"("txSignature");

-- CreateIndex
CREATE INDEX "TrustToken_mintAddress_idx" ON "TrustToken"("mintAddress");

-- CreateIndex
CREATE INDEX "TrustToken_userId_idx" ON "TrustToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_txSignature_key" ON "Dispute"("txSignature");

-- CreateIndex
CREATE INDEX "Dispute_reporterId_idx" ON "Dispute"("reporterId");

-- CreateIndex
CREATE INDEX "Dispute_reportedId_idx" ON "Dispute"("reportedId");

-- CreateIndex
CREATE INDEX "Dispute_assignedTo_idx" ON "Dispute"("assignedTo");

-- CreateIndex
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- CreateIndex
CREATE INDEX "Dispute_type_idx" ON "Dispute"("type");

-- CreateIndex
CREATE INDEX "Dispute_severity_idx" ON "Dispute"("severity");

-- CreateIndex
CREATE INDEX "Dispute_createdAt_idx" ON "Dispute"("createdAt");

-- CreateIndex
CREATE INDEX "DisputeEvidence_disputeId_idx" ON "DisputeEvidence"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeEvidence_uploadedBy_idx" ON "DisputeEvidence"("uploadedBy");

-- CreateIndex
CREATE INDEX "DisputeComment_disputeId_idx" ON "DisputeComment"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeComment_authorId_idx" ON "DisputeComment"("authorId");

-- CreateIndex
CREATE INDEX "DisputeAction_disputeId_idx" ON "DisputeAction"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeAction_performedBy_idx" ON "DisputeAction"("performedBy");

-- CreateIndex
CREATE INDEX "DisputeAction_actionType_idx" ON "DisputeAction"("actionType");

-- CreateIndex
CREATE INDEX "DisputeVote_disputeId_idx" ON "DisputeVote"("disputeId");

-- CreateIndex
CREATE INDEX "DisputeVote_voterId_idx" ON "DisputeVote"("voterId");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeVote_disputeId_voterId_key" ON "DisputeVote"("disputeId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "ModeratorStats_moderatorId_key" ON "ModeratorStats"("moderatorId");

-- CreateIndex
CREATE INDEX "ModeratorStats_moderatorId_idx" ON "ModeratorStats"("moderatorId");

-- CreateIndex
CREATE INDEX "ModeratorStats_level_idx" ON "ModeratorStats"("level");

-- CreateIndex
CREATE INDEX "ModeratorStats_rank_idx" ON "ModeratorStats"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "DisputeStatistics_period_key" ON "DisputeStatistics"("period");

-- CreateIndex
CREATE INDEX "DisputeStatistics_period_idx" ON "DisputeStatistics"("period");
