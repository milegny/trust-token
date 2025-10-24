import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TRUST_TOKEN_PROGRAM_ID } from '../config/constants';
import './TrustTokenDisplay.css';

interface TrustTokenData {
  owner: string;
  mint: string;
  isVerified: boolean;
  mintedAt: Date;
}

export const TrustTokenDisplay: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [trustToken, setTrustToken] = useState<TrustTokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PROGRAM_ID = TRUST_TOKEN_PROGRAM_ID;

  useEffect(() => {
    if (!publicKey) {
      setTrustToken(null);
      return;
    }

    checkForTrustToken();
  }, [publicKey, connection]);

  const checkForTrustToken = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      // Derive program state PDA
      const [programStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_state')],
        PROGRAM_ID
      );

      // Check if program is initialized
      const programStateInfo = await connection.getAccountInfo(programStatePda);
      
      if (!programStateInfo) {
        setError('Program not initialized');
        setLoading(false);
        return;
      }

      // Get all TrustToken accounts owned by this program
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: publicKey.toBase58(),
            },
          },
        ],
      });

      if (accounts.length > 0) {
        // Found a TrustToken for this user
        const accountData = accounts[0].account.data;
        
        // Decode the data
        const owner = new PublicKey(accountData.slice(8, 40));
        const mint = new PublicKey(accountData.slice(40, 72));
        const isVerified = accountData[72] === 1;
        const mintedAt = new Date(Number(accountData.readBigInt64LE(73)) * 1000);

        setTrustToken({
          owner: owner.toBase58(),
          mint: mint.toBase58(),
          isVerified,
          mintedAt,
        });
      } else {
        setTrustToken(null);
      }
    } catch (err: any) {
      console.error('Error checking for TrustToken:', err);
      setError(err.message || 'Failed to check for TrustToken');
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="trust-token-display">
        <div className="info-box">
          <p>👛 Connect your wallet to check your TrustToken status</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="trust-token-display">
        <div className="info-box">
          <div className="spinner"></div>
          <p>Checking for TrustToken...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trust-token-display">
        <div className="error-box">
          <p>❌ Error: {error}</p>
          <button onClick={checkForTrustToken} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (trustToken) {
    return (
      <div className="trust-token-display">
        <div className="success-box">
          <div className="nft-badge">
            <div className="badge-icon">✅</div>
            <h2>TrustToken NFT</h2>
          </div>
          
          <div className="token-details">
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className={`status ${trustToken.isVerified ? 'verified' : 'not-verified'}`}>
                {trustToken.isVerified ? '✅ Verified' : '❌ Not Verified'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="label">Mint:</span>
              <span className="value mono">{trustToken.mint.slice(0, 8)}...{trustToken.mint.slice(-8)}</span>
            </div>
            
            <div className="detail-row">
              <span className="label">Minted:</span>
              <span className="value">{trustToken.mintedAt.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="marketplace-status">
            {trustToken.isVerified ? (
              <p className="success-message">
                🎉 You can now sell on The Bit Central marketplace!
              </p>
            ) : (
              <p className="warning-message">
                ⚠️ Your verification has been revoked. Contact support.
              </p>
            )}
          </div>

          <a 
            href={`https://explorer.solana.com/address/${trustToken.mint}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-link"
          >
            View on Solana Explorer →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="trust-token-display">
      <div className="info-box">
        <p>📭 You don't have a TrustToken yet</p>
        <p className="subtitle">Get verified to start selling on The Bit Central!</p>
      </div>
    </div>
  );
};
