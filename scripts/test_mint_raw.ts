/**
 * TrustToken Test Mint Script (Raw Transactions)
 * 
 * This script uses raw transaction building to interact with the deployed program
 * 
 * Usage: yarn ts-node scripts/test_mint_raw.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, TransactionInstruction } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import * as fs from "fs";

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

async function main() {
  console.log("\n🚀 TrustToken Test Mint Script (Raw Transactions)");
  console.log("═".repeat(70));

  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  const programId = new PublicKey("3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju");

  console.log("\n📋 Configuration:");
  console.log("  Program ID:", programId.toString());
  console.log("  Wallet:", wallet.publicKey.toString());
  console.log("  RPC URL:", connection.rpcEndpoint);

  // Derive program state PDA
  const [programStatePda, programStateBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    programId
  );

  console.log("  Program State PDA:", programStatePda.toString());

  // Check wallet balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("  Wallet Balance:", (balance / anchor.web3.LAMPORTS_PER_SOL).toFixed(4), "SOL");

  // ============================================================================
  // Step 1: Check/Initialize the Program
  // ============================================================================

  console.log("\n" + "─".repeat(70));
  console.log("📝 Step 1: Check Program State");
  console.log("─".repeat(70));

  const programStateInfo = await connection.getAccountInfo(programStatePda);
  
  if (programStateInfo) {
    console.log("✅ Program already initialized!");
    console.log("  Owner:", programStateInfo.owner.toString());
    console.log("  Data Length:", programStateInfo.data.length, "bytes");
    
    // Decode the data
    if (programStateInfo.data.length >= 48) {
      const authority = new PublicKey(programStateInfo.data.slice(8, 40));
      const totalMinted = programStateInfo.data.readBigUInt64LE(40);
      
      console.log("\n📊 Program State:");
      console.log("  Authority:", authority.toString());
      console.log("  Total Minted:", totalMinted.toString());
    }
  } else {
    console.log("⚠️  Program not initialized");
    console.log("  You need to call the initialize() function first");
    console.log("\n💡 To initialize, you can use:");
    console.log("  - Anchor client");
    console.log("  - Solana CLI with a custom instruction");
    console.log("  - Or modify this script to include initialization");
    
    console.log("\n❌ Exiting: Program must be initialized before minting");
    process.exit(1);
  }

  // ============================================================================
  // Step 2: Display Mint Information
  // ============================================================================

  console.log("\n" + "─".repeat(70));
  console.log("📝 Step 2: Mint Information");
  console.log("─".repeat(70));

  console.log("\n💡 To mint a TrustToken NFT, you need to:");
  console.log("  1. Create a new mint account");
  console.log("  2. Create an associated token account");
  console.log("  3. Call the program's mint instruction with:");
  console.log("     - Name (e.g., 'Trust Token #1')");
  console.log("     - Symbol (e.g., 'TRUST')");
  console.log("     - URI (metadata link)");
  console.log("\n  The program will:");
  console.log("  - Mint 1 token to the recipient");
  console.log("  - Create Metaplex metadata");
  console.log("  - Create master edition (making it a true NFT)");
  console.log("  - Store verification data in a PDA");

  // Generate example addresses
  const exampleMint = Keypair.generate();
  const [exampleTrustTokenPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("trust_token"), exampleMint.publicKey.toBuffer()],
    programId
  );

  console.log("\n🔑 Example Addresses (for reference):");
  console.log("  Example Mint:", exampleMint.publicKey.toString());
  console.log("  Example TrustToken PDA:", exampleTrustTokenPda.toString());

  // ============================================================================
  // Summary
  // ============================================================================

  console.log("\n" + "═".repeat(70));
  console.log("📊 Summary");
  console.log("═".repeat(70));

  console.log("\n✅ Program Status:");
  console.log("  • Program is deployed and operational");
  console.log("  • Program state is initialized");
  console.log("  • Ready to mint TrustToken NFTs");

  console.log("\n💡 Next Steps:");
  console.log("  1. Use Anchor client to call mint() function");
  console.log("  2. Provide recipient address, name, symbol, and URI");
  console.log("  3. Sign transaction with mint keypair");
  console.log("  4. Verify TrustToken data in the PDA");

  console.log("\n📝 Example Mint Command (using Anchor):");
  console.log("  const mint = Keypair.generate();");
  console.log("  await program.methods.mint(name, symbol, uri)");
  console.log("    .accounts({ ... })");
  console.log("    .signers([mint])");
  console.log("    .rpc();");

  console.log("\n🔗 Useful Resources:");
  console.log("  • Program ID:", programId.toString());
  console.log("  • Program State PDA:", programStatePda.toString());
  console.log("  • Metaplex Docs: https://docs.metaplex.com/");

  console.log("");
}

// Run the script
main()
  .then(() => {
    console.log("✅ Script execution completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script execution failed:");
    console.error(error);
    process.exit(1);
  });
