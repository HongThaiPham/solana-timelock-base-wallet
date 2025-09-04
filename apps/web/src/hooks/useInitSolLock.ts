import { useSignTransaction } from '@getpara/react-sdk';
import { useMutation } from '@tanstack/react-query';
import { getInitializeSolLockInstructionAsync } from '@repo/program-client';
import { useParaSigner } from './useParaSigner';
import {
  compileTransaction,
  getBase64EncodedWireTransaction,
} from '@solana/transactions';
import {
  appendTransactionMessageInstruction,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit';

const useInitSolLock = () => {
  const { signer, rpc } = useParaSigner();

  return useMutation({
    mutationKey: ['init-sol-lock'],
    mutationFn: async (params: { amount: bigint; unlockTime: bigint }) => {
      if (!signer) {
        return;
      }
      console.log('Initiating SOL lock with params:', params);
      const response = await rpc.getLatestBlockhash().send();
      const { blockhash, lastValidBlockHeight } = response.value;
      const ix = await getInitializeSolLockInstructionAsync({
        amount: params.amount,
        unlockTimestamp: params.unlockTime,
        signer,
      });

      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (tx) => setTransactionMessageFeePayer(signer.address, tx),
        (tx) =>
          setTransactionMessageLifetimeUsingBlockhash(
            { blockhash, lastValidBlockHeight },
            tx
          ),
        (tx) => appendTransactionMessageInstruction(ix, tx)
      );

      const tx = await compileTransaction(message);

      const signatures = await signer.signAndSendTransactions([tx]);
      const signature = signatures[0];
      console.log('Transaction signature:', signature.toString());

      return signature;
    },
  });
};
export default useInitSolLock;
