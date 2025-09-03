import { describe, test, before } from 'node:test';
import assert from 'node:assert';

import {
  type KeyPairSigner,
  type Address,
  MaybeAccount,
  lamports,
  createKeyPairSignerFromBytes,
  getAddressEncoder,
  address,
} from '@solana/kit';
import {
  ASSOCIATED_TOKEN_PROGRAM,
  connect,
  Connection,
  TOKEN_PROGRAM,
} from 'solana-kite';
import {
  getInitializeSolLockInstructionAsync,
  getInitializeSplLockInstructionAsync,
  getWithdrawSolLockInstruction,
  getWithdrawSplLockInstruction,
  TIMELOCK_BASE_WALLET_PROGRAM_PROGRAM_ADDRESS,
} from '../dist';

import dotenv from 'dotenv';
dotenv.config();
describe('Test Suite', () => {
  const USDC_MINT = address('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
  let alice: KeyPairSigner;
  let connection: Connection;
  let vaultPda: Address;

  const currentTimeStamp = BigInt(Math.floor(new Date().getTime() / 1000));
  const waitTime = 5n;

  before(async () => {
    connection = await connect('helius-devnet');
    alice = await connection.loadWalletFromEnvironment('PAYER_PRIVATE_KEY');
  });

  test.skip('Init and withdraw sol vault should be successful', async (t) => {
    const params = {
      amount: 1000000n,
      unlockTimestamp: currentTimeStamp + waitTime, // 5 seconds later
    };
    const { pda: vaultPda } = await connection.getPDAAndBump(
      TIMELOCK_BASE_WALLET_PROGRAM_PROGRAM_ADDRESS,
      [
        Buffer.from('vault'),
        alice.address,
        params.amount,
        params.unlockTimestamp,
      ]
    );

    t.test('should create a new vault', async () => {
      const initSolVaultIx = await getInitializeSolLockInstructionAsync({
        signer: alice,
        amount: params.amount,
        unlockTimestamp: params.unlockTimestamp,
      });

      const signature = await connection.sendTransactionFromInstructions({
        feePayer: alice,
        instructions: [initSolVaultIx],
      });
      console.log('Init sol vault signature: ', signature);

      const vaultBalance = await connection.getLamportBalance(
        vaultPda,
        'confirmed'
      );
      assert(vaultBalance > params.amount);
    });

    t.test('should withdraw from the vault after unlock time', async () => {
      await new Promise((resolve) =>
        setTimeout(resolve, Number(waitTime * 1000n))
      );

      const withdrawSolVaultIx = await getWithdrawSolLockInstruction({
        signer: alice,
        vault: vaultPda,
      });

      const signature = await connection.sendTransactionFromInstructions({
        feePayer: alice,
        instructions: [withdrawSolVaultIx],
      });

      console.log('Withdraw sol vault signature: ', signature);

      const vaultBalance = await connection.getLamportBalance(
        vaultPda,
        'confirmed'
      );
      assert(vaultBalance === 0n);
    });
  });

  test('Init and withdraw spl vault should be successful', async (t) => {
    const params = {
      amount: 1000n,
      unlockTimestamp: currentTimeStamp + waitTime, // 5 seconds later
    };

    const { pda: vaultPda } = await connection.getPDAAndBump(
      TIMELOCK_BASE_WALLET_PROGRAM_PROGRAM_ADDRESS,
      [
        Buffer.from('vault'),
        alice.address,
        USDC_MINT,
        params.amount,
        params.unlockTimestamp,
      ]
    );
    t.test('should create a new vault', async () => {
      const initSplVaultIx = await getInitializeSplLockInstructionAsync({
        signer: alice,
        amount: params.amount,
        unlockTimestamp: params.unlockTimestamp,
        mint: USDC_MINT,
        tokenProgram: TOKEN_PROGRAM,
      });

      const signature = await connection.sendTransactionFromInstructions({
        feePayer: alice,
        instructions: [initSplVaultIx],
      });
      console.log(
        'Init spl vault signature: ',
        connection.getExplorerLink('tx', signature)
      );

      const vaultBalance = await connection.getTokenAccountBalance({
        wallet: vaultPda,
        mint: USDC_MINT,
      });
      assert(vaultBalance.amount === params.amount);
    });

    t.test('should withdraw from the vault after unlock time', async () => {
      await new Promise((resolve) =>
        setTimeout(resolve, Number(waitTime * 1000n))
      );
      const userAta = await connection.getTokenAccountAddress(
        alice.address,
        USDC_MINT
      );
      const vaultAta = await connection.getTokenAccountAddress(
        vaultPda,
        USDC_MINT
      );

      const withdrawSplVaultIx = await getWithdrawSplLockInstruction({
        signer: alice,
        vault: vaultPda,
        mint: USDC_MINT,
        userAta,
        vaultAta,
      });

      const signature = await connection.sendTransactionFromInstructions({
        feePayer: alice,
        instructions: [withdrawSplVaultIx],
      });

      console.log(
        'Withdraw spl vault signature: ',
        connection.getExplorerLink('tx', signature)
      );

      const vaultBalance = await connection.getLamportBalance(
        vaultPda,
        'confirmed'
      );
      assert(vaultBalance === 0n);

      const isVaultClosed = await connection.checkTokenAccountIsClosed({
        tokenAccount: vaultAta,
      });

      assert(isVaultClosed);
    });
  });
});
