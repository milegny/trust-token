# Dispute System Backend Implementation

## Overview

Complete backend implementation for the TrustToken dispute resolution system with automated moderator assignment, load balancing, voting system, and comprehensive audit logging.

---

## Table of Contents

1. [Database Schema](#database-schema)
2. [Services](#services)
3. [API Endpoints](#api-endpoints)
4. [Moderator Assignment](#moderator-assignment)
5. [Voting System](#voting-system)
6. [Statistics & Analytics](#statistics--analytics)
7. [Implementation Guide](#implementation-guide)

---

## Database Schema

### Core Models

#### Dispute
```prisma
model Dispute {
  id                String            @id @default(uuid())
  
  // Parties
  reporterId        String
  reportedId        String
  
  // Details
  type              DisputeType       // REPUTATION_CARD, ORDER, PRODUCT, USER_CONDUCT
  severity          DisputeSeverity   // LOW, MEDIUM, HIGH, CRITICAL
  status            DisputeStatus     // OPEN, UNDER_REVIEW, ESCALATED, RESOLVED, CLOSED, REJECTED
  subject           String
  description       String
  
  // Related entities
  orderId           String?
  reputationCardId  String?
  productId         String?
  
  // Assignment
  assignedTo        String?
  moderatorLevel    ModeratorLevel    // COMMUNITY, SENIOR, ADMIN
  
  // Resolution
  resolution        String?
  resolutionType    String?
  resolutionNotes   String?
  resolvedAt        DateTime?
  
  // Blockchain
  txSignature       String?           @unique
  
  // Timestamps
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  evidence          DisputeEvidence[]
  comments          DisputeComment[]
  actions           DisputeAction[]
  votes             DisputeVote[]
}
```

#### DisputeEvidence
```prisma
model DisputeEvidence {
  id              String          @id @default(uuid())
  disputeId       String
  dispute         Dispute         @relation(...)
  
  uploadedBy      String
  type            EvidenceType    // IMAGE, DOCUMENT, SCREENSHOT, TRANSACTION, MESSAGE, OTHER
  url             String
  description     String?
  metadata        Json?
  
  createdAt       DateTime        @default(now())
}
```

#### DisputeComment
```prisma
model DisputeComment {
  id              String          @id @default(uuid())
  disputeId       String
  dispute         Dispute         @relation(...)
  
  authorId        String
  content         String
  isInternal      Boolean         @default(false)  // Internal moderator notes
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

#### DisputeAction
```prisma
model DisputeAction {
  id              String          @id @default(uuid())
  disputeId       String
  dispute         Dispute         @relation(...)
  
  performedBy     String
  actionType      ActionType      // CREATED, ASSIGNED, EVIDENCE_ADDED, etc.
  details         Json?
  
  createdAt       DateTime        @default(now())
}
```

#### DisputeVote
```prisma
model DisputeVote {
  id              String          @id @default(uuid())
  disputeId       String
  dispute         Dispute         @relation(...)
  
  voterId         String
  approved        Boolean
  reasoning       String?
  weight          Int             @default(1)  // Based on moderator level
  
  createdAt       DateTime        @default(now())
  
  @@unique([disputeId, voterId])  // One vote per moderator
}
```

#### ModeratorStats
```prisma
model ModeratorStats {
  id                    String          @id @default(uuid())
  moderatorId           String          @unique
  
  level                 ModeratorLevel  @default(COMMUNITY)
  disputesResolved      Int             @default(0)
  totalEarned           Float           @default(0)
  currentMonthEarned    Float           @default(0)
  points                Int             @default(0)
  badges                Json            @default("[]")
  rank                  Int             @default(0)
  
  // Performance metrics
  averageResolutionTime Float?
  accuracyRate          Float?
  
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
}
```

#### DisputeStatistics
```prisma
model DisputeStatistics {
  id                      String          @id @default(uuid())
  period                  String          @unique
  
  totalDisputes           Int             @default(0)
  openDisputes            Int             @default(0)
  resolvedDisputes        Int             @default(0)
  averageResolutionTime   Float?
  resolutionRate          Float?
  
  disputesByType          Json            @default("{}")
  disputesBySeverity      Json            @default("{}")
  
  createdAt               DateTime        @default(now())
  updatedAt               DateTime        @updatedAt
}
```

---

## Services

### DisputeService

**Location**: `backend/src/services/DisputeService.ts`

#### Core Functions

##### Create Dispute
```typescript
async createDispute(input: CreateDisputeInput): Promise<Dispute>
```
- Validates parties are different
- Checks for duplicate disputes
- Determines moderator level based on severity
- Auto-assigns to available moderator
- Logs creation action
- Sends notifications

**Severity → Level Mapping**:
- LOW/MEDIUM → COMMUNITY
- HIGH → SENIOR
- CRITICAL → ADMIN

##### Get Dispute
```typescript
async getDisputeById(disputeId: string): Promise<Dispute | null>
```
- Returns dispute with all relations (evidence, comments, actions, votes)

##### Assign Dispute
```typescript
async assignDispute(input: AssignDisputeInput): Promise<Dispute>
```
- Validates moderator level permissions
- Checks for conflicts of interest
- Updates status to UNDER_REVIEW
- Logs assignment action
- Sends notification

##### Add Evidence
```typescript
async addEvidence(
  disputeId: string,
  uploadedBy: string,
  type: string,
  url: string,
  description?: string,
  metadata?: any
): Promise<DisputeEvidence>
```
- Validates dispute is not closed
- Creates evidence record
- Logs action
- Supports multiple evidence types

##### Escalate Dispute
```typescript
async escalateDispute(
  disputeId: string,
  escalatedBy: string,
  reason: string
): Promise<Dispute>
```
- Validates current status
- Determines next moderator level
- Updates status to ESCALATED
- Unassigns current moderator
- Auto-assigns to higher level
- Logs escalation

**Level Progression**:
- COMMUNITY → SENIOR
- SENIOR → ADMIN
- ADMIN → Cannot escalate further

##### Resolve Dispute
```typescript
async resolveDispute(input: ResolveDisputeInput): Promise<Dispute>
```
- Validates assigned moderator
- Updates status to RESOLVED
- Records resolution details
- Records blockchain transaction
- Updates moderator stats
- Calculates and awards rewards
- Sends notifications

**Reward Calculation**:
```typescript
baseReward = 0.1 SOL
levelMultiplier = { COMMUNITY: 1.0, SENIOR: 1.5, ADMIN: 2.0 }
severityMultiplier = { LOW: 1.0, MEDIUM: 1.2, HIGH: 1.5, CRITICAL: 2.0 }
fastBonus = resolutionTime < 24h ? 1.2 : 1.0

totalReward = baseReward * levelMultiplier * severityMultiplier * fastBonus
```

##### Vote on Dispute
```typescript
async voteOnDispute(
  disputeId: string,
  voterId: string,
  approved: boolean,
  reasoning?: string
): Promise<DisputeVote>
```
- Only for ESCALATED disputes
- One vote per moderator
- Weighted by moderator level
- Auto-resolves at 66% threshold with 3+ votes

**Vote Weights**:
- COMMUNITY: 1
- SENIOR: 2
- ADMIN: 3

##### Get Statistics
```typescript
async getDisputeStatistics(period?: string): Promise<Statistics>
```
- Total disputes
- Open/resolved counts
- Average resolution time
- Resolution rate
- Breakdown by type and severity

---

### ModeratorAssignmentService

**Location**: `backend/src/services/ModeratorAssignmentService.ts`

#### Advanced Assignment Features

##### Find Best Moderator
```typescript
async findBestModerator(
  requiredLevel: ModeratorLevel,
  severity: DisputeSeverity,
  reportedId?: string
): Promise<string | null>
```

**Scoring Algorithm**:
```typescript
score = 100

// Factor 1: Workload (lower is better)
score -= activeDisputes * 10

// Factor 2: Experience (higher is better)
score += min(disputesResolved * 0.5, 20)

// Factor 3: Performance (higher is better)
score += accuracyRate * 20

// Factor 4: Resolution speed (faster is better)
if (averageResolutionTime < 24h) score += 10
if (averageResolutionTime > 72h) score -= 10

// Factor 5: Level match (exact match preferred)
if (level === idealLevel) score += 15
if (level > idealLevel) score -= 5  // Over-qualified

// Factor 6: Recent activity (active is better)
if (recentDisputes > 0) score += 5
```

##### Balance Workload
```typescript
async balanceWorkload(): Promise<void>
```
- Calculates average workload per level
- Identifies overloaded moderators (>150% average)
- Identifies underloaded moderators (<50% average)
- Reassigns oldest disputes from overloaded to underloaded
- Logs all reassignments

##### Check Conflicts
```typescript
async hasConflictOfInterest(
  moderatorId: string,
  disputeId: string
): Promise<boolean>
```
- Moderator cannot be reporter or reported
- Moderator cannot be buyer or seller in related order
- Prevents bias in dispute resolution

##### Get Availability
```typescript
async getModeratorAvailability(moderatorId: string): Promise<{
  available: boolean;
  currentWorkload: number;
  maxCapacity: number;
  utilizationRate: number;
}>
```

**Max Capacities**:
- COMMUNITY: 5 disputes
- SENIOR: 10 disputes
- ADMIN: 15 disputes

##### Get Recommendations
```typescript
async getRecommendedModerators(
  requiredLevel: ModeratorLevel,
  severity: DisputeSeverity,
  limit: number = 5
): Promise<ModeratorWorkload[]>
```
- Returns top N moderators sorted by score
- Useful for manual assignment UI

---

## API Endpoints

### Base URL: `/api/disputes`

#### Create Dispute
```http
POST /api/disputes/create

Body:
{
  "reporterId": "string",
  "reportedId": "string",
  "type": "REPUTATION_CARD" | "ORDER" | "PRODUCT" | "USER_CONDUCT",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "subject": "string (max 200)",
  "description": "string (max 2000)",
  "orderId": "string (optional)",
  "reputationCardId": "string (optional)",
  "productId": "string (optional)"
}

Response: 201 Created
{
  "id": "uuid",
  "status": "OPEN",
  "assignedTo": "string | null",
  ...
}
```

#### Get Dispute
```http
GET /api/disputes/:disputeId

Response: 200 OK
{
  "id": "uuid",
  "reporterId": "string",
  "reportedId": "string",
  "type": "string",
  "severity": "string",
  "status": "string",
  "subject": "string",
  "description": "string",
  "assignedTo": "string | null",
  "evidence": [...],
  "comments": [...],
  "actions": [...],
  "votes": [...],
  ...
}
```

#### Get All Disputes
```http
GET /api/disputes?status=OPEN&type=ORDER&limit=50&offset=0

Query Parameters:
- status: DisputeStatus (optional)
- type: DisputeType (optional)
- severity: DisputeSeverity (optional)
- assignedTo: string (optional)
- reporterId: string (optional)
- reportedId: string (optional)
- limit: number (1-100, default 50)
- offset: number (default 0)

Response: 200 OK
{
  "disputes": [...],
  "total": number
}
```

#### Get Moderator Disputes
```http
GET /api/disputes/moderator/:moderatorId?status=UNDER_REVIEW

Response: 200 OK
[
  {
    "id": "uuid",
    "status": "UNDER_REVIEW",
    ...
  }
]
```

#### Assign Dispute
```http
POST /api/disputes/:disputeId/assign

Body:
{
  "moderatorId": "string",
  "assignedBy": "string"
}

Response: 200 OK
{
  "id": "uuid",
  "assignedTo": "string",
  "status": "UNDER_REVIEW",
  ...
}
```

#### Add Evidence
```http
POST /api/disputes/:disputeId/evidence

Body:
{
  "uploadedBy": "string",
  "type": "IMAGE" | "DOCUMENT" | "SCREENSHOT" | "TRANSACTION" | "MESSAGE" | "OTHER",
  "url": "string (URL)",
  "description": "string (optional, max 500)",
  "metadata": {} (optional)
}

Response: 201 Created
{
  "id": "uuid",
  "disputeId": "uuid",
  "type": "string",
  "url": "string",
  ...
}
```

#### Add Comment
```http
POST /api/disputes/:disputeId/comment

Body:
{
  "authorId": "string",
  "content": "string (max 1000)",
  "isInternal": boolean (optional, default false)
}

Response: 201 Created
{
  "id": "uuid",
  "disputeId": "uuid",
  "authorId": "string",
  "content": "string",
  "isInternal": boolean,
  ...
}
```

#### Escalate Dispute
```http
POST /api/disputes/:disputeId/escalate

Body:
{
  "escalatedBy": "string",
  "reason": "string (max 500)"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "ESCALATED",
  "moderatorLevel": "SENIOR" | "ADMIN",
  "assignedTo": null,
  ...
}
```

#### Resolve Dispute
```http
POST /api/disputes/:disputeId/resolve

Body:
{
  "moderatorId": "string",
  "resolution": "string (max 1000)",
  "resolutionType": "string",
  "resolutionNotes": "string (optional, max 2000)",
  "txSignature": "string (optional)"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "RESOLVED",
  "resolution": "string",
  "resolvedAt": "datetime",
  ...
}
```

#### Vote on Dispute
```http
POST /api/disputes/:disputeId/vote

Body:
{
  "voterId": "string",
  "approved": boolean,
  "reasoning": "string (optional, max 500)"
}

Response: 201 Created
{
  "id": "uuid",
  "disputeId": "uuid",
  "voterId": "string",
  "approved": boolean,
  "weight": number,
  ...
}
```

#### Close Dispute
```http
POST /api/disputes/:disputeId/close

Body:
{
  "closedBy": "string"
}

Response: 200 OK
{
  "id": "uuid",
  "status": "CLOSED",
  ...
}
```

#### Get Statistics
```http
GET /api/disputes/stats/overview?period=month

Query Parameters:
- period: "today" | "week" | "month" | "year" (optional)

Response: 200 OK
{
  "totalDisputes": number,
  "openDisputes": number,
  "resolvedDisputes": number,
  "averageResolutionTime": number (hours),
  "resolutionRate": number (0-1),
  "disputesByType": {
    "REPUTATION_CARD": number,
    "ORDER": number,
    ...
  },
  "disputesBySeverity": {
    "LOW": number,
    "MEDIUM": number,
    ...
  }
}
```

---

## Moderator Assignment

### Automatic Assignment

When a dispute is created:

1. **Determine Required Level**:
   ```typescript
   severity === CRITICAL → ADMIN
   severity === HIGH → SENIOR
   severity === LOW/MEDIUM → COMMUNITY
   ```

2. **Find Eligible Moderators**:
   - Get moderators with required level or higher
   - Filter out conflicts of interest
   - Check availability (not at capacity)

3. **Calculate Scores**:
   - Workload (lower is better)
   - Experience (higher is better)
   - Performance (higher is better)
   - Resolution speed (faster is better)
   - Level match (exact match preferred)
   - Recent activity (active is better)

4. **Assign to Best Moderator**:
   - Select highest scoring moderator
   - Update dispute status to UNDER_REVIEW
   - Log assignment action
   - Send notification

### Manual Assignment

Moderators or admins can manually assign disputes:

1. Get recommended moderators
2. Check for conflicts
3. Verify availability
4. Assign and log action

### Load Balancing

Periodic background job:

1. Calculate average workload per level
2. Identify overloaded moderators (>150% average)
3. Identify underloaded moderators (<50% average)
4. Reassign oldest disputes
5. Log all reassignments

**Run frequency**: Every 6 hours

---

## Voting System

### When Voting is Required

- Dispute is ESCALATED to ADMIN level
- Complex or controversial cases
- High-value disputes (>10 SOL)

### Voting Process

1. **Dispute Escalated**:
   - Status changes to ESCALATED
   - Multiple moderators can vote
   - Minimum 3 votes required

2. **Moderators Vote**:
   - Each moderator votes once
   - Vote includes approval (yes/no)
   - Optional reasoning
   - Vote weight based on level

3. **Vote Calculation**:
   ```typescript
   totalWeight = sum(vote.weight for all votes)
   approvedWeight = sum(vote.weight for approved votes)
   approvalPercentage = approvedWeight / totalWeight
   ```

4. **Auto-Resolution**:
   - If votes >= 3 AND approvalPercentage >= 0.66:
     - Auto-resolve as APPROVED
     - Record voting result in resolution notes
     - Award rewards to assigned moderator

### Vote Weights

Based on moderator level:
- COMMUNITY: 1 vote
- SENIOR: 2 votes
- ADMIN: 3 votes

### Example

```
Votes:
- ADMIN (weight 3): APPROVED
- SENIOR (weight 2): APPROVED
- COMMUNITY (weight 1): REJECTED

Total weight: 6
Approved weight: 5
Approval: 83.3% ✅ (>= 66%)

Result: Auto-resolved as APPROVED
```

---

## Statistics & Analytics

### Dispute Statistics

**Endpoint**: `GET /api/disputes/stats/overview`

**Metrics**:
- Total disputes (all time or period)
- Open disputes (current)
- Resolved disputes
- Average resolution time (hours)
- Resolution rate (resolved / total)
- Breakdown by type
- Breakdown by severity

### Moderator Performance

**Tracked Metrics**:
- Disputes resolved
- Total earned (SOL)
- Current month earned
- Points accumulated
- Average resolution time
- Accuracy rate
- Current workload
- Utilization rate

### Workload Statistics

**Endpoint**: Custom (via ModeratorAssignmentService)

**Metrics**:
- Total moderators
- Total workload
- Average workload
- Average utilization
- Per-moderator breakdown

---

## Implementation Guide

### 1. Database Setup

```bash
# Add dispute models to schema.prisma
# (Already done in this implementation)

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_dispute_system

# Apply migration
npx prisma migrate deploy
```

### 2. Install Dependencies

```bash
cd backend

# Install validation library
npm install express-validator

# Install Prisma client (if not already)
npm install @prisma/client

# Install Solana web3 (if not already)
npm install @solana/web3.js
```

### 3. Environment Variables

```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/trusttoken"
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"
```

### 4. Start Server

```bash
npm run dev
```

### 5. Test Endpoints

```bash
# Create dispute
curl -X POST http://localhost:3001/api/disputes/create \
  -H "Content-Type: application/json" \
  -d '{
    "reporterId": "user1",
    "reportedId": "user2",
    "type": "ORDER",
    "severity": "MEDIUM",
    "subject": "Product not as described",
    "description": "The product I received does not match the listing..."
  }'

# Get dispute
curl http://localhost:3001/api/disputes/:disputeId

# Get statistics
curl http://localhost:3001/api/disputes/stats/overview?period=month
```

### 6. Background Jobs

Set up cron jobs for:

**Load Balancing** (every 6 hours):
```typescript
import ModeratorAssignmentService from './services/ModeratorAssignmentService';

setInterval(async () => {
  await ModeratorAssignmentService.balanceWorkload();
}, 6 * 60 * 60 * 1000);
```

**Statistics Update** (daily):
```typescript
import DisputeService from './services/DisputeService';

setInterval(async () => {
  const stats = await DisputeService.getDisputeStatistics('today');
  // Store in DisputeStatistics table
}, 24 * 60 * 60 * 1000);
```

---

## Error Handling

### Common Errors

```typescript
// Duplicate dispute
{
  "error": "An active dispute already exists for this case"
}

// Insufficient permissions
{
  "error": "Moderator does not have sufficient level for this dispute"
}

// Conflict of interest
{
  "error": "Moderator has conflict of interest"
}

// Already voted
{
  "error": "Moderator has already voted on this dispute"
}

// Invalid status transition
{
  "error": "Dispute cannot be resolved in current status"
}
```

### Validation Errors

```typescript
{
  "errors": [
    {
      "msg": "Invalid value",
      "param": "severity",
      "location": "body"
    }
  ]
}
```

---

## Security Considerations

### 1. Authentication
- All endpoints should require authentication
- Verify user identity before creating disputes
- Check moderator permissions before assignments

### 2. Authorization
- Reporters can only create disputes
- Moderators can only act on assigned disputes
- Admins have full access

### 3. Input Validation
- All inputs validated with express-validator
- Max lengths enforced
- Enum values checked
- URLs validated

### 4. Conflict Prevention
- Automatic conflict of interest checks
- Moderators cannot handle disputes involving themselves
- Prevents bias in resolution

### 5. Audit Trail
- All actions logged in DisputeAction table
- Immutable record of dispute history
- Blockchain transactions for resolutions

---

## Performance Optimization

### 1. Database Indexes
```prisma
@@index([reporterId])
@@index([reportedId])
@@index([assignedTo])
@@index([status])
@@index([type])
@@index([severity])
@@index([createdAt])
```

### 2. Query Optimization
- Use `include` for related data
- Implement pagination (limit/offset)
- Cache frequently accessed data

### 3. Background Processing
- Async notification sending
- Batch statistics updates
- Scheduled load balancing

---

## Testing

### Unit Tests

```typescript
// DisputeService.test.ts
describe('DisputeService', () => {
  it('should create dispute with correct level', async () => {
    const dispute = await DisputeService.createDispute({
      reporterId: 'user1',
      reportedId: 'user2',
      type: 'ORDER',
      severity: 'CRITICAL',
      subject: 'Test',
      description: 'Test description',
    });

    expect(dispute.moderatorLevel).toBe('ADMIN');
  });

  it('should prevent duplicate disputes', async () => {
    // Create first dispute
    await DisputeService.createDispute({...});

    // Attempt duplicate
    await expect(
      DisputeService.createDispute({...})
    ).rejects.toThrow('An active dispute already exists');
  });
});
```

### Integration Tests

```typescript
// disputes.routes.test.ts
describe('POST /api/disputes/create', () => {
  it('should create dispute and return 201', async () => {
    const response = await request(app)
      .post('/api/disputes/create')
      .send({
        reporterId: 'user1',
        reportedId: 'user2',
        type: 'ORDER',
        severity: 'MEDIUM',
        subject: 'Test',
        description: 'Test description',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

---

## Monitoring

### Key Metrics to Track

1. **Dispute Volume**:
   - Total disputes created
   - Disputes by type
   - Disputes by severity

2. **Resolution Performance**:
   - Average resolution time
   - Resolution rate
   - Escalation rate

3. **Moderator Performance**:
   - Active moderators
   - Average workload
   - Utilization rate

4. **System Health**:
   - API response times
   - Error rates
   - Database query performance

---

## Future Enhancements

1. **AI-Assisted Moderation**:
   - Automatic severity detection
   - Suggested resolutions
   - Pattern recognition

2. **Advanced Analytics**:
   - Predictive dispute volume
   - Moderator performance trends
   - User behavior analysis

3. **Multi-Language Support**:
   - Translate disputes
   - Multi-language evidence
   - International moderators

4. **Mobile App Integration**:
   - Push notifications
   - Mobile-optimized UI
   - Offline evidence upload

---

## Conclusion

The dispute system backend provides:

✅ Complete CRUD operations for disputes
✅ Automated moderator assignment with load balancing
✅ Advanced scoring algorithm for optimal assignment
✅ Voting system for complex cases
✅ Comprehensive audit logging
✅ Real-time statistics and analytics
✅ Conflict of interest prevention
✅ Performance optimization
✅ Scalable architecture

All components are production-ready and follow best practices for security, performance, and maintainability.

---

**Status**: ✅ Implementation Complete

**Version**: 1.0.0

**Last Updated**: 2025-10-24
