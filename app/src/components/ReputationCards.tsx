import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

// This will need to be updated with the actual reputation_card IDL after deployment
// For now, using a placeholder structure
interface ReputationCard {
  issuer: PublicKey;
  recipient: PublicKey;
  cardType: string;
  message: string;
  rating: number;
  status: string;
  issuedAt: number;
  revokedAt: number | null;
  cardNumber: number;
}

interface ReputationCardsProps {
  userPublicKey?: PublicKey;
}

const CARD_TYPE_LABELS: Record<string, string> = {
  trustworthy: 'Trustworthy',
  qualityProducts: 'Quality Products',
  fastShipping: 'Fast Shipping',
  goodCommunication: 'Good Communication',
  fairPricing: 'Fair Pricing',
  reliable: 'Reliable',
  professional: 'Professional',
  responsive: 'Responsive',
};

const CARD_TYPE_ICONS: Record<string, string> = {
  trustworthy: '🤝',
  qualityProducts: '⭐',
  fastShipping: '🚀',
  goodCommunication: '💬',
  fairPricing: '💰',
  reliable: '✅',
  professional: '👔',
  responsive: '⚡',
};

const ReputationCards: React.FC<ReputationCardsProps> = ({ userPublicKey }) => {
  const { connection } = useConnection();
  const { publicKey: walletPublicKey, wallet } = useWallet();
  const [cards, setCards] = useState<ReputationCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetPublicKey = userPublicKey || walletPublicKey;

  useEffect(() => {
    if (targetPublicKey) {
      fetchReputationCards();
    } else {
      setCards([]);
    }
  }, [targetPublicKey]);

  const fetchReputationCards = async () => {
    if (!targetPublicKey) return;

    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual reputation_card program interaction
      // For now, this is a placeholder that would fetch from the program
      
      // Example of how it would work:
      // const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: 'confirmed' });
      // const program = new Program(reputationCardIdl, provider);
      // const cards = await program.account.reputationCard.all([
      //   { memcmp: { offset: 8 + 32, bytes: targetPublicKey.toBase58() } }
      // ]);

      // For demonstration, using mock data
      const mockCards: ReputationCard[] = [
        {
          issuer: new PublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'),
          recipient: targetPublicKey,
          cardType: 'trustworthy',
          message: 'Great seller! Very trustworthy and reliable.',
          rating: 5,
          status: 'active',
          issuedAt: Date.now() / 1000 - 86400 * 7,
          revokedAt: null,
          cardNumber: 1,
        },
        {
          issuer: new PublicKey('8yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV'),
          recipient: targetPublicKey,
          cardType: 'qualityProducts',
          message: 'Products are exactly as described. High quality!',
          rating: 5,
          status: 'active',
          issuedAt: Date.now() / 1000 - 86400 * 3,
          revokedAt: null,
          cardNumber: 2,
        },
        {
          issuer: new PublicKey('9zKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW'),
          recipient: targetPublicKey,
          cardType: 'fastShipping',
          message: 'Super fast shipping! Received in 2 days.',
          rating: 4,
          status: 'active',
          issuedAt: Date.now() / 1000 - 86400,
          revokedAt: null,
          cardNumber: 3,
        },
      ];

      setCards(mockCards);
    } catch (err: any) {
      console.error('Error fetching reputation cards:', err);
      setError(err.message || 'Failed to fetch reputation cards');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const activeCards = cards.filter(c => c.status === 'active');
    const avgRating = activeCards.length > 0
      ? activeCards.reduce((sum, c) => sum + c.rating, 0) / activeCards.length
      : 0;
    
    const cardsByType = activeCards.reduce((acc, card) => {
      acc[card.cardType] = (acc[card.cardType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { activeCards, avgRating, cardsByType };
  };

  if (!targetPublicKey) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p>Connect your wallet to view reputation cards</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p>Loading reputation cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fee',
        borderRadius: '8px',
        color: 'red',
      }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const { activeCards, avgRating, cardsByType } = calculateStats();

  return (
    <div>
      {/* Statistics */}
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid #ddd',
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Reputation Summary</h3>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9945FF' }}>
              {activeCards.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Active Cards</div>
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9945FF' }}>
              {avgRating.toFixed(1)} ⭐
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Average Rating</div>
          </div>
        </div>

        {Object.keys(cardsByType).length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <strong style={{ fontSize: '14px' }}>Cards by Type:</strong>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              {Object.entries(cardsByType).map(([type, count]) => (
                <span
                  key={type}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '16px',
                    fontSize: '13px',
                  }}
                >
                  {CARD_TYPE_ICONS[type]} {CARD_TYPE_LABELS[type]}: {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cards List */}
      <div>
        <h3 style={{ marginBottom: '15px' }}>Reputation Cards ({activeCards.length})</h3>
        
        {activeCards.length === 0 ? (
          <div style={{
            padding: '40px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666',
          }}>
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No reputation cards yet</p>
            <p style={{ fontSize: '14px' }}>
              Complete transactions to receive reputation cards from other users
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {activeCards.map((card) => (
              <div
                key={card.cardNumber}
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {CARD_TYPE_ICONS[card.cardType]}
                    </span>
                    <div>
                      <strong style={{ fontSize: '16px' }}>
                        {CARD_TYPE_LABELS[card.cardType]}
                      </strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Card #{card.cardNumber}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', color: '#FFB800' }}>
                      {'⭐'.repeat(card.rating)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {card.rating}/5
                    </div>
                  </div>
                </div>

                {card.message && (
                  <p style={{
                    margin: '15px 0',
                    padding: '15px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                  }}>
                    "{card.message}"
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #eee',
                  fontSize: '13px',
                  color: '#666',
                }}>
                  <div>
                    From: {card.issuer.toString().substring(0, 8)}...
                  </div>
                  <div>
                    {new Date(card.issuedAt * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReputationCards;
