/**
 * Mint TrustToken NFT Script
 * 
 * This script mints a TrustToken NFT to a specified recipient
 */

import * as anchor from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY, 
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMint2Instruction,
  createAssociatedTokenAccountInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
// Metaplex Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Helper function to encode string for Borsh
function encodeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(strBuffer.length, 0);
  return Buffer.concat([lengthBuffer, strBuffer]);
}

async function main() {
  console.log("\n🚀 Mint TrustToken NFT");
  console.log("═".repeat(70));

  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  const programId = new PublicKey("3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju");

  console.log("\n📋 Configuration:");
  console.log("  Program ID:", programId.toString());
  console.log("  Authority:", wallet.publicKey.toString());
  console.log("  RPC URL:", connection.rpcEndpoint);

  // Check wallet balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("  Wallet Balance:", (balance / anchor.web3.LAMPORTS_PER_SOL).toFixed(4), "SOL");

  if (balance < 0.5 * anchor.web3.LAMPORTS_PER_SOL) {
    console.log("\n⚠️  Warning: Low balance. You may need more SOL for this transaction.");
  }

  // Derive program state PDA
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    programId
  );

  console.log("  Program State PDA:", programStatePda.toString());

  // Verify program is initialized
  const programStateInfo = await connection.getAccountInfo(programStatePda);
  
  if (!programStateInfo) {
    console.log("\n❌ Error: Program not initialized!");
    console.log("  Please run: anchor run initialize");
    process.exit(1);
  }

  // Decode current state
  const authority = new PublicKey(programStateInfo.data.slice(8, 40));
  const totalMinted = programStateInfo.data.readBigUInt64LE(40);
  
  console.log("\n📊 Current Program State:");
  console.log("  Authority:", authority.toString());
  console.log("  Total Minted:", totalMinted.toString());

  // Verify we are the authority
  if (!authority.equals(wallet.publicKey)) {
    console.log("\n❌ Error: You are not the program authority!");
    console.log("  Authority:", authority.toString());
    console.log("  Your wallet:", wallet.publicKey.toString());
    process.exit(1);
  }

  // ============================================================================
  // Prepare Mint
  // ============================================================================

  console.log("\n" + "─".repeat(70));
  console.log("📝 Preparing to Mint TrustToken NFT");
  console.log("─".repeat(70));

  // For this demo, mint to the wallet itself
  const recipient = wallet.publicKey;
  console.log("\n  Recipient:", recipient.toString());

  // Generate new mint keypair
  const mint = Keypair.generate();
  console.log("  Mint Address:", mint.publicKey.toString());

  // Derive PDAs
  const [trustTokenPda] = PublicKey.findProgramAddressSync(
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

  // ============================================================================
  // Build Transaction
  // ============================================================================

  console.log("\n🔄 Building transaction...");

  try {
    // Instruction discriminator for "mint" (first 8 bytes of SHA256("global:mint"))
    const discriminator = Buffer.from([51, 57, 225, 47, 182, 146, 137, 166]);
    
    // Manually serialize the arguments (Borsh format)
    const nameBuffer = encodeString(name);
    const symbolBuffer = encodeString(symbol);
    const uriBuffer = encodeString(uri);
    const argsBuffer = Buffer.concat([nameBuffer, symbolBuffer, uriBuffer]);
    
    // Combine discriminator and args
    const data = Buffer.concat([discriminator, argsBuffer]);

    // Create the mint instruction
    const mintInstruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // authority
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // payer
        { pubkey: recipient, isSigner: false, isWritable: false }, // recipient
        { pubkey: programStatePda, isSigner: false, isWritable: true }, // program_state
        { pubkey: mint.publicKey, isSigner: true, isWritable: true }, // mint
        { pubkey: tokenAccount, isSigner: false, isWritable: true }, // token_account
        { pubkey: trustTokenPda, isSigner: false, isWritable: true }, // trust_token
        { pubkey: metadataPda, isSigner: false, isWritable: true }, // metadata
        { pubkey: masterEditionPda, isSigner: false, isWritable: true }, // master_edition
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // token_program
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }, // associated_token_program
        { pubkey: TOKEN_METADATA_PROGRAM_ID, isSigner: false, isWritable: false }, // token_metadata_program
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }, // rent
      ],
      programId,
      data,
    });

    console.log("  Instruction created");
    console.log("  Sending transaction...");
    console.log("  (This may take 10-20 seconds...)");

    // Send and confirm transaction
    const tx = await provider.sendAndConfirm(
      new Transaction().add(mintInstruction),
      [mint],
      {
        skipPreflight: false,
        commitment: "confirmed",
      }
    );

    console.log("\n✅ TrustToken NFT minted successfully!");
    console.log("  Transaction Signature:", tx);

    // Wait a moment for the transaction to be fully processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ============================================================================
    // Verify and Display Results
    // ============================================================================

    console.log("\n" + "─".repeat(70));
    console.log("📊 Verification");
    console.log("─".repeat(70));

    // Fetch TrustToken account
    const trustTokenInfo = await connection.getAccountInfo(trustTokenPda);
    
    if (trustTokenInfo) {
      console.log("\n✅ TrustToken Account Created:");
      console.log("  Address:", trustTokenPda.toString());
      console.log("  Owner:", trustTokenInfo.owner.toString());
      console.log("  Data Length:", trustTokenInfo.data.length, "bytes");

      // Decode TrustToken data
      if (trustTokenInfo.data.length >= 81) {
        const owner = new PublicKey(trustTokenInfo.data.slice(8, 40));
        const mintAddr = new PublicKey(trustTokenInfo.data.slice(40, 72));
        const isVerified = trustTokenInfo.data[72] === 1;
        const mintedAt = trustTokenInfo.data.readBigInt64LE(73);
        
        console.log("\n📊 TrustToken Data:");
        console.log("  Owner:", owner.toString());
        console.log("  Mint:", mintAddr.toString());
        console.log("  Is Verified:", isVerified ? "✅ Yes" : "❌ No");
        console.log("  Minted At:", new Date(Number(mintedAt) * 1000).toISOString());
      }
    }

    // Fetch updated program state
    const updatedProgramStateInfo = await connection.getAccountInfo(programStatePda);
    
    if (updatedProgramStateInfo) {
      const newTotalMinted = updatedProgramStateInfo.data.readBigUInt64LE(40);
      console.log("\n📊 Updated Program State:");
      console.log("  Total Minted:", newTotalMinted.toString());
    }

    // Check token account
    try {
      const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
      console.log("\n💰 Token Account:");
      console.log("  Address:", tokenAccount.toString());
      console.log("  Balance:", tokenAccountInfo.value.amount);
      console.log("  Decimals:", tokenAccountInfo.value.decimals);
    } catch (error) {
      console.log("\n⚠️  Token account not yet visible (may need a moment)");
    }

    // ============================================================================
    // Summary
    // ============================================================================

    console.log("\n" + "═".repeat(70));
    console.log("🎉 Minting Complete!");
    console.log("═".repeat(70));

    const finalBalance = await connection.getBalance(wallet.publicKey);
    const costInSol = (balance - finalBalance) / anchor.web3.LAMPORTS_PER_SOL;
    
    console.log("\n💰 Transaction Cost:");
    console.log("  Initial Balance:", (balance / anchor.web3.LAMPORTS_PER_SOL).toFixed(4), "SOL");
    console.log("  Final Balance:", (finalBalance / anchor.web3.LAMPORTS_PER_SOL).toFixed(4), "SOL");
    console.log("  Total Cost:", costInSol.toFixed(6), "SOL");

    console.log("\n🔗 Important Addresses:");
    console.log("  Mint:", mint.publicKey.toString());
    console.log("  Token Account:", tokenAccount.toString());
    console.log("  TrustToken PDA:", trustTokenPda.toString());
    console.log("  Metadata:", metadataPda.toString());
    console.log("  Master Edition:", masterEditionPda.toString());

    console.log("\n✅ Summary:");
    console.log("  • TrustToken NFT minted successfully");
    console.log("  • Recipient:", recipient.toString());
    console.log("  • Verification status: Active ✅");
    console.log("  • Ready for marketplace integration");

    console.log("\n💡 Next Steps:");
    console.log("  • View NFT in Solana Explorer (on devnet/mainnet)");
    console.log("  • Test revoke_verification function");
    console.log("  • Test restore_verification function");
    console.log("  • Integrate with The Bit Central marketplace");
    console.log("");

  } catch (error: any) {
    console.error("\n❌ Error minting TrustToken:");
    console.error("  Message:", error.message);
    
    if (error.logs) {
      console.log("\n📋 Transaction Logs:");
      error.logs.forEach((log: string) => console.log("  ", log));
    }
    
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
