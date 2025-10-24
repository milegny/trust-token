import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

const CARD_TYPES = [
  { value: 'trustworthy', label: 'Trustworthy', icon: '🤝' },
  { value: 'qualityProducts', label: 'Quality Products', icon: '⭐' },
  { value: 'fastShipping', label: 'Fast Shipping', icon: '🚀' },
  { value: 'goodCommunication', label: 'Good Communication', icon: '💬' },
  { value: 'fairPricing', label: 'Fair Pricing', icon: '💰' },
  { value: 'reliable', label: 'Reliable', icon: '✅' },
  { value: 'professional', label: 'Professional', icon: '👔' },
  { value: 'responsive', label: 'Responsive', icon: '⚡' },
];

const RequestRecommendation: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, sendTransaction } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [cardType, setCardType] = useState('trustworthy');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !wallet) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validate recipient address
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipientAddress);
      } catch {
        throw new Error('Invalid recipient address');
      }

      // Validate message length
      if (message.length > 500) {
        throw new Error('Message must be 500 characters or less');
      }

      // TODO: Replace with actual reputation_card program interaction
      // const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: 'confirmed' });
      // const program = new Program(reputationCardIdl, provider);
      
      // const tx = await program.methods
      //   .createCard(
      //     { [cardType]: {} },
      //     message,
      //     rating
      //   )
      //   .accounts({
      //     issuer: publicKey,
      //     recipient: recipientPubkey,
      //     // ... other accounts
      //   })
      //   .rpc();

      // For demonstration, simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess(true);
      setRecipientAddress('');
      setMessage('');
      setRating(5);
      setCardType('trustworthy');

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error issuing reputation card:', err);
      setError(err.message || 'Failed to issue reputation card');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p>Connect your wallet to issue reputation cards</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #ddd',
    }}>
      <h3 style={{ margin: '0 0 20px 0' }}>Issue Reputation Card</h3>

      {success && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          ✅ Reputation card issued successfully!
        </div>
      )}

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Recipient Address */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}>
            Recipient Wallet Address *
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter recipient's Solana wallet address"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace',
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
            The wallet address of the user you want to recommend
          </p>
        </div>

        {/* Card Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}>
            Reputation Type *
          </label>
          <select
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
            }}
          >
            {CARD_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}>
            Rating *
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  fontSize: '32px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  opacity: star <= rating ? 1 : 0.3,
                  transition: 'opacity 0.2s',
                }}
              >
                ⭐
              </button>
            ))}
            <span style={{ marginLeft: '10px', fontSize: '18px', fontWeight: 'bold' }}>
              {rating}/5
            </span>
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}>
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your experience with this user..."
            maxLength={500}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0', textAlign: 'right' }}>
            {message.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !recipientAddress}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading || !recipientAddress ? '#ccc' : '#9945FF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading || !recipientAddress ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? 'Issuing Card...' : 'Issue Reputation Card'}
        </button>
      </form>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f0f0ff',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#666',
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>ℹ️ About Reputation Cards</p>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Cards are stored on-chain and cannot be edited</li>
          <li>You can revoke cards you've issued</li>
          <li>Recipients can dispute cards</li>
          <li>Cards help build trust in the marketplace</li>
        </ul>
      </div>
    </div>
  );
};

export default RequestRecommendation;
