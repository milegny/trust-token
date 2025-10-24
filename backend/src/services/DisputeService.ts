import { PrismaClient, Dispute, DisputeStatus, DisputeType, DisputeSeverity, ModeratorLevel, ActionType } from '@prisma/client';
import { Connection, PublicKey } from '@solana/web3.js';

const prisma = new PrismaClient();

interface CreateDisputeInput {
  reporterId: string;
  reportedId: string;
  type: DisputeType;
  severity: DisputeSeverity;
  subject: string;
  description: string;
  orderId?: string;
  reputationCardId?: string;
  productId?: string;
}

interface ResolveDisputeInput {
  disputeId: string;
  moderatorId: string;
  resolution: string;
  resolutionType: string;
  resolutionNotes?: string;
  txSignature?: string;
}

interface AssignDisputeInput {
  disputeId: string;
  moderatorId: string;
  assignedBy: string;
}

export class DisputeService {
  private connection: Connection;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Create a new dispute
   */
  async createDispute(input: CreateDisputeInput): Promise<Dispute> {
    // Validate parties are different
    if (input.reporterId === input.reportedId) {
      throw new Error('Cannot create dispute against yourself');
    }

    // Check for duplicate disputes
    const existingDispute = await prisma.dispute.findFirst({
      where: {
        reporterId: input.reporterId,
        reportedId: input.reportedId,
        type: input.type,
        status: {
          in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
        },
        ...(input.orderId && { orderId: input.orderId }),
        ...(input.reputationCardId && { reputationCardId: input.reputationCardId }),
      },
    });

    if (existingDispute) {
      throw new Error('An active dispute already exists for this case');
    }

    // Determine moderator level based on severity
    const moderatorLevel = this.determineModeratorLevel(input.severity);

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        ...input,
        moderatorLevel,
        status: DisputeStatus.OPEN,
      },
    });

    // Log action
    await this.logAction(dispute.id, input.reporterId, ActionType.CREATED, {
      type: input.type,
      severity: input.severity,
    });

    // Auto-assign if possible
    await this.autoAssignDispute(dispute.id, moderatorLevel);

    // Send notifications
    await this.sendDisputeNotifications(dispute.id, 'created');

    return dispute;
  }

  /**
   * Get dispute by ID with all relations
   */
  async getDisputeById(disputeId: string): Promise<Dispute | null> {
    return prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        evidence: {
          orderBy: { createdAt: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
        actions: {
          orderBy: { createdAt: 'desc' },
        },
        votes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Get disputes for a moderator
   */
  async getModeratorDisputes(
    moderatorId: string,
    status?: DisputeStatus
  ): Promise<Dispute[]> {
    return prisma.dispute.findMany({
      where: {
        assignedTo: moderatorId,
        ...(status && { status }),
      },
      include: {
        evidence: true,
        comments: true,
        actions: true,
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all disputes with filters
   */
  async getDisputes(filters: {
    status?: DisputeStatus;
    type?: DisputeType;
    severity?: DisputeSeverity;
    assignedTo?: string;
    reporterId?: string;
    reportedId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ disputes: Dispute[]; total: number }> {
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.severity) where.severity = filters.severity;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.reporterId) where.reporterId = filters.reporterId;
    if (filters.reportedId) where.reportedId = filters.reportedId;

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          evidence: true,
          comments: true,
          actions: true,
          votes: true,
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.dispute.count({ where }),
    ]);

    return { disputes, total };
  }

  /**
   * Assign dispute to moderator
   */
  async assignDispute(input: AssignDisputeInput): Promise<Dispute> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: input.disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.OPEN && dispute.status !== DisputeStatus.UNDER_REVIEW) {
      throw new Error('Dispute cannot be assigned in current status');
    }

    // Check moderator level permissions
    const moderatorStats = await this.getModeratorStats(input.moderatorId);
    if (!this.canModeratorHandleDispute(moderatorStats.level, dispute.moderatorLevel)) {
      throw new Error('Moderator does not have sufficient level for this dispute');
    }

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: input.disputeId },
      data: {
        assignedTo: input.moderatorId,
        status: DisputeStatus.UNDER_REVIEW,
      },
    });

    // Log action
    await this.logAction(input.disputeId, input.assignedBy, ActionType.ASSIGNED, {
      moderatorId: input.moderatorId,
    });

    // Send notification
    await this.sendDisputeNotifications(input.disputeId, 'assigned');

    return updatedDispute;
  }

  /**
   * Auto-assign dispute to available moderator
   */
  async autoAssignDispute(disputeId: string, requiredLevel: ModeratorLevel): Promise<void> {
    // Get available moderators with required level
    const availableModerators = await this.getAvailableModerators(requiredLevel);

    if (availableModerators.length === 0) {
      console.log(`No available moderators for dispute ${disputeId}`);
      return;
    }

    // Select moderator with lowest workload
    const selectedModerator = availableModerators[0];

    // Assign dispute
    await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        assignedTo: selectedModerator.moderatorId,
        status: DisputeStatus.UNDER_REVIEW,
      },
    });

    // Log action
    await this.logAction(disputeId, 'SYSTEM', ActionType.ASSIGNED, {
      moderatorId: selectedModerator.moderatorId,
      autoAssigned: true,
    });
  }

  /**
   * Get available moderators sorted by workload
   */
  async getAvailableModerators(requiredLevel: ModeratorLevel): Promise<any[]> {
    // Get moderators with required level or higher
    const levelHierarchy = {
      [ModeratorLevel.COMMUNITY]: [ModeratorLevel.COMMUNITY, ModeratorLevel.SENIOR, ModeratorLevel.ADMIN],
      [ModeratorLevel.SENIOR]: [ModeratorLevel.SENIOR, ModeratorLevel.ADMIN],
      [ModeratorLevel.ADMIN]: [ModeratorLevel.ADMIN],
    };

    const eligibleLevels = levelHierarchy[requiredLevel];

    const moderators = await prisma.moderatorStats.findMany({
      where: {
        level: { in: eligibleLevels },
      },
    });

    // Get current workload for each moderator
    const moderatorsWithWorkload = await Promise.all(
      moderators.map(async (mod) => {
        const activeDisputes = await prisma.dispute.count({
          where: {
            assignedTo: mod.moderatorId,
            status: {
              in: [DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
            },
          },
        });

        return {
          ...mod,
          activeDisputes,
        };
      })
    );

    // Sort by workload (ascending)
    return moderatorsWithWorkload.sort((a, b) => a.activeDisputes - b.activeDisputes);
  }

  /**
   * Add evidence to dispute
   */
  async addEvidence(
    disputeId: string,
    uploadedBy: string,
    type: string,
    url: string,
    description?: string,
    metadata?: any
  ): Promise<any> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status === DisputeStatus.CLOSED || dispute.status === DisputeStatus.RESOLVED) {
      throw new Error('Cannot add evidence to closed dispute');
    }

    const evidence = await prisma.disputeEvidence.create({
      data: {
        disputeId,
        uploadedBy,
        type: type as any,
        url,
        description,
        metadata,
      },
    });

    // Log action
    await this.logAction(disputeId, uploadedBy, ActionType.EVIDENCE_ADDED, {
      evidenceId: evidence.id,
      type,
    });

    return evidence;
  }

  /**
   * Add comment to dispute
   */
  async addComment(
    disputeId: string,
    authorId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<any> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const comment = await prisma.disputeComment.create({
      data: {
        disputeId,
        authorId,
        content,
        isInternal,
      },
    });

    // Log action
    await this.logAction(disputeId, authorId, ActionType.COMMENT_ADDED, {
      commentId: comment.id,
      isInternal,
    });

    return comment;
  }

  /**
   * Escalate dispute to higher level
   */
  async escalateDispute(disputeId: string, escalatedBy: string, reason: string): Promise<Dispute> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.UNDER_REVIEW) {
      throw new Error('Only disputes under review can be escalated');
    }

    // Determine next level
    const nextLevel = this.getNextModeratorLevel(dispute.moderatorLevel);
    if (!nextLevel) {
      throw new Error('Dispute is already at highest level');
    }

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: DisputeStatus.ESCALATED,
        moderatorLevel: nextLevel,
        assignedTo: null, // Will be reassigned
      },
    });

    // Log action
    await this.logAction(disputeId, escalatedBy, ActionType.ESCALATED, {
      fromLevel: dispute.moderatorLevel,
      toLevel: nextLevel,
      reason,
    });

    // Auto-assign to higher level moderator
    await this.autoAssignDispute(disputeId, nextLevel);

    return updatedDispute;
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(input: ResolveDisputeInput): Promise<Dispute> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: input.disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.assignedTo !== input.moderatorId) {
      throw new Error('Only assigned moderator can resolve dispute');
    }

    if (dispute.status !== DisputeStatus.UNDER_REVIEW && dispute.status !== DisputeStatus.ESCALATED) {
      throw new Error('Dispute cannot be resolved in current status');
    }

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: input.disputeId },
      data: {
        status: DisputeStatus.RESOLVED,
        resolution: input.resolution,
        resolutionType: input.resolutionType,
        resolutionNotes: input.resolutionNotes,
        resolvedAt: new Date(),
        txSignature: input.txSignature,
      },
    });

    // Log action
    await this.logAction(input.disputeId, input.moderatorId, ActionType.RESOLVED, {
      resolutionType: input.resolutionType,
      txSignature: input.txSignature,
    });

    // Update moderator stats
    await this.updateModeratorStats(input.moderatorId, dispute);

    // Send notifications
    await this.sendDisputeNotifications(input.disputeId, 'resolved');

    return updatedDispute;
  }

  /**
   * Vote on dispute (for complex cases)
   */
  async voteOnDispute(
    disputeId: string,
    voterId: string,
    approved: boolean,
    reasoning?: string
  ): Promise<any> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.ESCALATED) {
      throw new Error('Only escalated disputes require voting');
    }

    // Check if moderator already voted
    const existingVote = await prisma.disputeVote.findUnique({
      where: {
        disputeId_voterId: {
          disputeId,
          voterId,
        },
      },
    });

    if (existingVote) {
      throw new Error('Moderator has already voted on this dispute');
    }

    // Get voter's level for weight
    const voterStats = await this.getModeratorStats(voterId);
    const weight = this.getVoteWeight(voterStats.level);

    // Create vote
    const vote = await prisma.disputeVote.create({
      data: {
        disputeId,
        voterId,
        approved,
        reasoning,
        weight,
      },
    });

    // Check if voting is complete
    await this.checkVotingComplete(disputeId);

    return vote;
  }

  /**
   * Check if voting is complete and finalize
   */
  async checkVotingComplete(disputeId: string): Promise<void> {
    const votes = await prisma.disputeVote.findMany({
      where: { disputeId },
    });

    // Require minimum 3 votes
    if (votes.length < 3) {
      return;
    }

    // Calculate weighted votes
    const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0);
    const approvedWeight = votes
      .filter((vote) => vote.approved)
      .reduce((sum, vote) => sum + vote.weight, 0);

    const approvalPercentage = approvedWeight / totalWeight;

    // 66% threshold
    if (approvalPercentage >= 0.66) {
      // Auto-resolve as approved
      const dispute = await prisma.dispute.findUnique({
        where: { id: disputeId },
      });

      if (dispute && dispute.assignedTo) {
        await this.resolveDispute({
          disputeId,
          moderatorId: dispute.assignedTo,
          resolution: 'Approved by moderator voting',
          resolutionType: 'APPROVED',
          resolutionNotes: `Voting result: ${approvalPercentage.toFixed(2)}% approval (${votes.length} votes)`,
        });
      }
    }
  }

  /**
   * Close dispute
   */
  async closeDispute(disputeId: string, closedBy: string): Promise<Dispute> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.RESOLVED) {
      throw new Error('Only resolved disputes can be closed');
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: DisputeStatus.CLOSED,
      },
    });

    // Log action
    await this.logAction(disputeId, closedBy, ActionType.CLOSED, {});

    return updatedDispute;
  }

  /**
   * Get dispute statistics
   */
  async getDisputeStatistics(period?: string): Promise<any> {
    const where: any = {};
    
    if (period) {
      const startDate = this.getPeriodStartDate(period);
      where.createdAt = { gte: startDate };
    }

    const [
      totalDisputes,
      openDisputes,
      resolvedDisputes,
      disputesByType,
      disputesBySeverity,
    ] = await Promise.all([
      prisma.dispute.count({ where }),
      prisma.dispute.count({ where: { ...where, status: DisputeStatus.OPEN } }),
      prisma.dispute.count({ where: { ...where, status: DisputeStatus.RESOLVED } }),
      prisma.dispute.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      prisma.dispute.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
    ]);

    // Calculate average resolution time
    const resolvedDisputesWithTime = await prisma.dispute.findMany({
      where: {
        ...where,
        status: DisputeStatus.RESOLVED,
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    const averageResolutionTime = resolvedDisputesWithTime.length > 0
      ? resolvedDisputesWithTime.reduce((sum, d) => {
          const time = d.resolvedAt!.getTime() - d.createdAt.getTime();
          return sum + time;
        }, 0) / resolvedDisputesWithTime.length / (1000 * 60 * 60) // Convert to hours
      : null;

    const resolutionRate = totalDisputes > 0
      ? resolvedDisputes / totalDisputes
      : 0;

    return {
      totalDisputes,
      openDisputes,
      resolvedDisputes,
      averageResolutionTime,
      resolutionRate,
      disputesByType: Object.fromEntries(
        disputesByType.map((d) => [d.type, d._count])
      ),
      disputesBySeverity: Object.fromEntries(
        disputesBySeverity.map((d) => [d.severity, d._count])
      ),
    };
  }

  /**
   * Helper: Log dispute action
   */
  private async logAction(
    disputeId: string,
    performedBy: string,
    actionType: ActionType,
    details: any
  ): Promise<void> {
    await prisma.disputeAction.create({
      data: {
        disputeId,
        performedBy,
        actionType,
        details,
      },
    });
  }

  /**
   * Helper: Get or create moderator stats
   */
  private async getModeratorStats(moderatorId: string): Promise<any> {
    let stats = await prisma.moderatorStats.findUnique({
      where: { moderatorId },
    });

    if (!stats) {
      stats = await prisma.moderatorStats.create({
        data: {
          moderatorId,
          level: ModeratorLevel.COMMUNITY,
        },
      });
    }

    return stats;
  }

  /**
   * Helper: Update moderator stats after resolution
   */
  private async updateModeratorStats(moderatorId: string, dispute: Dispute): Promise<void> {
    const stats = await this.getModeratorStats(moderatorId);

    // Calculate resolution time
    const resolutionTime = dispute.resolvedAt
      ? (dispute.resolvedAt.getTime() - dispute.createdAt.getTime()) / (1000 * 60 * 60)
      : null;

    // Calculate reward
    const reward = this.calculateModeratorReward(stats.level, dispute.severity, resolutionTime);

    // Update stats
    await prisma.moderatorStats.update({
      where: { moderatorId },
      data: {
        disputesResolved: { increment: 1 },
        totalEarned: { increment: reward },
        currentMonthEarned: { increment: reward },
        points: { increment: this.calculatePoints(dispute.severity) },
      },
    });

    // Check for level up
    await this.checkModeratorLevelUp(moderatorId);
  }

  /**
   * Helper: Calculate moderator reward
   */
  private calculateModeratorReward(
    level: ModeratorLevel,
    severity: DisputeSeverity,
    resolutionTime: number | null
  ): number {
    const baseReward = 0.1; // 0.1 SOL
    
    const levelMultipliers = {
      [ModeratorLevel.COMMUNITY]: 1.0,
      [ModeratorLevel.SENIOR]: 1.5,
      [ModeratorLevel.ADMIN]: 2.0,
    };

    const severityMultipliers = {
      [DisputeSeverity.LOW]: 1.0,
      [DisputeSeverity.MEDIUM]: 1.2,
      [DisputeSeverity.HIGH]: 1.5,
      [DisputeSeverity.CRITICAL]: 2.0,
    };

    let reward = baseReward * levelMultipliers[level] * severityMultipliers[severity];

    // Fast resolution bonus (< 24 hours)
    if (resolutionTime && resolutionTime < 24) {
      reward *= 1.2;
    }

    return reward;
  }

  /**
   * Helper: Calculate points for dispute
   */
  private calculatePoints(severity: DisputeSeverity): number {
    const points = {
      [DisputeSeverity.LOW]: 10,
      [DisputeSeverity.MEDIUM]: 20,
      [DisputeSeverity.HIGH]: 30,
      [DisputeSeverity.CRITICAL]: 50,
    };

    return points[severity];
  }

  /**
   * Helper: Check if moderator should level up
   */
  private async checkModeratorLevelUp(moderatorId: string): Promise<void> {
    const stats = await this.getModeratorStats(moderatorId);

    const levelRequirements = {
      [ModeratorLevel.SENIOR]: { disputes: 50, points: 500 },
      [ModeratorLevel.ADMIN]: { disputes: 200, points: 2000 },
    };

    if (
      stats.level === ModeratorLevel.COMMUNITY &&
      stats.disputesResolved >= levelRequirements[ModeratorLevel.SENIOR].disputes &&
      stats.points >= levelRequirements[ModeratorLevel.SENIOR].points
    ) {
      await prisma.moderatorStats.update({
        where: { moderatorId },
        data: { level: ModeratorLevel.SENIOR },
      });
    } else if (
      stats.level === ModeratorLevel.SENIOR &&
      stats.disputesResolved >= levelRequirements[ModeratorLevel.ADMIN].disputes &&
      stats.points >= levelRequirements[ModeratorLevel.ADMIN].points
    ) {
      await prisma.moderatorStats.update({
        where: { moderatorId },
        data: { level: ModeratorLevel.ADMIN },
      });
    }
  }

  /**
   * Helper: Determine required moderator level
   */
  private determineModeratorLevel(severity: DisputeSeverity): ModeratorLevel {
    if (severity === DisputeSeverity.CRITICAL) {
      return ModeratorLevel.ADMIN;
    } else if (severity === DisputeSeverity.HIGH) {
      return ModeratorLevel.SENIOR;
    }
    return ModeratorLevel.COMMUNITY;
  }

  /**
   * Helper: Get next moderator level
   */
  private getNextModeratorLevel(current: ModeratorLevel): ModeratorLevel | null {
    if (current === ModeratorLevel.COMMUNITY) return ModeratorLevel.SENIOR;
    if (current === ModeratorLevel.SENIOR) return ModeratorLevel.ADMIN;
    return null;
  }

  /**
   * Helper: Check if moderator can handle dispute
   */
  private canModeratorHandleDispute(
    moderatorLevel: ModeratorLevel,
    requiredLevel: ModeratorLevel
  ): boolean {
    const hierarchy = {
      [ModeratorLevel.COMMUNITY]: 1,
      [ModeratorLevel.SENIOR]: 2,
      [ModeratorLevel.ADMIN]: 3,
    };

    return hierarchy[moderatorLevel] >= hierarchy[requiredLevel];
  }

  /**
   * Helper: Get vote weight based on moderator level
   */
  private getVoteWeight(level: ModeratorLevel): number {
    const weights = {
      [ModeratorLevel.COMMUNITY]: 1,
      [ModeratorLevel.SENIOR]: 2,
      [ModeratorLevel.ADMIN]: 3,
    };

    return weights[level];
  }

  /**
   * Helper: Get period start date
   */
  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    
    if (period === 'today') {
      return new Date(now.setHours(0, 0, 0, 0));
    } else if (period === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day;
      return new Date(now.setDate(diff));
    } else if (period === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      return new Date(now.getFullYear(), 0, 1);
    }
    
    return new Date(0);
  }

  /**
   * Helper: Send dispute notifications (placeholder)
   */
  private async sendDisputeNotifications(disputeId: string, event: string): Promise<void> {
    // TODO: Implement notification system
    console.log(`Notification: Dispute ${disputeId} - ${event}`);
  }
}

export default new DisputeService();
