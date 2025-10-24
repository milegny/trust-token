import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { TRUST_TOKEN_PROGRAM_ID } from '../config/constants';
import IDL from '../idl/trust_token.json';
import './MintButton.css';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const PROGRAM_ID = TRUST_TOKEN_PROGRAM_ID;

interface Props {
  onMintSuccess: () => void;
}

export const MintButton: React.FC<Props> = ({ onMintSuccess }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const mintTrustToken = async () => {
    if (!publicKey || !wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setMinting(true);
    setError(null);
    setSuccess(false);
    setTxSignature(null);

    try {
      // Create Anchor provider
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
      );

      // Create program instance
      const program = new Program(IDL as any, provider);

      // Derive program state PDA
      const [programStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('program_state')],
        PROGRAM_ID
      );

      // Check if program is initialized
      const programStateInfo = await connection.getAccountInfo(programStatePda);
      if (!programStateInfo) {
        throw new Error('Program not initialized. Please contact support.');
      }

      // Generate new mint keypair
      const mint = Keypair.generate();

      // Derive PDAs
      const [trustTokenPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('trust_token'), mint.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const tokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        publicKey
      );

      const [metadataPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const [masterEditionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
          Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      // NFT metadata
      const name = `Trust Token #${Date.now()}`;
      const symbol = 'TRUST';
      const uri = 'https://arweave.net/trust-token-metadata';

      // Call the mint instruction using Anchor
      const signature = await program.methods
        .mint(name, symbol, uri)
        .accounts({
          minter: publicKey,
          programState: programStatePda,
          mint: mint.publicKey,
          tokenAccount: tokenAccount,
          trustToken: trustTokenPda,
          metadata: metadataPda,
          masterEdition: masterEditionPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      setSuccess(true);
      setTxSignature(signature);
      
      // Call success callback after a short delay
      setTimeout(() => {
        onMintSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('Error minting TrustToken:', err);
      setError(err.message || 'Failed to mint TrustToken');
    } finally {
      setMinting(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="mint-button-container">
        <button className="mint-button disabled" disabled>
          Connect Wallet to Get TrustToken
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mint-button-container">
        <div className="success-message-box">
          <div className="success-icon">🎉</div>
          <h3>TrustToken Minted Successfully!</h3>
          <p>Your verification NFT has been created.</p>
          {txSignature && (
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              View Transaction →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mint-button-container">
      <button
        className={`mint-button ${minting ? 'minting' : ''}`}
        onClick={mintTrustToken}
        disabled={minting}
      >
        {minting ? (
          <>
            <span className="spinner-small"></span>
            Minting TrustToken...
          </>
        ) : (
          '🎫 Get Your TrustToken'
        )}
      </button>

      {error && (
        <div className="error-message-box">
          <p>❌ {error}</p>
          <button onClick={mintTrustToken} className="retry-small">
            Try Again
          </button>
        </div>
      )}

      <div className="mint-info">
        <p className="info-text">
          ℹ️ This will create a verification NFT that allows you to sell on The Bit Central marketplace.
        </p>
        <p className="cost-text">
          Cost: ~0.02 SOL (transaction fees)
        </p>
      </div>
    </div>
  );
};
