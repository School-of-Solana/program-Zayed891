import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TippingApp } from "../target/types/tipping_app";
import { PublicKey, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("tipping_app", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TippingApp as Program<TippingApp>;
  const provider = anchor.getProvider();

  let tipJarOwner: Keypair;
  let tipper: Keypair;
  let tipJarPda: PublicKey;
  let bump: number;

  before(async () => {
    // Create test accounts
    tipJarOwner = Keypair.generate();
    tipper = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(tipJarOwner.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(tipper.publicKey, 2 * LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find tip jar PDA
    [tipJarPda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("tip_jar"), tipJarOwner.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("Happy Path Tests", () => {
    it("Initializes a tip jar successfully", async () => {
      await program.methods
        .initializeTipJar()
        .accounts({
          tipJar: tipJarPda,
          owner: tipJarOwner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([tipJarOwner])
        .rpc();

      // Verify tip jar was created correctly
      const tipJarAccount = await program.account.tipJar.fetch(tipJarPda);
      expect(tipJarAccount.owner.toString()).to.equal(tipJarOwner.publicKey.toString());
      expect(tipJarAccount.totalTips.toNumber()).to.equal(0);
      expect(tipJarAccount.createdAt.toNumber()).to.be.greaterThan(0);
    });

    it("Sends a tip successfully", async () => {
      const tipAmount = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL

      // Get initial balances
      const initialTipperBalance = await provider.connection.getBalance(tipper.publicKey);
      const initialTipJarBalance = await provider.connection.getBalance(tipJarPda);

      await program.methods
        .sendTip(new anchor.BN(tipAmount))
        .accounts({
          tipJar: tipJarPda,
          tipper: tipper.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([tipper])
        .rpc();

      // Verify balances changed correctly
      const finalTipperBalance = await provider.connection.getBalance(tipper.publicKey);
      const finalTipJarBalance = await provider.connection.getBalance(tipJarPda);

      expect(finalTipperBalance).to.be.lessThan(initialTipperBalance);
      expect(finalTipJarBalance).to.equal(initialTipJarBalance + tipAmount);

      // Verify tip jar data updated
      const tipJarAccount = await program.account.tipJar.fetch(tipJarPda);
      expect(tipJarAccount.totalTips.toNumber()).to.equal(tipAmount);
    });

    it("Withdraws tips successfully", async () => {
      const withdrawAmount = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL

      // Get initial balances
      const initialOwnerBalance = await provider.connection.getBalance(tipJarOwner.publicKey);
      const initialTipJarBalance = await provider.connection.getBalance(tipJarPda);

      await program.methods
        .withdrawTips(new anchor.BN(withdrawAmount))
        .accounts({
          tipJar: tipJarPda,
          owner: tipJarOwner.publicKey,
        } as any)
        .signers([tipJarOwner])
        .rpc();

      // Verify balances changed correctly
      const finalOwnerBalance = await provider.connection.getBalance(tipJarOwner.publicKey);
      const finalTipJarBalance = await provider.connection.getBalance(tipJarPda);

      expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
      expect(finalTipJarBalance).to.equal(initialTipJarBalance - withdrawAmount);
    });
  });

  describe("Unhappy Path Tests", () => {
    it("Fails to initialize tip jar twice", async () => {
      try {
        await program.methods
          .initializeTipJar()
          .accounts({
            tipJar: tipJarPda,
            owner: tipJarOwner.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as any)
          .signers([tipJarOwner])
          .rpc();
        
        expect.fail("Should have failed to initialize tip jar twice");
      } catch (error) {
        expect(error.toString()).to.include("already in use");
      }
    });

    it("Fails to withdraw more than available balance", async () => {
      const excessiveAmount = 10 * LAMPORTS_PER_SOL; // Much more than in tip jar

      try {
        await program.methods
          .withdrawTips(new anchor.BN(excessiveAmount))
          .accounts({
            tipJar: tipJarPda,
            owner: tipJarOwner.publicKey,
          } as any)
          .signers([tipJarOwner])
          .rpc();
        
        expect.fail("Should have failed to withdraw excessive amount");
      } catch (error) {
        expect(error.toString()).to.include("InsufficientFunds");
      }
    });

    it("Fails to withdraw from someone else's tip jar", async () => {
      const unauthorizedUser = Keypair.generate();
      await provider.connection.requestAirdrop(unauthorizedUser.publicKey, LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        await program.methods
          .withdrawTips(new anchor.BN(1000))
          .accounts({
            tipJar: tipJarPda,
            owner: unauthorizedUser.publicKey,
          } as any)
          .signers([unauthorizedUser])
          .rpc();
        
        expect.fail("Should have failed to withdraw from unauthorized tip jar");
      } catch (error) {
        expect(error.toString()).to.include("AnchorError");
      }
    });

    it("Fails to send tip to non-existent tip jar", async () => {
      const fakeTipJarOwner = Keypair.generate();
      const [fakeTipJarPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("tip_jar"), fakeTipJarOwner.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .sendTip(new anchor.BN(1000))
          .accounts({
            tipJar: fakeTipJarPda,
            tipper: tipper.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          } as any)
          .signers([tipper])
          .rpc();
        
        expect.fail("Should have failed to send tip to non-existent tip jar");
      } catch (error) {
        expect(error.toString()).to.include("AccountNotInitialized");
      }
    });
  });
});
