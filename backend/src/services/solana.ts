import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import idl from '../idl/trust_token.json';

const PROGRAM_ID = new PublicKey(process.env.TRUST_TOKEN_PROGRAM_ID || '3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export class SolanaService {
  private connection: Connection;
  private program: Program | null = null;

  constructor() {
    this.connection = new Connection(RPC_URL, 'confirmed');
  }

  getConnection(): Connection {
    return this.connection;
  }

  async getProgram(wallet?: Wallet): Promise<Program> {
    if (!wallet) {
      // Create a dummy wallet for read-only operations
      const dummyKeypair = Keypair.generate();
      wallet = {
        publicKey: dummyKeypair.publicKey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      };
    }

    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });

    return new Program(idl as any, provider);
  }

  async getTrustTokenPDA(mint: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('trust_token'), mint.toBuffer()],
      PROGRAM_ID
    );
  }

  async getProgramStatePDA(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      PROGRAM_ID
    );
  }

  async verifyTrustToken(mintAddress: string): Promise<{
    exists: boolean;
    isVerified: boolean;
    owner?: string;
    mintedAt?: Date;
  }> {
    try {
      const mint = new PublicKey(mintAddress);
      const [trustTokenPDA] = await this.getTrustTokenPDA(mint);
      
      const program = await this.getProgram();
      const trustTokenAccount = await program.account.trustToken.fetch(trustTokenPDA);

      return {
        exists: true,
        isVerified: trustTokenAccount.isVerified,
        owner: trustTokenAccount.owner.toString(),
        mintedAt: new Date(trustTokenAccount.mintedAt.toNumber() * 1000),
      };
    } catch (error) {
      console.error('Error verifying trust token:', error);
      return {
        exists: false,
        isVerified: false,
      };
    }
  }

  async getUserTrustToken(walletAddress: string): Promise<{
    hasTrustToken: boolean;
    mintAddress?: string;
    isVerified?: boolean;
  }> {
    try {
      const wallet = new PublicKey(walletAddress);
      
      // Get all token accounts owned by the wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(wallet, {
        programId: new PublicKey('TokenkgQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      // Check each token account for TrustToken
      for (const { account } of tokenAccounts.value) {
        const parsedInfo = account.data.parsed.info;
        const mint = new PublicKey(parsedInfo.mint);
        
        try {
          const [trustTokenPDA] = await this.getTrustTokenPDA(mint);
          const program = await this.getProgram();
          const trustTokenAccount = await program.account.trustToken.fetch(trustTokenPDA);

          if (trustTokenAccount.owner.toString() === walletAddress) {
            return {
              hasTrustToken: true,
              mintAddress: mint.toString(),
              isVerified: trustTokenAccount.isVerified,
            };
          }
        } catch {
          // Not a TrustToken, continue
          continue;
        }
      }

      return { hasTrustToken: false };
    } catch (error) {
      console.error('Error getting user trust token:', error);
      return { hasTrustToken: false };
    }
  }

  async getProgramStats(): Promise<{
    totalMinted: number;
    authority: string;
  }> {
    try {
      const [programStatePDA] = await this.getProgramStatePDA();
      const program = await this.getProgram();
      const programState = await program.account.programState.fetch(programStatePDA);

      return {
        totalMinted: programState.totalMinted.toNumber(),
        authority: programState.authority.toString(),
      };
    } catch (error) {
      console.error('Error getting program stats:', error);
      throw error;
    }
  }

  async getTransactionDetails(signature: string): Promise<any> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      return tx;
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }
}

export default new SolanaService();
