import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { REPUTATION_CARD_PROGRAM_ID, CARD_TYPE_LABELS, CARD_TYPE_ICONS, CardType } from '../config/constants';
import { createReputationCard } from '../services/reputationService';
import reputationCardIdl from '../idl/reputation_card.json';

interface LeaveReputationProps {
  recipientWallet: string;
  recipientName: string;
  orderId: string;
  productName: string;
  onSubmit: () => void;
  onSkip: () => void;
}

const LeaveReputation: React.FC<LeaveReputationProps> = ({
  recipientWallet,
  recipientName,
  orderId,
  productName,
  onSubmit,
  onSkip,
}) => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [selectedType, setSelectedType] = useState<CardType | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardTypes = Object.values(CardType);

  const handleSubmit = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet');
      return;
    }

    if (!selectedType) {
      setError('Please select a card type');
      return;
    }

    if (message.length > 500) {
      setError('Message must be 500 characters or less');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create Anchor provider
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions: async (txs) => txs } as any,
        { commitment: 'confirmed' }
      );

      // Create program instance
      const program = new Program(reputationCardIdl as any, provider);

      // Get program state PDA
      const [programStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_state')],
        REPUTATION_CARD_PROGRAM_ID
      );

      // Get program state to get card number
      const programState = await program.account.programState.fetch(programStatePDA);
      const cardNumber = programState.totalCardsIssued;

      // Get reputation card PDA
      const recipientPubkey = new PublicKey(recipientWallet);
      const [reputationCardPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('reputation_card'),
          publicKey.toBuffer(),
          recipientPubkey.toBuffer(),
          cardNumber.toArrayLike(Buffer, 'le', 8),
        ],
        REPUTATION_CARD_PROGRAM_ID
      );

      // Convert card type to program format
      const cardTypeObj = { [selectedType]: {} };

      // Create the reputation card on-chain
      const tx = await program.methods
        .createCard(cardTypeObj, message, rating)
        .accounts({
          issuer: publicKey,
          recipient: recipientPubkey,
          programState: programStatePDA,
          reputationCard: reputationCardPDA,
          systemProgram: PublicKey.default,
        })
        .rpc();

      console.log('Reputation card created:', tx);

      // Record in backend
      await createReputationCard({
        issuerWallet: publicKey.toString(),
        recipientWallet,
        cardType: selectedType,
        message,
        rating,
        txSignature: tx,
      });

      onSubmit();
    } catch (err: any) {
      console.error('Error creating reputation card:', err);
      setError(err.message || 'Failed to create reputation card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Leave a Reputation Card</h2>
          <p style={styles.subtitle}>
            Share your experience with <strong>{recipientName}</strong>
          </p>
          <p style={styles.productInfo}>
            Product: <em>{productName}</em>
          </p>
        </div>

        {/* Card Type Selection */}
        <div style={styles.section}>
          <label style={styles.label}>
            Select Card Type <span style={styles.required}>*</span>
          </label>
          <div style={styles.cardTypeGrid}>
            {cardTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  ...styles.cardTypeButton,
                  ...(selectedType === type ? styles.cardTypeButtonSelected : {}),
                }}
              >
                <span style={styles.cardTypeIcon}>
                  {CARD_TYPE_ICONS[type]}
                </span>
                <span style={styles.cardTypeLabel}>
                  {CARD_TYPE_LABELS[type]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Rating Selection */}
        <div style={styles.section}>
          <label style={styles.label}>
            Rating <span style={styles.required}>*</span>
          </label>
          <div style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={styles.starButton}
              >
                <span
                  style={{
                    fontSize: '32px',
                    color: star <= rating ? '#fbbf24' : '#e5e7eb',
                    transition: 'color 0.2s',
                  }}
                >
                  ⭐
                </span>
              </button>
            ))}
            <span style={styles.ratingLabel}>{rating} / 5</span>
          </div>
        </div>

        {/* Message */}
        <div style={styles.section}>
          <label style={styles.label}>
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your experience with this seller..."
            maxLength={500}
            rows={4}
            style={styles.textarea}
          />
          <div style={styles.charCount}>
            {message.length} / 500 characters
          </div>
        </div>

        {/* Preview */}
        {selectedType && (
          <div style={styles.preview}>
            <h3 style={styles.previewTitle}>Preview</h3>
            <div style={styles.previewCard}>
              <div style={styles.previewHeader}>
                <span style={styles.previewIcon}>
                  {CARD_TYPE_ICONS[selectedType]}
                </span>
                <span style={styles.previewType}>
                  {CARD_TYPE_LABELS[selectedType]}
                </span>
              </div>
              <div style={styles.previewRating}>
                {'⭐'.repeat(rating)}
              </div>
              {message && (
                <div style={styles.previewMessage}>
                  "{message}"
                </div>
              )}
              <div style={styles.previewFooter}>
                <span>From: You</span>
                <span>To: {recipientName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={styles.error}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedType}
            style={{
              ...styles.primaryButton,
              ...(loading || !selectedType ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Creating Card...' : 'Submit Reputation Card'}
          </button>
          <button
            onClick={onSkip}
            disabled={loading}
            style={styles.secondaryButton}
          >
            Skip for Now
          </button>
        </div>

        {/* Info */}
        <div style={styles.info}>
          <p style={styles.infoText}>
            ℹ️ Reputation cards are stored on the Solana blockchain and cannot be edited once created.
            You can revoke them later if needed.
          </p>
        </div>
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
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    color: '#6b7280',
  },
  productInfo: {
    margin: '0',
    fontSize: '14px',
    color: '#9ca3af',
  },
  section: {
    marginBottom: '30px',
  },
  label: {
    display: 'block',
    marginBottom: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#ef4444',
  },
  cardTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px',
  },
  cardTypeButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cardTypeButtonSelected: {
    borderColor: '#9945FF',
    backgroundColor: '#f3e8ff',
  },
  cardTypeIcon: {
    fontSize: '32px',
  },
  cardTypeLabel: {
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  ratingLabel: {
    marginLeft: '12px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  charCount: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'right',
  },
  preview: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  previewTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  previewCard: {
    padding: '16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  previewIcon: {
    fontSize: '24px',
  },
  previewType: {
    fontSize: '16px',
    fontWeight: '600',
  },
  previewRating: {
    fontSize: '18px',
    marginBottom: '12px',
  },
  previewMessage: {
    fontSize: '14px',
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: '12px',
    lineHeight: '1.6',
  },
  previewFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#9ca3af',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#fee',
    color: '#dc2626',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '20px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  primaryButton: {
    padding: '15px',
    backgroundColor: '#9945FF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    padding: '15px',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
  },
  info: {
    padding: '15px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
  },
  infoText: {
    margin: 0,
    fontSize: '13px',
    color: '#1e40af',
    lineHeight: '1.6',
  },
};

export default LeaveReputation;
