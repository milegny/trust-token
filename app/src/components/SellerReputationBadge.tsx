import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TRUST_TOKEN_PROGRAM_ID, CARD_TYPE_ICONS, CARD_TYPE_LABELS } from '../config/constants';

interface ReputationCard {
  issuer: string;
  recipient: string;
  cardType: string;
  message: string;
  rating: number;
  status: string;
  issuedAt: Date;
  cardNumber: number;
}

interface SellerReputationBadgeProps {
  sellerId: string;
  sellerWallet: string;
  sellerUsername?: string;
  isVerified?: boolean;
  reputationScore?: number;
  compact?: boolean;
  showCards?: boolean;
}

export const SellerReputationBadge: React.FC<SellerReputationBadgeProps> = ({
  sellerId,
  sellerWallet,
  sellerUsername,
  isVerified = false,
  reputationScore = 0,
  compact = false,
  showCards = true,
}) => {
  const { connection } = useConnection();
  const [cards, setCards] = useState<ReputationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTrustToken, setHasTrustToken] = useState(false);

  useEffect(() => {
    loadReputationData();
  }, [sellerWallet]);

  const loadReputationData = async () => {
    setLoading(true);
    try {
      // Check for TrustToken
      await checkTrustToken();
      
      // Load reputation cards from backend
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/reputationcards/onchain/${sellerWallet}`);
      // const data = await response.json();
      // setCards(data.cards || []);
      
      // Mock data for now
      setCards([]);
    } catch (error) {
      console.error('Error loading reputation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTrustToken = async () => {
    try {
      const wallet = new PublicKey(sellerWallet);
      
      // Get all token accounts owned by the wallet
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
        programId: new PublicKey('TokenkgQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      // Check each token account for TrustToken
      for (const { account } of tokenAccounts.value) {
        const parsedInfo = account.data.parsed.info;
        const mint = new PublicKey(parsedInfo.mint);
        
        try {
          const [trustTokenPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('trust_token'), mint.toBuffer()],
            TRUST_TOKEN_PROGRAM_ID
          );
          
          const accountInfo = await connection.getAccountInfo(trustTokenPDA);
          if (accountInfo) {
            setHasTrustToken(true);
            return;
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.error('Error checking TrustToken:', error);
    }
  };

  const getReputationLevel = (score: number): { label: string; color: string; icon: string } => {
    if (score >= 4.5) return { label: 'Excellent', color: '#10b981', icon: '🌟' };
    if (score >= 4.0) return { label: 'Very Good', color: '#14F195', icon: '⭐' };
    if (score >= 3.5) return { label: 'Good', color: '#3b82f6', icon: '👍' };
    if (score >= 3.0) return { label: 'Fair', color: '#f59e0b', icon: '👌' };
    return { label: 'New Seller', color: '#6b7280', icon: '🆕' };
  };

  const reputationLevel = getReputationLevel(reputationScore);
  const displayName = sellerUsername || `${sellerWallet.substring(0, 8)}...`;
  const activeCards = cards.filter(card => card.status === 'active');
  const recentCards = activeCards.slice(0, 3);

  if (compact) {
    return (
      <Link 
        to={`/profile/${sellerId}`}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div style={styles.compactBadge}>
          <div style={styles.compactHeader}>
            <span style={styles.compactName}>{displayName}</span>
            {hasTrustToken && (
              <span style={styles.verifiedBadge} title="Verified with TrustToken">
                ✓
              </span>
            )}
          </div>
          <div style={styles.compactScore}>
            <span style={{ color: reputationLevel.color }}>
              {reputationLevel.icon} {reputationScore.toFixed(1)}
            </span>
            <span style={styles.compactLabel}>
              {reputationLevel.label}
            </span>
          </div>
          {activeCards.length > 0 && (
            <div style={styles.compactCards}>
              {activeCards.length} reputation card{activeCards.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div style={styles.badge}>
      <div style={styles.header}>
        <div style={styles.sellerInfo}>
          <Link 
            to={`/profile/${sellerId}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3 style={styles.sellerName}>
              {displayName}
              {hasTrustToken && (
                <span style={styles.verifiedBadgeLarge} title="Verified with TrustToken">
                  ✓ Verified
                </span>
              )}
            </h3>
          </Link>
          <div style={styles.scoreContainer}>
            <div style={styles.scoreDisplay}>
              <span style={{ ...styles.scoreIcon, color: reputationLevel.color }}>
                {reputationLevel.icon}
              </span>
              <span style={styles.scoreValue}>{reputationScore.toFixed(1)}</span>
              <span style={styles.scoreMax}>/5.0</span>
            </div>
            <div style={{ ...styles.reputationLevel, color: reputationLevel.color }}>
              {reputationLevel.label}
            </div>
          </div>
        </div>
      </div>

      {showCards && (
        <>
          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <div style={styles.statValue}>{activeCards.length}</div>
              <div style={styles.statLabel}>Active Cards</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>{cards.length}</div>
              <div style={styles.statLabel}>Total Cards</div>
            </div>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading reputation cards...</div>
          ) : recentCards.length > 0 ? (
            <>
              <div style={styles.cardsTitle}>Recent Reputation Cards</div>
              <div style={styles.cardsContainer}>
                {recentCards.map((card, index) => (
                  <div key={index} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <span style={styles.cardIcon}>
                        {CARD_TYPE_ICONS[card.cardType as keyof typeof CARD_TYPE_ICONS] || '📝'}
                      </span>
                      <span style={styles.cardType}>
                        {CARD_TYPE_LABELS[card.cardType as keyof typeof CARD_TYPE_LABELS] || card.cardType}
                      </span>
                    </div>
                    <div style={styles.cardRating}>
                      {'⭐'.repeat(card.rating)}
                    </div>
                    {card.message && (
                      <div style={styles.cardMessage}>
                        "{card.message.substring(0, 60)}{card.message.length > 60 ? '...' : ''}"
                      </div>
                    )}
                    <div style={styles.cardDate}>
                      {new Date(card.issuedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              {activeCards.length > 3 && (
                <Link to={`/profile/${sellerId}`} style={styles.viewAllLink}>
                  View all {activeCards.length} reputation cards →
                </Link>
              )}
            </>
          ) : (
            <div style={styles.noCards}>
              No reputation cards yet
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  badge: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  header: {
    marginBottom: '16px',
  },
  sellerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sellerName: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  verifiedBadgeLarge: {
    fontSize: '14px',
    color: '#14F195',
    fontWeight: 'normal',
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  scoreDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  scoreIcon: {
    fontSize: '24px',
  },
  scoreValue: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: '16px',
    color: '#6b7280',
  },
  reputationLevel: {
    fontSize: '14px',
    fontWeight: '600',
    padding: '4px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
  },
  statsRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  stat: {
    flex: 1,
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#9945FF',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  cardsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  cardIcon: {
    fontSize: '20px',
  },
  cardType: {
    fontSize: '14px',
    fontWeight: '600',
  },
  cardRating: {
    fontSize: '14px',
    marginBottom: '8px',
  },
  cardMessage: {
    fontSize: '13px',
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: '8px',
  },
  cardDate: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#6b7280',
  },
  noCards: {
    textAlign: 'center',
    padding: '20px',
    color: '#9ca3af',
    fontSize: '14px',
  },
  viewAllLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: '12px',
    color: '#9945FF',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  // Compact styles
  compactBadge: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '8px 12px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  compactHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  compactName: {
    fontSize: '14px',
    fontWeight: '600',
  },
  verifiedBadge: {
    fontSize: '12px',
    color: '#14F195',
    backgroundColor: '#d1fae5',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  compactScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  compactLabel: {
    fontSize: '12px',
    color: '#6b7280',
  },
  compactCards: {
    fontSize: '11px',
    color: '#9ca3af',
  },
};

export default SellerReputationBadge;
