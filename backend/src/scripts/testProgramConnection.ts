#!/usr/bin/env node

/**
 * Test script to verify connection to both Solana programs
 * Run with: ts-node backend/src/scripts/testProgramConnection.ts
 */

import { Connection } from '@solana/web3.js';
import { 
  SOLANA_RPC_URL,
  TRUST_TOKEN_PROGRAM_ID,
  REPUTATION_CARD_PROGRAM_ID,
  PROGRAM_IDS 
} from '../config/constants';
import { 
  getProgramStatus,
  logProgramStatus 
} from '../utils/programVerification';

async function main() {
  console.log('🚀 Testing Solana Program Connections');
  console.log('=====================================\n');

  console.log('📡 Network Configuration:');
  console.log(`RPC URL: ${SOLANA_RPC_URL}`);
  console.log('');

  console.log('📋 Program IDs:');
  console.log(`TrustToken: ${PROGRAM_IDS.TRUST_TOKEN}`);
  console.log(`ReputationCard: ${PROGRAM_IDS.REPUTATION_CARD}`);
  console.log('');

  // Create connection
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

  // Test connection
  console.log('🔌 Testing RPC Connection...');
  try {
    const version = await connection.getVersion();
    console.log(`✅ Connected to Solana RPC`);
    console.log(`   Version: ${version['solana-core']}`);
    console.log('');
  } catch (error: any) {
    console.error('❌ Failed to connect to RPC:', error.message);
    process.exit(1);
  }

  // Check program status
  await logProgramStatus(connection);

  // Get detailed status
  const status = await getProgramStatus(connection);

  // Test TrustToken program
  console.log('🧪 Testing TrustToken Program:');
  console.log('------------------------------');
  if (status.programs.trustToken.isAccessible) {
    console.log('✅ Program is accessible');
    console.log(`   Owner: ${status.programs.trustToken.owner}`);
    console.log(`   Data Length: ${status.programs.trustToken.dataLength} bytes`);
    console.log(`   Executable: ${status.programs.trustToken.hasExecutableData}`);
    
    if (status.initialization.trustToken) {
      console.log('✅ Program is initialized');
      
      // Try to fetch program state
      try {
        const [programStatePDA] = await import('@solana/web3.js').then(m => 
          m.PublicKey.findProgramAddressSync(
            [Buffer.from('program_state')],
            TRUST_TOKEN_PROGRAM_ID
          )
        );
        
        const accountInfo = await connection.getAccountInfo(programStatePDA);
        if (accountInfo) {
          console.log(`   Program State PDA: ${programStatePDA.toString()}`);
          console.log(`   State Account Size: ${accountInfo.data.length} bytes`);
        }
      } catch (error: any) {
        console.log(`⚠️  Could not fetch program state: ${error.message}`);
      }
    } else {
      console.log('⚠️  Program is not initialized');
      console.log('   Run initialization script to set up the program');
    }
  } else {
    console.log('❌ Program is not accessible');
    console.log(`   Error: ${status.programs.trustToken.error}`);
  }
  console.log('');

  // Test ReputationCard program
  console.log('🧪 Testing ReputationCard Program:');
  console.log('----------------------------------');
  if (status.programs.reputationCard.isAccessible) {
    console.log('✅ Program is accessible');
    console.log(`   Owner: ${status.programs.reputationCard.owner}`);
    console.log(`   Data Length: ${status.programs.reputationCard.dataLength} bytes`);
    console.log(`   Executable: ${status.programs.reputationCard.hasExecutableData}`);
    console.log(`   Balance: ${(status.programs.reputationCard.lamports! / 1e9).toFixed(4)} SOL`);
    
    if (status.initialization.reputationCard) {
      console.log('✅ Program is initialized');
      
      // Try to fetch program state
      try {
        const [programStatePDA] = await import('@solana/web3.js').then(m => 
          m.PublicKey.findProgramAddressSync(
            [Buffer.from('program_state')],
            REPUTATION_CARD_PROGRAM_ID
          )
        );
        
        const accountInfo = await connection.getAccountInfo(programStatePDA);
        if (accountInfo) {
          console.log(`   Program State PDA: ${programStatePDA.toString()}`);
          console.log(`   State Account Size: ${accountInfo.data.length} bytes`);
        }
      } catch (error: any) {
        console.log(`⚠️  Could not fetch program state: ${error.message}`);
      }
    } else {
      console.log('⚠️  Program is not initialized');
      console.log('   Run initialization script to set up the program');
    }
  } else {
    console.log('❌ Program is not accessible');
    console.log(`   Error: ${status.programs.reputationCard.error}`);
  }
  console.log('');

  // Final summary
  console.log('📊 Summary:');
  console.log('-----------');
  console.log(`TrustToken: ${status.programs.trustToken.isAccessible ? '✅' : '❌'} Accessible, ${status.initialization.trustToken ? '✅' : '❌'} Initialized`);
  console.log(`ReputationCard: ${status.programs.reputationCard.isAccessible ? '✅' : '❌'} Accessible, ${status.initialization.reputationCard ? '✅' : '❌'} Initialized`);
  console.log('');

  if (status.ready) {
    console.log('🎉 All programs are ready!');
    console.log('   The backend can now interact with both programs.');
    process.exit(0);
  } else {
    console.log('⚠️  Not all programs are ready.');
    console.log('   Some features may not work correctly.');
    console.log('');
    console.log('📝 Next Steps:');
    if (!status.programs.trustToken.isAccessible) {
      console.log('   - Deploy TrustToken program to devnet');
    } else if (!status.initialization.trustToken) {
      console.log('   - Initialize TrustToken program');
    }
    if (!status.programs.reputationCard.isAccessible) {
      console.log('   - Deploy ReputationCard program to devnet');
    } else if (!status.initialization.reputationCard) {
      console.log('   - Initialize ReputationCard program');
    }
    process.exit(1);
  }
}

// Run the test
main().catch((error) => {
  console.error('💥 Test failed with error:');
  console.error(error);
  process.exit(1);
});
