import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { TrustToken } from "../target/types/trust_token";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { assert } from "chai";

describe("trust_token", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey("3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju");
  const program = new Program<TrustToken>(
    require("../target/idl/trust_token.json"),
    programId,
    provider
  );
  const authority = provider.wallet as anchor.Wallet;

  // Metaplex Token Metadata Program ID
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Derive program state PDA
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  console.log("\n🔑 Test Configuration:");
  console.log("Program ID:", program.programId.toString());
  console.log("Authority:", authority.publicKey.toString());
  console.log("Program State PDA:", programStatePda.toString());

  it("Initializes the TrustToken program", async () => {
    console.log("\n📝 Test 1: Initialize Program");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      const tx = await program.methods
        .initialize()
        .accounts({
          authority: authority.publicKey,
          programState: programStatePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Transaction signature:", tx);

      // Fetch and verify program state
      const programState = await program.account.programState.fetch(programStatePda);
      
      console.log("\n📊 Program State:");
      console.log("  Authority:", programState.authority.toString());
      console.log("  Total Minted:", programState.totalMinted.toString());

      // Assertions
      assert.equal(
        programState.authority.toString(),
        authority.publicKey.toString(),
        "Authority should match wallet public key"
      );
      assert.equal(
        programState.totalMinted.toNumber(),
        0,
        "Total minted should be 0 initially"
      );

      console.log("\n✅ Program initialized successfully!");
    } catch (error) {
      console.error("❌ Error initializing program:", error);
      throw error;
    }
  });

  it("Mints a TrustToken NFT to a user", async () => {
    console.log("\n📝 Test 2: Mint TrustToken NFT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Generate a new recipient
    const recipient = Keypair.generate();
    console.log("Recipient address:", recipient.publicKey.toString());

    // Generate a new mint keypair
    const mint = Keypair.generate();
    console.log("Mint address:", mint.publicKey.toString());

    // Derive PDAs
    const [trustTokenPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trust_token"), mint.publicKey.toBuffer()],
      program.programId
    );

    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      recipient.publicKey
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
    const uri = "https://arweave.net/trust-token-metadata";

    try {
      const tx = await program.methods
        .mint(name, symbol, uri)
        .accounts({
          authority: authority.publicKey,
          payer: authority.publicKey,
          recipient: recipient.publicKey,
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

      console.log("\n✅ Transaction signature:", tx);

      // Fetch and verify TrustToken account
      const trustToken = await program.account.trustToken.fetch(trustTokenPda);
      
      console.log("\n📊 TrustToken Data:");
      console.log("  Owner:", trustToken.owner.toString());
      console.log("  Mint:", trustToken.mint.toString());
      console.log("  Is Verified:", trustToken.isVerified);
      console.log("  Minted At:", new Date(trustToken.mintedAt.toNumber() * 1000).toISOString());

      // Fetch updated program state
      const programState = await program.account.programState.fetch(programStatePda);
      console.log("  Total Minted:", programState.totalMinted.toString());

      // Assertions
      assert.equal(
        trustToken.owner.toString(),
        recipient.publicKey.toString(),
        "Owner should match recipient"
      );
      assert.equal(
        trustToken.mint.toString(),
        mint.publicKey.toString(),
        "Mint should match"
      );
      assert.isTrue(trustToken.isVerified, "Token should be verified");
      assert.equal(
        programState.totalMinted.toNumber(),
        1,
        "Total minted should be 1"
      );

      console.log("\n✅ TrustToken NFT minted successfully!");
    } catch (error) {
      console.error("❌ Error minting TrustToken:", error);
      throw error;
    }
  });

  it("Revokes verification of a TrustToken", async () => {
    console.log("\n📝 Test 3: Revoke Verification");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Use the mint from the previous test (we'll create a new one for this test)
    const recipient = Keypair.generate();
    const mint = Keypair.generate();

    const [trustTokenPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trust_token"), mint.publicKey.toBuffer()],
      program.programId
    );

    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      recipient.publicKey
    );

    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [masterEditionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // First, mint a token
    console.log("Minting token first...");
    await program.methods
      .mint("Trust Token #2", "TRUST", "https://arweave.net/trust-token-2")
      .accounts({
        authority: authority.publicKey,
        payer: authority.publicKey,
        recipient: recipient.publicKey,
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

    console.log("✅ Token minted");

    // Now revoke verification
    try {
      const tx = await program.methods
        .revokeVerification()
        .accounts({
          authority: authority.publicKey,
          programState: programStatePda,
          trustToken: trustTokenPda,
        })
        .rpc();

      console.log("✅ Revocation transaction signature:", tx);

      // Fetch and verify
      const trustToken = await program.account.trustToken.fetch(trustTokenPda);
      
      console.log("\n📊 TrustToken After Revocation:");
      console.log("  Is Verified:", trustToken.isVerified);

      assert.isFalse(trustToken.isVerified, "Token should not be verified");

      console.log("\n✅ Verification revoked successfully!");
    } catch (error) {
      console.error("❌ Error revoking verification:", error);
      throw error;
    }
  });

  it("Restores verification of a TrustToken", async () => {
    console.log("\n📝 Test 4: Restore Verification");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Use the mint from the previous test
    const recipient = Keypair.generate();
    const mint = Keypair.generate();

    const [trustTokenPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trust_token"), mint.publicKey.toBuffer()],
      program.programId
    );

    const tokenAccount = await getAssociatedTokenAddress(
      mint.publicKey,
      recipient.publicKey
    );

    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    const [masterEditionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Mint and revoke first
    console.log("Minting and revoking token first...");
    await program.methods
      .mint("Trust Token #3", "TRUST", "https://arweave.net/trust-token-3")
      .accounts({
        authority: authority.publicKey,
        payer: authority.publicKey,
        recipient: recipient.publicKey,
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

    await program.methods
      .revokeVerification()
      .accounts({
        authority: authority.publicKey,
        programState: programStatePda,
        trustToken: trustTokenPda,
      })
      .rpc();

    console.log("✅ Token minted and revoked");

    // Now restore verification
    try {
      const tx = await program.methods
        .restoreVerification()
        .accounts({
          authority: authority.publicKey,
          programState: programStatePda,
          trustToken: trustTokenPda,
        })
        .rpc();

      console.log("✅ Restoration transaction signature:", tx);

      // Fetch and verify
      const trustToken = await program.account.trustToken.fetch(trustTokenPda);
      
      console.log("\n📊 TrustToken After Restoration:");
      console.log("  Is Verified:", trustToken.isVerified);

      assert.isTrue(trustToken.isVerified, "Token should be verified again");

      console.log("\n✅ Verification restored successfully!");
    } catch (error) {
      console.error("❌ Error restoring verification:", error);
      throw error;
    }
  });

  it("Displays final program statistics", async () => {
    console.log("\n📝 Test 5: Final Statistics");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const programState = await program.account.programState.fetch(programStatePda);
    
    console.log("\n📊 Final Program State:");
    console.log("  Authority:", programState.authority.toString());
    console.log("  Total Minted:", programState.totalMinted.toString());
    console.log("\n✅ All tests completed successfully!");
  });
});
