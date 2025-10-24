import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Dispute,
  DisputeStatus,
  DisputeType,
  DisputeFilters,
  DisputeMetrics,
  ModeratorStats,
  ModeratorLevel,
} from '../types/dispute';
import { getDisputes, getDisputeMetrics, getModeratorStats } from '../services/disputeService';

export const ModeratorDashboard: React.FC = () => {
  const { publicKey } = useWallet();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [metrics, setMetrics] = useState<DisputeMetrics | null>(null);
  const [moderatorStats, setModeratorStats] = useState<ModeratorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DisputeFilters>({
    status: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW],
  });
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  useEffect(() => {
    if (publicKey) {
      loadData();
    }
  }, [publicKey, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [disputesData, metricsData, statsData] = await Promise.all([
        getDisputes(filters),
        getDisputeMetrics(),
        getModeratorStats(publicKey!.toString()),
      ]);
      
      setDisputes(disputesData);
      setMetrics(metricsData);
      setModeratorStats(statsData);
    } catch (error) {
      console.error('Error loading moderator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof DisputeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleStatusFilter = (status: DisputeStatus) => {
    setFilters(prev => {
      const currentStatuses = prev.status || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status];
      return { ...prev, status: newStatuses };
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#f59e0b';
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case DisputeStatus.OPEN: return '#3b82f6';
      case DisputeStatus.UNDER_REVIEW: return '#f59e0b';
      case DisputeStatus.ESCALATED: return '#dc2626';
      case DisputeStatus.RESOLVED: return '#10b981';
      case DisputeStatus.CLOSED: return '#6b7280';
      case DisputeStatus.REJECTED: return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getModeratorLevelBadge = (level: ModeratorLevel) => {
    switch (level) {
      case ModeratorLevel.COMMUNITY: return { label: 'Community', color: '#3b82f6', icon: '👥' };
      case ModeratorLevel.SENIOR: return { label: 'Senior', color: '#9945FF', icon: '⭐' };
      case ModeratorLevel.ADMIN: return { label: 'Admin', color: '#dc2626', icon: '👑' };
      default: return { label: 'Unknown', color: '#6b7280', icon: '❓' };
    }
  };

  if (!publicKey) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h2>Moderator Dashboard</h2>
          <p>Please connect your wallet to access the moderator dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading moderator dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Moderator Dashboard</h1>
          <p style={styles.subtitle}>Manage disputes and maintain community standards</p>
        </div>
        {moderatorStats && (
          <div style={styles.moderatorBadge}>
            <span style={styles.moderatorIcon}>
              {getModeratorLevelBadge(moderatorStats.moderatorLevel).icon}
            </span>
            <div>
              <div style={styles.moderatorLevel}>
                {getModeratorLevelBadge(moderatorStats.moderatorLevel).label} Moderator
              </div>
              <div style={styles.moderatorPoints}>
                {moderatorStats.points} points • Rank #{moderatorStats.rank}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics */}
      {metrics && (
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.open}</div>
            <div style={styles.metricLabel}>Open Disputes</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.underReview}</div>
            <div style={styles.metricLabel}>Under Review</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.escalated}</div>
            <div style={styles.metricLabel}>Escalated</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.averageResolutionTime.toFixed(1)}h</div>
            <div style={styles.metricLabel}>Avg Resolution Time</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.resolutionRate.toFixed(0)}%</div>
            <div style={styles.metricLabel}>Resolution Rate</div>
          </div>
        </div>
      )}

      {/* Moderator Stats */}
      {moderatorStats && (
        <div style={styles.statsSection}>
          <h3 style={styles.sectionTitle}>Your Performance</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Resolved:</span>
              <span style={styles.statValue}>{moderatorStats.resolvedDisputes}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Accuracy:</span>
              <span style={styles.statValue}>{moderatorStats.accuracyRate.toFixed(1)}%</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>This Week:</span>
              <span style={styles.statValue}>{moderatorStats.disputesThisWeek}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Avg Time:</span>
              <span style={styles.statValue}>{moderatorStats.averageResolutionTime.toFixed(1)}h</span>
            </div>
          </div>
          {moderatorStats.badges.length > 0 && (
            <div style={styles.badgesSection}>
              <h4 style={styles.badgesTitle}>Badges</h4>
              <div style={styles.badgesList}>
                {moderatorStats.badges.map(badge => (
                  <div key={badge.id} style={styles.badge} title={badge.description}>
                    <span style={styles.badgeIcon}>{badge.icon}</span>
                    <span style={styles.badgeName}>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={styles.filtersSection}>
        <h3 style={styles.sectionTitle}>Filters</h3>
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status:</label>
            <div style={styles.filterButtons}>
              {Object.values(DisputeStatus).map(status => (
                <button
                  key={status}
                  onClick={() => toggleStatusFilter(status)}
                  style={{
                    ...styles.filterButton,
                    ...(filters.status?.includes(status) ? styles.filterButtonActive : {}),
                  }}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Quick Filters:</label>
            <div style={styles.filterButtons}>
              <button
                onClick={() => handleFilterChange('assignedToMe', !filters.assignedToMe)}
                style={{
                  ...styles.filterButton,
                  ...(filters.assignedToMe ? styles.filterButtonActive : {}),
                }}
              >
                Assigned to Me
              </button>
              <button
                onClick={() => handleFilterChange('unassigned', !filters.unassigned)}
                style={{
                  ...styles.filterButton,
                  ...(filters.unassigned ? styles.filterButtonActive : {}),
                }}
              >
                Unassigned
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      <div style={styles.disputesSection}>
        <h3 style={styles.sectionTitle}>
          Disputes ({disputes.length})
        </h3>
        
        {disputes.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No disputes match the current filters.</p>
          </div>
        ) : (
          <div style={styles.disputesList}>
            {disputes.map(dispute => (
              <Link
                key={dispute.id}
                to={`/moderator/disputes/${dispute.id}`}
                style={styles.disputeCard}
              >
                <div style={styles.disputeHeader}>
                  <div style={styles.disputeTitle}>
                    <span style={styles.disputeId}>#{dispute.id.substring(0, 8)}</span>
                    <span style={styles.disputeSubject}>{dispute.subject}</span>
                  </div>
                  <div style={styles.disputeBadges}>
                    <span
                      style={{
                        ...styles.severityBadge,
                        backgroundColor: getSeverityColor(dispute.severity),
                      }}
                    >
                      {dispute.severity}
                    </span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(dispute.status),
                      }}
                    >
                      {dispute.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div style={styles.disputeContent}>
                  <p style={styles.disputeDescription}>
                    {dispute.description.substring(0, 150)}
                    {dispute.description.length > 150 ? '...' : ''}
                  </p>
                </div>

                <div style={styles.disputeFooter}>
                  <div style={styles.disputeParties}>
                    <span style={styles.partyLabel}>Reporter:</span>
                    <span style={styles.partyName}>
                      {dispute.reporter.username || dispute.reporter.walletAddress.substring(0, 8)}
                    </span>
                    <span style={styles.partySeparator}>vs</span>
                    <span style={styles.partyName}>
                      {dispute.reported.username || dispute.reported.walletAddress.substring(0, 8)}
                    </span>
                  </div>
                  <div style={styles.disputeMeta}>
                    <span style={styles.disputeDate}>
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </span>
                    {dispute.assignedModerator && (
                      <span style={styles.assignedTo}>
                        Assigned to: {dispute.assignedModerator.username || 'Moderator'}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#6b7280',
  },
  moderatorBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
  },
  moderatorIcon: {
    fontSize: '32px',
  },
  moderatorLevel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#374151',
  },
  moderatorPoints: {
    fontSize: '14px',
    color: '#6b7280',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  metricCard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#9945FF',
    marginBottom: '8px',
  },
  metricLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statsSection: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '30px',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#374151',
  },
  badgesSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb',
  },
  badgesTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  badgesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'help',
  },
  badgeIcon: {
    fontSize: '18px',
  },
  badgeName: {
    fontWeight: '600',
  },
  filtersSection: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginBottom: '30px',
  },
  filters: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  filterButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  filterButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonActive: {
    backgroundColor: '#9945FF',
    color: 'white',
    borderColor: '#9945FF',
  },
  disputesSection: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  disputesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  disputeCard: {
    display: 'block',
    padding: '20px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  disputeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  disputeTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  disputeId: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
  },
  disputeSubject: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#374151',
  },
  disputeBadges: {
    display: 'flex',
    gap: '8px',
  },
  severityBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
  },
  disputeContent: {
    marginBottom: '12px',
  },
  disputeDescription: {
    margin: 0,
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.6',
  },
  disputeFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
  },
  disputeParties: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  partyLabel: {
    color: '#6b7280',
  },
  partyName: {
    fontWeight: '600',
    color: '#374151',
  },
  partySeparator: {
    color: '#9ca3af',
  },
  disputeMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
    color: '#6b7280',
  },
  disputeDate: {},
  assignedTo: {
    fontStyle: 'italic',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#6b7280',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
  },
};

export default ModeratorDashboard;
