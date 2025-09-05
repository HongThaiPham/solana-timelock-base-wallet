import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getInitializeSolLockInstructionAsync } from '@repo/program-client';
import { useParaSigner } from './useParaSigner';
import { compileTransaction } from '@solana/transactions';
import {
  appendTransactionMessageInstruction,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  getBase58Decoder,
} from '@solana/kit';
import toast from 'react-hot-toast';

const useInitSolLock = () => {
  const { signer, rpc } = useParaSigner();
  const base58Encoder = getBase58Decoder();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['init-sol-lock', signer?.address],
    mutationFn: async (params: { amount: bigint; unlockTime: bigint }) => {
      if (!signer) {
        return;
      }
      console.log('Initiating SOL lock with params:', params);

      return toast.promise(
        async () => {
          const response = await rpc.getLatestBlockhash().send();
          const { blockhash, lastValidBlockHeight } = response.value;
          const ix = await getInitializeSolLockInstructionAsync({
            amount: params.amount,
            unlockTimestamp: params.unlockTime,
            signer,
          });
          console.log('InitializeSolLock Instruction:', ix);

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

          console.log('Transaction Message:', message);

          const tx = await compileTransaction(message);

          console.log('Compiled Transaction:', tx);

          const signatures = await signer.signAndSendTransactions([tx]);

          const signature = base58Encoder.decode(signatures[0]);
          console.log('Initiating SOL lock signature (bs58):', signature);

          await queryClient.invalidateQueries({
            queryKey: ['timelock-accounts'],
          });

          return signature;
        },
        {
          loading: 'Initiating SOL lock...',
          success: `SOL locked successfully!`,
          error: 'Error when locking SOL',
        },
        {
          toasterId: 'transaction',
        }
      );
    },
  });
};
export default useInitSolLock;
