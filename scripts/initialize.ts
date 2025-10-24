/**
 * Initialize TrustToken Program
 * 
 * This script initializes the TrustToken program by creating the program state account
 */

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import * as borsh from "borsh";

async function main() {
  console.log("\n🚀 Initialize TrustToken Program");
  console.log("═".repeat(60));

  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  const programId = new PublicKey("3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju");

  console.log("\n📋 Configuration:");
  console.log("  Program ID:", programId.toString());
  console.log("  Wallet:", wallet.publicKey.toString());

  // Derive program state PDA
  const [programStatePda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    programId
  );

  console.log("  Program State PDA:", programStatePda.toString());
  console.log("  Bump:", bump);

  // Check if already initialized
  const programStateInfo = await connection.getAccountInfo(programStatePda);
  
  if (programStateInfo) {
    console.log("\n✅ Program already initialized!");
    
    // Decode the data
    if (programStateInfo.data.length >= 48) {
      const authority = new PublicKey(programStateInfo.data.slice(8, 40));
      const totalMinted = programStateInfo.data.readBigUInt64LE(40);
      
      console.log("\n📊 Current Program State:");
      console.log("  Authority:", authority.toString());
      console.log("  Total Minted:", totalMinted.toString());
    }
    
    return;
  }

  console.log("\n🔄 Initializing program...");

  // Create the initialize instruction
  // Instruction discriminator for "initialize" (first 8 bytes of SHA256("global:initialize"))
  const discriminator = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]);
  
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: programStatePda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data: discriminator,
  });

  try {
    const tx = await provider.sendAndConfirm(
      new Transaction().add(instruction),
      []
    );

    console.log("✅ Program initialized successfully!");
    console.log("  Transaction:", tx);

    // Fetch and display the initialized state
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for confirmation
    
    const newProgramStateInfo = await connection.getAccountInfo(programStatePda);
    
    if (newProgramStateInfo && newProgramStateInfo.data.length >= 48) {
      const authority = new PublicKey(newProgramStateInfo.data.slice(8, 40));
      const totalMinted = newProgramStateInfo.data.readBigUInt64LE(40);
      
      console.log("\n📊 Initialized Program State:");
      console.log("  Authority:", authority.toString());
      console.log("  Total Minted:", totalMinted.toString());
    }

  } catch (error: any) {
    console.error("\n❌ Error initializing program:");
    console.error(error.message);
    
    if (error.logs) {
      console.log("\n📋 Transaction Logs:");
      error.logs.forEach((log: string) => console.log("  ", log));
    }
    
    throw error;
  }

  console.log("\n✅ Initialization complete!");
  console.log("  Program is now ready to mint TrustToken NFTs");
}

main()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
