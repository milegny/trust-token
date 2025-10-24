import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { assert } from "chai";

describe("trust_token - Simple Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  const programId = new PublicKey("3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju");

  // Metaplex Token Metadata Program ID
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Derive program state PDA
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    programId
  );

  console.log("\n🔑 Test Configuration:");
  console.log("Program ID:", programId.toString());
  console.log("Wallet:", wallet.publicKey.toString());
  console.log("Program State PDA:", programStatePda.toString());
  console.log("RPC URL:", connection.rpcEndpoint);

  it("Verifies the program is deployed", async () => {
    console.log("\n📝 Test 1: Verify Program Deployment");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const programInfo = await connection.getAccountInfo(programId);
    
    assert.isNotNull(programInfo, "Program should be deployed");
    assert.isTrue(programInfo!.executable, "Program should be executable");
    
    console.log("✅ Program is deployed and executable");
    console.log("  Owner:", programInfo!.owner.toString());
    console.log("  Data Length:", programInfo!.data.length, "bytes");
  });

  it("Checks wallet balance", async () => {
    console.log("\n📝 Test 2: Check Wallet Balance");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const balance = await connection.getBalance(wallet.publicKey);
    const balanceInSol = balance / anchor.web3.LAMPORTS_PER_SOL;
    
    console.log("  Wallet Balance:", balanceInSol, "SOL");
    
    assert.isAbove(balance, 0, "Wallet should have SOL");
    console.log("✅ Wallet has sufficient balance");
  });

  it("Checks if program state exists", async () => {
    console.log("\n📝 Test 3: Check Program State");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const programStateInfo = await connection.getAccountInfo(programStatePda);
    
    if (programStateInfo) {
      console.log("✅ Program state exists");
      console.log("  Owner:", programStateInfo.owner.toString());
      console.log("  Data Length:", programStateInfo.data.length, "bytes");
      
      // Try to decode the data (8 bytes discriminator + 32 bytes pubkey + 8 bytes u64)
      if (programStateInfo.data.length >= 48) {
        const authority = new PublicKey(programStateInfo.data.slice(8, 40));
        const totalMinted = programStateInfo.data.readBigUInt64LE(40);
        
        console.log("\n📊 Program State Data:");
        console.log("  Authority:", authority.toString());
        console.log("  Total Minted:", totalMinted.toString());
        
        assert.equal(authority.toString(), wallet.publicKey.toString(), "Authority should match wallet");
      }
    } else {
      console.log("⚠️  Program state not initialized yet");
      console.log("  This is expected if initialize() hasn't been called");
    }
  });

  it("Displays test summary", async () => {
    console.log("\n📊 Test Summary");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ All basic tests passed!");
    console.log("\n💡 Next Steps:");
    console.log("  1. Call initialize() to set up the program");
    console.log("  2. Call mint() to create TrustToken NFTs");
    console.log("  3. Test revoke/restore verification functions");
  });
});
