/**
 * TrustToken Test Mint Script
 * 
 * This script demonstrates the complete workflow:
 * 1. Initialize the TrustToken program
 * 2. Mint a TrustToken NFT to a user
 * 
 * Usage: anchor run test-mint
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

// Load the IDL
const idl = require("../target/idl/trust_token.json");

// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

async function main() {
  console.log("\n🚀 TrustToken Test Mint Script");
  console.log("═".repeat(60));

  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey("3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju");
  const program = new Program(idl, provider);
  const wallet = provider.wallet as anchor.Wallet;

  console.log("\n📋 Configuration:");
  console.log("  Program ID:", programId.toString());
  console.log("  Wallet:", wallet.publicKey.toString());
  console.log("  RPC URL:", provider.connection.rpcEndpoint);

  // Derive program state PDA
  const [programStatePda, programStateBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    programId
  );

  console.log("  Program State PDA:", programStatePda.toString());

  // Check wallet balance
  const balance = await provider.connection.getBalance(wallet.publicKey);
  console.log("  Wallet Balance:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL");

  if (balance < 1 * anchor.web3.LAMPORTS_PER_SOL) {
    console.log("\n⚠️  Warning: Low balance. You may need more SOL for transactions.");
  }

  // ============================================================================
  // Step 1: Initialize the Program
  // ============================================================================

  console.log("\n" + "─".repeat(60));
  console.log("📝 Step 1: Initialize Program");
  console.log("─".repeat(60));

  try {
    // Check if already initialized
    const programStateInfo = await provider.connection.getAccountInfo(programStatePda);
    
    if (programStateInfo) {
      console.log("✅ Program already initialized!");
      
      // Decode and display current state
      const programState = await program.account["programState"].fetch(programStatePda);
      console.log("\n📊 Current Program State:");
      console.log("  Authority:", programState.authority.toString());
      console.log("  Total Minted:", programState.totalMinted.toString());
    } else {
      console.log("🔄 Initializing program...");
      
      const tx = await program.methods
        .initialize()
        .accounts({
          authority: wallet.publicKey,
          programState: programStatePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Program initialized successfully!");
      console.log("  Transaction:", tx);

      // Fetch and display the initialized state
      const programState = await program.account["programState"].fetch(programStatePda);
      console.log("\n📊 Initialized Program State:");
      console.log("  Authority:", programState.authority.toString());
      console.log("  Total Minted:", programState.totalMinted.toString());
    }
  } catch (error: any) {
    if (error.message?.includes("already in use")) {
      console.log("✅ Program already initialized (account exists)");
      
      // Fetch and display current state
      try {
        const programState = await program.account["programState"].fetch(programStatePda);
        console.log("\n📊 Current Program State:");
        console.log("  Authority:", programState.authority.toString());
        console.log("  Total Minted:", programState.totalMinted.toString());
      } catch (fetchError) {
        console.log("⚠️  Could not fetch program state");
      }
    } else {
      console.error("❌ Error initializing program:", error.message);
      throw error;
    }
  }

  // ============================================================================
  // Step 2: Mint a TrustToken NFT
  // ============================================================================

  console.log("\n" + "─".repeat(60));
  console.log("📝 Step 2: Mint TrustToken NFT");
  console.log("─".repeat(60));

  // For this demo, we'll mint to the wallet itself
  // In production, you'd mint to a different user's address
  const recipient = wallet.publicKey;
  console.log("  Recipient:", recipient.toString());

  // Generate a new mint keypair for the NFT
  const mint = Keypair.generate();
  console.log("  Mint Address:", mint.publicKey.toString());

  // Derive PDAs
  const [trustTokenPda, trustTokenBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("trust_token"), mint.publicKey.toBuffer()],
    programId
  );

  const tokenAccount = await getAssociatedTokenAddress(
    mint.publicKey,
    recipient
  );

  // Derive metadata PDA (Metaplex standard)
  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  // Derive master edition PDA (Metaplex standard)
  const [masterEditionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  console.log("\n🔑 Derived Accounts:");
  console.log("  TrustToken PDA:", trustTokenPda.toString());
  console.log("  Token Account:", tokenAccount.toString());
  console.log("  Metadata PDA:", metadataPda.toString());
  console.log("  Master Edition PDA:", masterEditionPda.toString());

  // NFT metadata
  const name = "Trust Token #1";
  const symbol = "TRUST";
  const uri = "https://arweave.net/trust-token-metadata-example";

  console.log("\n📄 NFT Metadata:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  URI:", uri);

  try {
    console.log("\n🔄 Minting TrustToken NFT...");
    console.log("  (This may take a few seconds...)");

    const tx = await program.methods
      .mint(name, symbol, uri)
      .accounts({
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        recipient: recipient,
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

    console.log("\n✅ TrustToken NFT minted successfully!");
    console.log("  Transaction:", tx);

    // Fetch and display the TrustToken data
    const trustToken = await program.account["trustToken"].fetch(trustTokenPda);
    
    console.log("\n📊 TrustToken Data:");
    console.log("  Owner:", trustToken.owner.toString());
    console.log("  Mint:", trustToken.mint.toString());
    console.log("  Is Verified:", trustToken.isVerified ? "✅ Yes" : "❌ No");
    console.log("  Minted At:", new Date(trustToken.mintedAt.toNumber() * 1000).toISOString());

    // Fetch updated program state
    const programState = await program.account["programState"].fetch(programStatePda);
    console.log("\n📊 Updated Program State:");
    console.log("  Total Minted:", programState.totalMinted.toString());

    // Check token balance
    try {
      const tokenAccountInfo = await provider.connection.getTokenAccountBalance(tokenAccount);
      console.log("\n💰 Token Account Balance:");
      console.log("  Amount:", tokenAccountInfo.value.amount);
      console.log("  Decimals:", tokenAccountInfo.value.decimals);
    } catch (error) {
      console.log("\n⚠️  Could not fetch token account balance");
    }

    // Display explorer links (for localnet, these won't work, but useful for devnet/mainnet)
    console.log("\n🔗 Useful Addresses:");
    console.log("  Mint:", mint.publicKey.toString());
    console.log("  Token Account:", tokenAccount.toString());
    console.log("  TrustToken PDA:", trustTokenPda.toString());
    console.log("  Metadata:", metadataPda.toString());

  } catch (error: any) {
    console.error("\n❌ Error minting TrustToken:", error.message);
    
    if (error.logs) {
      console.log("\n📋 Transaction Logs:");
      error.logs.forEach((log: string) => console.log("  ", log));
    }
    
    throw error;
  }

  // ============================================================================
  // Summary
  // ============================================================================

  console.log("\n" + "═".repeat(60));
  console.log("🎉 Test Mint Script Completed Successfully!");
  console.log("═".repeat(60));

  // Final balance check
  const finalBalance = await provider.connection.getBalance(wallet.publicKey);
  const costInSol = (balance - finalBalance) / anchor.web3.LAMPORTS_PER_SOL;
  
  console.log("\n💰 Transaction Cost:");
  console.log("  Initial Balance:", balance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
  console.log("  Final Balance:", finalBalance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
  console.log("  Total Cost:", costInSol.toFixed(6), "SOL");

  console.log("\n✅ Summary:");
  console.log("  • Program initialized");
  console.log("  • TrustToken NFT minted");
  console.log("  • Verification status: Active");
  console.log("  • Ready for marketplace integration");

  console.log("\n💡 Next Steps:");
  console.log("  • Test revoke_verification function");
  console.log("  • Test restore_verification function");
  console.log("  • Integrate with The Bit Central marketplace");
  console.log("  • Deploy to devnet for testing");
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
