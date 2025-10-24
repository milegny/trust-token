import { PrismaClient, ModeratorLevel, DisputeSeverity, DisputeStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface ModeratorWorkload {
  moderatorId: string;
  level: ModeratorLevel;
  activeDisputes: number;
  averageResolutionTime: number | null;
  accuracyRate: number | null;
  points: number;
  score: number; // Calculated assignment score
}

export class ModeratorAssignmentService {
  /**
   * Find best moderator for dispute using advanced scoring
   */
  async findBestModerator(
    requiredLevel: ModeratorLevel,
    severity: DisputeSeverity,
    reportedId?: string
  ): Promise<string | null> {
    // Get eligible moderators
    const eligibleModerators = await this.getEligibleModerators(requiredLevel);

    if (eligibleModerators.length === 0) {
      return null;
    }

    // Filter out conflicts of interest
    const availableModerators = reportedId
      ? eligibleModerators.filter((m) => m.moderatorId !== reportedId)
      : eligibleModerators;

    if (availableModerators.length === 0) {
      return null;
    }

    // Calculate workload and scores
    const moderatorsWithScores = await Promise.all(
      availableModerators.map((mod) => this.calculateModeratorScore(mod, severity))
    );

    // Sort by score (higher is better)
    moderatorsWithScores.sort((a, b) => b.score - a.score);

    return moderatorsWithScores[0].moderatorId;
  }

  /**
   * Get eligible moderators for required level
   */
  private async getEligibleModerators(requiredLevel: ModeratorLevel): Promise<any[]> {
    const levelHierarchy = {
      [ModeratorLevel.COMMUNITY]: [ModeratorLevel.COMMUNITY, ModeratorLevel.SENIOR, ModeratorLevel.ADMIN],
      [ModeratorLevel.SENIOR]: [ModeratorLevel.SENIOR, ModeratorLevel.ADMIN],
      [ModeratorLevel.ADMIN]: [ModeratorLevel.ADMIN],
    };

    const eligibleLevels = levelHierarchy[requiredLevel];

    return prisma.moderatorStats.findMany({
      where: {
        level: { in: eligibleLevels },
      },
    });
  }

  /**
   * Calculate moderator assignment score
   */
  private async calculateModeratorScore(
    moderator: any,
    severity: DisputeSeverity
  ): Promise<ModeratorWorkload> {
    // Get current workload
    const activeDisputes = await prisma.dispute.count({
      where: {
        assignedTo: moderator.moderatorId,
        status: {
          in: [DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
        },
      },
    });

    // Calculate score based on multiple factors
    let score = 100;

    // Factor 1: Workload (lower is better)
    // Penalize heavily loaded moderators
    score -= activeDisputes * 10;

    // Factor 2: Experience (higher is better)
    // Reward experienced moderators
    score += Math.min(moderator.disputesResolved * 0.5, 20);

    // Factor 3: Performance (higher is better)
    if (moderator.accuracyRate) {
      score += moderator.accuracyRate * 20;
    }

    // Factor 4: Resolution speed (faster is better)
    if (moderator.averageResolutionTime) {
      // Penalize slow moderators
      const hoursPerDispute = moderator.averageResolutionTime;
      if (hoursPerDispute < 24) {
        score += 10;
      } else if (hoursPerDispute > 72) {
        score -= 10;
      }
    }

    // Factor 5: Level match
    // Prefer exact level match over over-qualified
    const levelScores = {
      [ModeratorLevel.COMMUNITY]: 1,
      [ModeratorLevel.SENIOR]: 2,
      [ModeratorLevel.ADMIN]: 3,
    };

    const severityLevels = {
      [DisputeSeverity.LOW]: ModeratorLevel.COMMUNITY,
      [DisputeSeverity.MEDIUM]: ModeratorLevel.COMMUNITY,
      [DisputeSeverity.HIGH]: ModeratorLevel.SENIOR,
      [DisputeSeverity.CRITICAL]: ModeratorLevel.ADMIN,
    };

    const idealLevel = severityLevels[severity];
    if (moderator.level === idealLevel) {
      score += 15;
    } else if (levelScores[moderator.level] > levelScores[idealLevel]) {
      // Over-qualified, slight penalty
      score -= 5;
    }

    // Factor 6: Recent activity
    // Prefer moderators who are currently active
    const recentDisputes = await prisma.dispute.count({
      where: {
        assignedTo: moderator.moderatorId,
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (recentDisputes > 0) {
      score += 5;
    }

    return {
      moderatorId: moderator.moderatorId,
      level: moderator.level,
      activeDisputes,
      averageResolutionTime: moderator.averageResolutionTime,
      accuracyRate: moderator.accuracyRate,
      points: moderator.points,
      score: Math.max(score, 0), // Ensure non-negative
    };
  }

  /**
   * Balance workload across moderators
   */
  async balanceWorkload(): Promise<void> {
    // Get all moderators with their workload
    const moderators = await prisma.moderatorStats.findMany();

    const workloads = await Promise.all(
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
          moderatorId: mod.moderatorId,
          level: mod.level,
          activeDisputes,
        };
      })
    );

    // Calculate average workload per level
    const levelAverages = this.calculateLevelAverages(workloads);

    // Find overloaded moderators
    const overloaded = workloads.filter(
      (w) => w.activeDisputes > levelAverages[w.level] * 1.5
    );

    // Find underloaded moderators
    const underloaded = workloads.filter(
      (w) => w.activeDisputes < levelAverages[w.level] * 0.5
    );

    // Reassign disputes from overloaded to underloaded
    for (const overloadedMod of overloaded) {
      const targetLevel = overloadedMod.level;
      const availableTargets = underloaded.filter((u) => u.level === targetLevel);

      if (availableTargets.length === 0) continue;

      // Get oldest unresolved disputes
      const disputes = await prisma.dispute.findMany({
        where: {
          assignedTo: overloadedMod.moderatorId,
          status: DisputeStatus.UNDER_REVIEW,
        },
        orderBy: { createdAt: 'asc' },
        take: Math.ceil((overloadedMod.activeDisputes - levelAverages[targetLevel]) / 2),
      });

      // Reassign to least loaded moderator
      const target = availableTargets[0];
      for (const dispute of disputes) {
        await prisma.dispute.update({
          where: { id: dispute.id },
          data: { assignedTo: target.moderatorId },
        });

        // Log reassignment
        await prisma.disputeAction.create({
          data: {
            disputeId: dispute.id,
            performedBy: 'SYSTEM',
            actionType: 'ASSIGNED',
            details: {
              from: overloadedMod.moderatorId,
              to: target.moderatorId,
              reason: 'workload_balancing',
            },
          },
        });
      }
    }
  }

  /**
   * Calculate average workload per level
   */
  private calculateLevelAverages(workloads: any[]): Record<ModeratorLevel, number> {
    const levels = [ModeratorLevel.COMMUNITY, ModeratorLevel.SENIOR, ModeratorLevel.ADMIN];
    const averages: any = {};

    for (const level of levels) {
      const levelMods = workloads.filter((w) => w.level === level);
      if (levelMods.length === 0) {
        averages[level] = 0;
      } else {
        const total = levelMods.reduce((sum, m) => sum + m.activeDisputes, 0);
        averages[level] = total / levelMods.length;
      }
    }

    return averages;
  }

  /**
   * Check for conflicts of interest
   */
  async hasConflictOfInterest(moderatorId: string, disputeId: string): Promise<boolean> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      return false;
    }

    // Moderator cannot be reporter or reported
    if (moderatorId === dispute.reporterId || moderatorId === dispute.reportedId) {
      return true;
    }

    // Check if moderator has relationship with parties
    if (dispute.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: dispute.orderId },
      });

      if (order && (moderatorId === order.buyerId || moderatorId === order.sellerId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get moderator availability status
   */
  async getModeratorAvailability(moderatorId: string): Promise<{
    available: boolean;
    currentWorkload: number;
    maxCapacity: number;
    utilizationRate: number;
  }> {
    const stats = await prisma.moderatorStats.findUnique({
      where: { moderatorId },
    });

    if (!stats) {
      return {
        available: false,
        currentWorkload: 0,
        maxCapacity: 0,
        utilizationRate: 0,
      };
    }

    const currentWorkload = await prisma.dispute.count({
      where: {
        assignedTo: moderatorId,
        status: {
          in: [DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
        },
      },
    });

    // Max capacity based on level
    const maxCapacities = {
      [ModeratorLevel.COMMUNITY]: 5,
      [ModeratorLevel.SENIOR]: 10,
      [ModeratorLevel.ADMIN]: 15,
    };

    const maxCapacity = maxCapacities[stats.level];
    const utilizationRate = currentWorkload / maxCapacity;

    return {
      available: currentWorkload < maxCapacity,
      currentWorkload,
      maxCapacity,
      utilizationRate,
    };
  }

  /**
   * Get recommended moderators for dispute
   */
  async getRecommendedModerators(
    requiredLevel: ModeratorLevel,
    severity: DisputeSeverity,
    limit: number = 5
  ): Promise<ModeratorWorkload[]> {
    const eligibleModerators = await this.getEligibleModerators(requiredLevel);

    const moderatorsWithScores = await Promise.all(
      eligibleModerators.map((mod) => this.calculateModeratorScore(mod, severity))
    );

    // Sort by score and return top N
    return moderatorsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Reassign dispute to different moderator
   */
  async reassignDispute(
    disputeId: string,
    newModeratorId: string,
    reassignedBy: string,
    reason: string
  ): Promise<void> {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error('Dispute not found');
    }

    // Check for conflicts
    const hasConflict = await this.hasConflictOfInterest(newModeratorId, disputeId);
    if (hasConflict) {
      throw new Error('Moderator has conflict of interest');
    }

    // Check availability
    const availability = await this.getModeratorAvailability(newModeratorId);
    if (!availability.available) {
      throw new Error('Moderator is at capacity');
    }

    // Update assignment
    await prisma.dispute.update({
      where: { id: disputeId },
      data: { assignedTo: newModeratorId },
    });

    // Log reassignment
    await prisma.disputeAction.create({
      data: {
        disputeId,
        performedBy: reassignedBy,
        actionType: 'ASSIGNED',
        details: {
          from: dispute.assignedTo,
          to: newModeratorId,
          reason,
        },
      },
    });
  }

  /**
   * Get workload statistics for all moderators
   */
  async getWorkloadStatistics(): Promise<any> {
    const moderators = await prisma.moderatorStats.findMany();

    const stats = await Promise.all(
      moderators.map(async (mod) => {
        const activeDisputes = await prisma.dispute.count({
          where: {
            assignedTo: mod.moderatorId,
            status: {
              in: [DisputeStatus.UNDER_REVIEW, DisputeStatus.ESCALATED],
            },
          },
        });

        const availability = await this.getModeratorAvailability(mod.moderatorId);

        return {
          moderatorId: mod.moderatorId,
          level: mod.level,
          activeDisputes,
          ...availability,
        };
      })
    );

    // Calculate overall statistics
    const totalModerators = stats.length;
    const totalWorkload = stats.reduce((sum, s) => sum + s.currentWorkload, 0);
    const averageWorkload = totalModerators > 0 ? totalWorkload / totalModerators : 0;
    const averageUtilization = totalModerators > 0
      ? stats.reduce((sum, s) => sum + s.utilizationRate, 0) / totalModerators
      : 0;

    return {
      moderators: stats,
      summary: {
        totalModerators,
        totalWorkload,
        averageWorkload,
        averageUtilization,
      },
    };
  }
}

export default new ModeratorAssignmentService();
