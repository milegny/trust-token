import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { 
  TRUST_TOKEN_PROGRAM_ID, 
  REPUTATION_CARD_PROGRAM_ID,
  SOLANA_RPC_URL 
} from '../config/constants';

/**
 * Result of program verification
 */
export interface ProgramVerificationResult {
  programId: string;
  programName: string;
  isAccessible: boolean;
  isDeployed: boolean;
  hasExecutableData: boolean;
  owner?: string;
  dataLength?: number;
  error?: string;
}

/**
 * Verify that a program is deployed and accessible on the network
 */
export async function verifyProgram(
  connection: Connection,
  programId: PublicKey,
  programName: string
): Promise<ProgramVerificationResult> {
  const result: ProgramVerificationResult = {
    programId: programId.toString(),
    programName,
    isAccessible: false,
    isDeployed: false,
    hasExecutableData: false,
  };

  try {
    // Check if program account exists
    const accountInfo = await connection.getAccountInfo(programId);
    
    if (!accountInfo) {
      result.error = 'Program account not found';
      return result;
    }

    result.isAccessible = true;
    result.isDeployed = true;
    result.hasExecutableData = accountInfo.executable;
    result.owner = accountInfo.owner.toString();
    result.dataLength = accountInfo.data.length;

    if (!accountInfo.executable) {
      result.error = 'Program account exists but is not executable';
    }

    return result;
  } catch (error: any) {
    result.error = error.message || 'Unknown error occurred';
    return result;
  }
}

/**
 * Verify both TrustToken and ReputationCard programs
 */
export async function verifyAllPrograms(
  connection?: Connection
): Promise<{
  trustToken: ProgramVerificationResult;
  reputationCard: ProgramVerificationResult;
  allAccessible: boolean;
}> {
  const conn = connection || new Connection(SOLANA_RPC_URL, 'confirmed');

  const trustToken = await verifyProgram(
    conn,
    TRUST_TOKEN_PROGRAM_ID,
    'TrustToken'
  );

  const reputationCard = await verifyProgram(
    conn,
    REPUTATION_CARD_PROGRAM_ID,
    'ReputationCard'
  );

  return {
    trustToken,
    reputationCard,
    allAccessible: trustToken.isAccessible && reputationCard.isAccessible,
  };
}

/**
 * Check if TrustToken program is initialized
 */
export async function isTrustTokenInitialized(
  connection: Connection
): Promise<boolean> {
  try {
    const [programStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      TRUST_TOKEN_PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(programStatePDA);
    return accountInfo !== null;
  } catch (error) {
    console.error('Error checking TrustToken initialization:', error);
    return false;
  }
}

/**
 * Check if ReputationCard program is initialized
 */
export async function isReputationCardInitialized(
  connection: Connection
): Promise<boolean> {
  try {
    const [programStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      REPUTATION_CARD_PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(programStatePDA);
    return accountInfo !== null;
  } catch (error) {
    console.error('Error checking ReputationCard initialization:', error);
    return false;
  }
}

/**
 * Get comprehensive program status
 */
export async function getProgramStatus(
  connection?: Connection
): Promise<{
  programs: {
    trustToken: ProgramVerificationResult;
    reputationCard: ProgramVerificationResult;
  };
  initialization: {
    trustToken: boolean;
    reputationCard: boolean;
  };
  ready: boolean;
}> {
  const conn = connection || new Connection(SOLANA_RPC_URL, 'confirmed');

  const programs = await verifyAllPrograms(conn);
  
  const trustTokenInit = await isTrustTokenInitialized(conn);
  const reputationCardInit = await isReputationCardInitialized(conn);

  return {
    programs: {
      trustToken: programs.trustToken,
      reputationCard: programs.reputationCard,
    },
    initialization: {
      trustToken: trustTokenInit,
      reputationCard: reputationCardInit,
    },
    ready: 
      programs.allAccessible && 
      trustTokenInit && 
      reputationCardInit,
  };
}

/**
 * Format program verification result for display
 */
export function formatVerificationResult(
  result: ProgramVerificationResult
): string {
  if (!result.isAccessible) {
    return `❌ ${result.programName}: Not accessible - ${result.error}`;
  }
  
  if (!result.hasExecutableData) {
    return `⚠️  ${result.programName}: Deployed but not executable`;
  }
  
  return `✅ ${result.programName}: Deployed and accessible`;
}

/**
 * Log program status to console
 */
export async function logProgramStatus(connection?: Connection): Promise<void> {
  console.log('🔍 Verifying Solana Programs...');
  console.log('================================');
  
  const status = await getProgramStatus(connection);
  
  console.log('\n📦 Program Deployment:');
  console.log(formatVerificationResult(status.programs.trustToken));
  console.log(formatVerificationResult(status.programs.reputationCard));
  
  console.log('\n🔧 Program Initialization:');
  console.log(`TrustToken: ${status.initialization.trustToken ? '✅ Initialized' : '❌ Not initialized'}`);
  console.log(`ReputationCard: ${status.initialization.reputationCard ? '✅ Initialized' : '❌ Not initialized'}`);
  
  console.log('\n🚀 Overall Status:');
  console.log(status.ready ? '✅ All programs ready' : '⚠️  Some programs not ready');
  console.log('================================\n');
}
