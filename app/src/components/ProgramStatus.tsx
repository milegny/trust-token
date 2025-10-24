import React, { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { 
  getProgramStatus, 
  formatVerificationResult,
  ProgramVerificationResult 
} from '../utils/programVerification';
import { PROGRAM_IDS } from '../config/constants';

interface ProgramStatusState {
  loading: boolean;
  trustToken: ProgramVerificationResult | null;
  reputationCard: ProgramVerificationResult | null;
  trustTokenInit: boolean;
  reputationCardInit: boolean;
  ready: boolean;
  error: string | null;
}

export const ProgramStatus: React.FC = () => {
  const { connection } = useConnection();
  const [status, setStatus] = useState<ProgramStatusState>({
    loading: true,
    trustToken: null,
    reputationCard: null,
    trustTokenInit: false,
    reputationCardInit: false,
    ready: false,
    error: null,
  });

  useEffect(() => {
    checkPrograms();
  }, [connection]);

  const checkPrograms = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await getProgramStatus(connection);

      setStatus({
        loading: false,
        trustToken: result.programs.trustToken,
        reputationCard: result.programs.reputationCard,
        trustTokenInit: result.initialization.trustToken,
        reputationCardInit: result.initialization.reputationCard,
        ready: result.ready,
        error: null,
      });
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check program status',
      }));
    }
  };

  const getStatusIcon = (isOk: boolean) => isOk ? '✅' : '❌';
  const getStatusColor = (isOk: boolean) => isOk ? '#10b981' : '#ef4444';

  if (status.loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h3 style={styles.title}>🔍 Checking Program Status...</h3>
          <div style={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, borderColor: '#ef4444' }}>
          <h3 style={styles.title}>❌ Error</h3>
          <p style={styles.error}>{status.error}</p>
          <button onClick={checkPrograms} style={styles.button}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ 
        ...styles.card, 
        borderColor: status.ready ? '#10b981' : '#f59e0b' 
      }}>
        <h3 style={styles.title}>
          {status.ready ? '✅' : '⚠️'} Solana Programs Status
        </h3>

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>📦 Program Deployment</h4>
          
          {status.trustToken && (
            <div style={styles.programItem}>
              <div style={styles.programHeader}>
                <span style={{ color: getStatusColor(status.trustToken.isAccessible) }}>
                  {getStatusIcon(status.trustToken.isAccessible)} TrustToken
                </span>
              </div>
              <div style={styles.programDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Program ID:</span>
                  <code style={styles.code}>{PROGRAM_IDS.TRUST_TOKEN}</code>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Status:</span>
                  <span>{formatVerificationResult(status.trustToken)}</span>
                </div>
                {status.trustToken.error && (
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Error:</span>
                    <span style={styles.error}>{status.trustToken.error}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {status.reputationCard && (
            <div style={styles.programItem}>
              <div style={styles.programHeader}>
                <span style={{ color: getStatusColor(status.reputationCard.isAccessible) }}>
                  {getStatusIcon(status.reputationCard.isAccessible)} ReputationCard
                </span>
              </div>
              <div style={styles.programDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Program ID:</span>
                  <code style={styles.code}>{PROGRAM_IDS.REPUTATION_CARD}</code>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Status:</span>
                  <span>{formatVerificationResult(status.reputationCard)}</span>
                </div>
                {status.reputationCard.error && (
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Error:</span>
                    <span style={styles.error}>{status.reputationCard.error}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>🔧 Program Initialization</h4>
          <div style={styles.initStatus}>
            <div style={styles.initItem}>
              <span style={{ color: getStatusColor(status.trustTokenInit) }}>
                {getStatusIcon(status.trustTokenInit)} TrustToken
              </span>
              <span style={styles.initLabel}>
                {status.trustTokenInit ? 'Initialized' : 'Not Initialized'}
              </span>
            </div>
            <div style={styles.initItem}>
              <span style={{ color: getStatusColor(status.reputationCardInit) }}>
                {getStatusIcon(status.reputationCardInit)} ReputationCard
              </span>
              <span style={styles.initLabel}>
                {status.reputationCardInit ? 'Initialized' : 'Not Initialized'}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>🚀 Overall Status</h4>
          <div style={{
            ...styles.overallStatus,
            backgroundColor: status.ready ? '#d1fae5' : '#fef3c7',
            color: status.ready ? '#065f46' : '#92400e',
          }}>
            {status.ready 
              ? '✅ All programs are deployed and ready' 
              : '⚠️ Some programs are not ready. Some features may not work.'}
          </div>
        </div>

        <button onClick={checkPrograms} style={styles.button}>
          🔄 Refresh Status
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #e5e7eb',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#6b7280',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
  },
  programItem: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
  },
  programHeader: {
    marginBottom: '8px',
    fontSize: '16px',
    fontWeight: '600',
  },
  programDetails: {
    fontSize: '14px',
  },
  detailRow: {
    marginBottom: '4px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '500',
    color: '#6b7280',
    minWidth: '100px',
  },
  code: {
    backgroundColor: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  error: {
    color: '#ef4444',
  },
  initStatus: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  initItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    flex: '1',
    minWidth: '200px',
  },
  initLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  overallStatus: {
    padding: '12px',
    borderRadius: '6px',
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '16px',
  },
};

export default ProgramStatus;
