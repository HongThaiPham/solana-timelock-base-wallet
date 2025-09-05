import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getWithdrawSolLockInstruction } from '@repo/program-client';
import { address } from '@solana/addresses';
import toast from 'react-hot-toast';
import {
  appendTransactionMessageInstruction,
  compileTransaction,
  createTransactionMessage,
  getBase58Decoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit';
import { useParaSigner } from './useParaSigner';
const useWithdrawSolLock = (vaultAddress: string) => {
  const { signer, rpc } = useParaSigner();
  const base58Encoder = getBase58Decoder();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['withdraw-sol-lock', vaultAddress],
    mutationFn: async () => {
      if (!signer) {
        return;
      }
      console.log('Withdrawing SOL lock with params:', vaultAddress);
      const ix = await getWithdrawSolLockInstruction({
        vault: address(vaultAddress),
        signer,
      });

      return toast.promise(
        async () => {
          const response = await rpc.getLatestBlockhash().send();
          const { blockhash, lastValidBlockHeight } = response.value;

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

          const signature = base58Encoder.decode(signatures[0]);
          console.log('Withdrawing SOL lock signature (bs58):', signature);
          await queryClient.invalidateQueries({
            queryKey: ['timelock-accounts'],
          });

          return signature;
        },
        {
          loading: 'Withdrawing SOL lock...',
          success: `SOL withdrawn successfully!`,
          error: 'Error when withdrawing SOL',
        },
        {
          toasterId: 'transaction',
        }
      );
    },
  });
};

export default useWithdrawSolLock;
