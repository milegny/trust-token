import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import idl from '../idl/trust_token.json';

const PROGRAM_ID = new PublicKey(idl.address);

interface TrustTokenData {
  owner: PublicKey;
  mint: PublicKey;
  isVerified: boolean;
  mintedAt: number;
  isSoulbound: boolean;
}

const SoulboundTokenDisplay: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const [trustToken, setTrustToken] = useState<TrustTokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      checkTrustToken();
    } else {
      setTrustToken(null);
    }
  }, [publicKey]);

  const checkTrustToken = async () => {
    if (!publicKey || !wallet) return;

    try {
      setLoading(true);
      setError(null);

      const provider = new AnchorProvider(
        connection,
        wallet.adapter as any,
        { commitment: 'confirmed' }
      );
      const program = new Program(idl as any, provider);

      // Get all token accounts owned by the user
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkgQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      // Check each token account for TrustToken
      for (const { account } of tokenAccounts.value) {
        const parsedInfo = account.data.parsed.info;
        const mint = new PublicKey(parsedInfo.mint);

        try {
          // Derive TrustToken PDA
          const [trustTokenPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('trust_token'), mint.toBuffer()],
            PROGRAM_ID
          );

          // Try to fetch the TrustToken account
          const trustTokenAccount = await program.account.trustToken.fetch(trustTokenPDA);

          if (trustTokenAccount.owner.toString() === publicKey.toString()) {
            // Check if token is frozen (soulbound)
            const isFrozen = parsedInfo.state === 'frozen';

            setTrustToken({
              owner: trustTokenAccount.owner,
              mint: trustTokenAccount.mint,
              isVerified: trustTokenAccount.isVerified,
              mintedAt: trustTokenAccount.mintedAt.toNumber(),
              isSoulbound: isFrozen,
            });
            break;
          }
        } catch {
          // Not a TrustToken, continue
          continue;
        }
      }
    } catch (err: any) {
      console.error('Error checking TrustToken:', err);
      setError(err.message || 'Failed to check TrustToken');
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
        <p>Connect your wallet to view your TrustToken</p>
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
        <p>Checking for TrustToken...</p>
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

  if (!trustToken) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <p>No TrustToken found</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          Mint a TrustToken to become a verified seller
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '2px solid #9945FF',
      boxShadow: '0 4px 12px rgba(153, 69, 255, 0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ fontSize: '32px', marginRight: '10px' }}>🎫</span>
        <h3 style={{ margin: 0 }}>Your TrustToken</h3>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ marginRight: '10px' }}>Status:</strong>
          {trustToken.isVerified ? (
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#14F195',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              ✓ Verified
            </span>
          ) : (
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#ff4444',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              ✗ Not Verified
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ marginRight: '10px' }}>Type:</strong>
          {trustToken.isSoulbound ? (
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#9945FF',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              🔒 Soulbound
            </span>
          ) : (
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#666',
              color: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              Transferable
            </span>
          )}
        </div>
      </div>

      <div style={{
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        fontSize: '14px',
      }}>
        <p style={{ margin: '5px 0' }}>
          <strong>Mint:</strong>{' '}
          <a
            href={`https://explorer.solana.com/address/${trustToken.mint.toString()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#9945FF', textDecoration: 'none' }}
          >
            {trustToken.mint.toString().substring(0, 8)}...
          </a>
        </p>
        <p style={{ margin: '5px 0' }}>
          <strong>Minted:</strong> {new Date(trustToken.mintedAt * 1000).toLocaleDateString()}
        </p>
      </div>

      {trustToken.isSoulbound && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f0f0ff',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666',
        }}>
          <p style={{ margin: 0 }}>
            🔒 This token is <strong>soulbound</strong> - it cannot be transferred or sold.
            It is permanently linked to your wallet as proof of your verified identity.
          </p>
        </div>
      )}
    </div>
  );
};

export default SoulboundTokenDisplay;
