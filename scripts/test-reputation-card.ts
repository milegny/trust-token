import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { ReputationCard } from "../target/types/reputation_card";

// Configure the client to use devnet
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.ReputationCard as Program<ReputationCard>;

// Test wallets
const authority = provider.wallet as anchor.Wallet;
const issuer = Keypair.generate();
const recipient = Keypair.generate();

console.log("🧪 Testing ReputationCard Program");
console.log("=====================================");
console.log(`Program ID: ${program.programId.toString()}`);
console.log(`Authority: ${authority.publicKey.toString()}`);
console.log(`Issuer: ${issuer.publicKey.toString()}`);
console.log(`Recipient: ${recipient.publicKey.toString()}`);
console.log("");

async function airdrop(pubkey: PublicKey, amount: number = 2) {
  console.log(`💰 Requesting ${amount} SOL airdrop for ${pubkey.toString().slice(0, 8)}...`);
  try {
    const signature = await provider.connection.requestAirdrop(
      pubkey,
      amount * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
    console.log(`✅ Airdrop confirmed`);
  } catch (error) {
    console.log(`⚠️  Airdrop failed (may be rate limited): ${error.message}`);
  }
}

async function test() {
  try {
    // Step 1: Airdrop SOL to test wallets
    console.log("\n📍 Step 1: Funding test wallets");
    console.log("-----------------------------------");
    await airdrop(issuer.publicKey);
    await airdrop(recipient.publicKey);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Initialize the program
    console.log("\n📍 Step 2: Initialize Program");
    console.log("-----------------------------------");
    
    const [programStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      program.programId
    );

    try {
      const programState = await program.account.programState.fetch(programStatePDA);
      console.log(`✅ Program already initialized`);
      console.log(`   Authority: ${programState.authority.toString()}`);
      console.log(`   Total cards issued: ${programState.totalCardsIssued.toString()}`);
      console.log(`   Total cards revoked: ${programState.totalCardsRevoked.toString()}`);
    } catch (error) {
      console.log(`📝 Initializing program...`);
      const tx = await program.methods
        .initialize()
        .accounts({
          authority: authority.publicKey,
          programState: programStatePDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log(`✅ Program initialized`);
      console.log(`   Transaction: ${tx}`);
      
      const programState = await program.account.programState.fetch(programStatePDA);
      console.log(`   Authority: ${programState.authority.toString()}`);
    }

    // Step 3: Create a reputation card
    console.log("\n📍 Step 3: Create Reputation Card");
    console.log("-----------------------------------");
    
    const programState = await program.account.programState.fetch(programStatePDA);
    const cardNumber = programState.totalCardsIssued;
    
    const [reputationCardPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("reputation_card"),
        issuer.publicKey.toBuffer(),
        recipient.publicKey.toBuffer(),
        cardNumber.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const cardType = { trustworthy: {} };
    const message = "Great seller! Fast shipping and excellent communication.";
    const rating = 5;

    console.log(`📝 Creating card from ${issuer.publicKey.toString().slice(0, 8)}... to ${recipient.publicKey.toString().slice(0, 8)}...`);
    const createTx = await program.methods
      .createCard(cardType, message, rating)
      .accounts({
        issuer: issuer.publicKey,
        recipient: recipient.publicKey,
        programState: programStatePDA,
        reputationCard: reputationCardPDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([issuer])
      .rpc();

    console.log(`✅ Card created successfully`);
    console.log(`   Transaction: ${createTx}`);
    console.log(`   Card PDA: ${reputationCardPDA.toString()}`);

    const card = await program.account.reputationCard.fetch(reputationCardPDA);
    console.log(`   Card #${card.cardNumber.toString()}`);
    console.log(`   Type: ${Object.keys(card.cardType)[0]}`);
    console.log(`   Rating: ${card.rating}/5`);
    console.log(`   Status: ${Object.keys(card.status)[0]}`);
    console.log(`   Message: "${card.message}"`);

    // Step 4: Revoke the card
    console.log("\n📍 Step 4: Revoke Reputation Card");
    console.log("-----------------------------------");
    
    const revokeReason = "Mistake - wrong recipient";
    console.log(`📝 Revoking card #${card.cardNumber.toString()}...`);
    
    const revokeTx = await program.methods
      .revokeCard(revokeReason)
      .accounts({
        issuer: issuer.publicKey,
        programState: programStatePDA,
        reputationCard: reputationCardPDA,
      })
      .signers([issuer])
      .rpc();

    console.log(`✅ Card revoked successfully`);
    console.log(`   Transaction: ${revokeTx}`);

    const revokedCard = await program.account.reputationCard.fetch(reputationCardPDA);
    console.log(`   Status: ${Object.keys(revokedCard.status)[0]}`);
    console.log(`   Reason: "${revokedCard.revocationReason}"`);

    // Step 5: Restore the card
    console.log("\n📍 Step 5: Restore Reputation Card");
    console.log("-----------------------------------");
    
    console.log(`📝 Restoring card #${card.cardNumber.toString()}...`);
    
    const restoreTx = await program.methods
      .restoreCard()
      .accounts({
        issuer: issuer.publicKey,
        programState: programStatePDA,
        reputationCard: reputationCardPDA,
      })
      .signers([issuer])
      .rpc();

    console.log(`✅ Card restored successfully`);
    console.log(`   Transaction: ${restoreTx}`);

    const restoredCard = await program.account.reputationCard.fetch(reputationCardPDA);
    console.log(`   Status: ${Object.keys(restoredCard.status)[0]}`);

    // Step 6: Dispute the card (as recipient)
    console.log("\n📍 Step 6: Dispute Reputation Card");
    console.log("-----------------------------------");
    
    const disputeReason = "This review is unfair and inaccurate";
    console.log(`📝 Recipient disputing card #${card.cardNumber.toString()}...`);
    
    const disputeTx = await program.methods
      .disputeCard(disputeReason)
      .accounts({
        recipient: recipient.publicKey,
        reputationCard: reputationCardPDA,
      })
      .signers([recipient])
      .rpc();

    console.log(`✅ Card disputed successfully`);
    console.log(`   Transaction: ${disputeTx}`);

    const disputedCard = await program.account.reputationCard.fetch(reputationCardPDA);
    console.log(`   Status: ${Object.keys(disputedCard.status)[0]}`);
    console.log(`   Dispute reason: "${disputedCard.disputeReason}"`);

    // Step 7: Update card status (as authority)
    console.log("\n📍 Step 7: Update Card Status (Authority)");
    console.log("-----------------------------------");
    
    const newStatus = { suspended: {} };
    console.log(`📝 Authority updating card status to suspended...`);
    
    const updateTx = await program.methods
      .updateCardStatus(newStatus)
      .accounts({
        authority: authority.publicKey,
        programState: programStatePDA,
        reputationCard: reputationCardPDA,
      })
      .rpc();

    console.log(`✅ Card status updated successfully`);
    console.log(`   Transaction: ${updateTx}`);

    const updatedCard = await program.account.reputationCard.fetch(reputationCardPDA);
    console.log(`   Status: ${Object.keys(updatedCard.status)[0]}`);

    // Final summary
    console.log("\n📊 Final Program State");
    console.log("-----------------------------------");
    const finalState = await program.account.programState.fetch(programStatePDA);
    console.log(`Total cards issued: ${finalState.totalCardsIssued.toString()}`);
    console.log(`Total cards revoked: ${finalState.totalCardsRevoked.toString()}`);

    console.log("\n✅ All tests completed successfully!");
    console.log("=====================================");

  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error);
    throw error;
  }
}

test()
  .then(() => {
    console.log("\n🎉 Test suite completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Test suite failed");
    console.error(error);
    process.exit(1);
  });
