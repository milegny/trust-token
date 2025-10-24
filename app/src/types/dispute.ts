/**
 * Dispute System Types
 * Comprehensive type definitions for the moderation and dispute system
 */

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export enum DisputeType {
  REPUTATION_CARD = 'REPUTATION_CARD',
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  USER_CONDUCT = 'USER_CONDUCT',
}

export enum DisputeResolution {
  CARD_REVOKED = 'CARD_REVOKED',
  CARD_SUSPENDED = 'CARD_SUSPENDED',
  CARD_UPHELD = 'CARD_UPHELD',
  REFUND_ISSUED = 'REFUND_ISSUED',
  WARNING_ISSUED = 'WARNING_ISSUED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  NO_ACTION = 'NO_ACTION',
}

export enum ModeratorLevel {
  COMMUNITY = 1,
  SENIOR = 2,
  ADMIN = 3,
}

export enum EvidenceType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TRANSACTION = 'TRANSACTION',
  SCREENSHOT = 'SCREENSHOT',
  CHAT_LOG = 'CHAT_LOG',
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  content: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

export interface DisputeComment {
  id: string;
  disputeId: string;
  authorId: string;
  author: {
    id: string;
    username?: string;
    walletAddress: string;
    moderatorLevel?: ModeratorLevel;
  };
  content: string;
  isInternal: boolean; // Only visible to moderators
  createdAt: string;
}

export interface DisputeAction {
  id: string;
  disputeId: string;
  moderatorId: string;
  moderator: {
    id: string;
    username?: string;
    walletAddress: string;
    moderatorLevel: ModeratorLevel;
  };
  action: string;
  previousStatus: DisputeStatus;
  newStatus: DisputeStatus;
  notes?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  type: DisputeType;
  status: DisputeStatus;
  
  // Parties involved
  reporterId: string;
  reporter: {
    id: string;
    username?: string;
    walletAddress: string;
    reputationScore: number;
  };
  
  reportedId: string;
  reported: {
    id: string;
    username?: string;
    walletAddress: string;
    reputationScore: number;
  };
  
  // Dispute details
  subject: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Related entities
  reputationCardId?: string;
  reputationCard?: {
    cardType: string;
    rating: number;
    message: string;
    issuedAt: string;
  };
  
  orderId?: string;
  productId?: string;
  
  // Evidence
  evidence: Evidence[];
  
  // Moderation
  assignedModeratorId?: string;
  assignedModerator?: {
    id: string;
    username?: string;
    walletAddress: string;
    moderatorLevel: ModeratorLevel;
  };
  
  moderatorLevel: ModeratorLevel;
  
  // Resolution
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  
  // Blockchain
  txSignature?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Actions and comments
  actions: DisputeAction[];
  comments: DisputeComment[];
}

export interface ModeratorStats {
  userId: string;
  moderatorLevel: ModeratorLevel;
  
  // Performance metrics
  totalDisputes: number;
  resolvedDisputes: number;
  averageResolutionTime: number; // in hours
  
  // Quality metrics
  accuracyRate: number; // percentage
  appealRate: number; // percentage
  overturnRate: number; // percentage
  
  // Activity
  activeDisputes: number;
  disputesThisWeek: number;
  disputesThisMonth: number;
  
  // Gamification
  points: number;
  badges: ModeratorBadge[];
  rank: number;
  
  // Timestamps
  joinedAt: string;
  lastActiveAt: string;
}

export interface ModeratorBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  earnedAt: string;
  criteria: {
    type: string;
    threshold: number;
  };
}

export interface DisputeFilters {
  status?: DisputeStatus[];
  type?: DisputeType[];
  severity?: string[];
  moderatorLevel?: ModeratorLevel[];
  assignedToMe?: boolean;
  unassigned?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DisputeMetrics {
  total: number;
  open: number;
  underReview: number;
  escalated: number;
  resolved: number;
  closed: number;
  
  averageResolutionTime: number;
  resolutionRate: number;
  
  byType: Record<DisputeType, number>;
  bySeverity: Record<string, number>;
  byModerator: Array<{
    moderatorId: string;
    moderatorName: string;
    count: number;
  }>;
}

export interface EscalationRequest {
  disputeId: string;
  fromLevel: ModeratorLevel;
  toLevel: ModeratorLevel;
  reason: string;
  requestedBy: string;
  requestedAt: string;
}

export interface DisputeNotification {
  id: string;
  type: 'NEW_DISPUTE' | 'STATUS_UPDATE' | 'ESCALATION' | 'RESOLUTION' | 'COMMENT';
  disputeId: string;
  recipientId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Gamification constants
export const MODERATOR_POINTS = {
  RESOLVE_DISPUTE: 10,
  RESOLVE_ESCALATED: 20,
  RESOLVE_CRITICAL: 30,
  FAST_RESOLUTION: 5, // < 24 hours
  QUALITY_RESOLUTION: 15, // No appeals
  HELP_COMMUNITY: 5,
} as const;

export const MODERATOR_BADGES = {
  FIRST_RESOLUTION: {
    name: 'First Resolution',
    description: 'Resolved your first dispute',
    icon: '🎯',
    tier: 'BRONZE',
    threshold: 1,
  },
  DISPUTE_SOLVER: {
    name: 'Dispute Solver',
    description: 'Resolved 10 disputes',
    icon: '⚖️',
    tier: 'BRONZE',
    threshold: 10,
  },
  VETERAN_MODERATOR: {
    name: 'Veteran Moderator',
    description: 'Resolved 50 disputes',
    icon: '🛡️',
    tier: 'SILVER',
    threshold: 50,
  },
  MASTER_MEDIATOR: {
    name: 'Master Mediator',
    description: 'Resolved 100 disputes',
    icon: '👑',
    tier: 'GOLD',
    threshold: 100,
  },
  SPEED_DEMON: {
    name: 'Speed Demon',
    description: 'Resolved 10 disputes in under 24 hours',
    icon: '⚡',
    tier: 'SILVER',
    threshold: 10,
  },
  QUALITY_CHAMPION: {
    name: 'Quality Champion',
    description: '95% accuracy rate with 20+ resolutions',
    icon: '🌟',
    tier: 'GOLD',
    threshold: 20,
  },
  COMMUNITY_HERO: {
    name: 'Community Hero',
    description: 'Helped resolve 200 disputes',
    icon: '🦸',
    tier: 'PLATINUM',
    threshold: 200,
  },
} as const;

export const MODERATOR_RANKS = [
  { name: 'Novice', minPoints: 0, icon: '🌱' },
  { name: 'Apprentice', minPoints: 100, icon: '📚' },
  { name: 'Moderator', minPoints: 500, icon: '⚖️' },
  { name: 'Expert', minPoints: 1000, icon: '🎓' },
  { name: 'Master', minPoints: 2500, icon: '👑' },
  { name: 'Legend', minPoints: 5000, icon: '🌟' },
] as const;
