import { useMemo } from 'react';
import { useAccount, useClient } from '@getpara/react-sdk';
import { createParaSolanaSigner } from '@getpara/solana-signers-v2-integration';
import { createSolanaRpc } from '@solana/kit';

export function useParaSolanaKit() {
  const para = useClient();
  const { isConnected } = useAccount();

  const { rpc, signer } = useMemo(() => {
    const rpc = createSolanaRpc(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://devnet.api.solana.com'
    );
    console.log('RPC created with URL:', { para, isConnected });
    if (!para || !isConnected) {
      return { rpc, signer: null };
    }

    const xxx = para.getWallets();
    console.log('All available wallets xxx:', xxx);

    const wallets = para.getWalletsByType('SOLANA');
    console.log('Available Solana wallets:', wallets);
    if (!wallets || wallets.length === 0) {
      return { rpc, signer: null };
    }

    const signer = createParaSolanaSigner({ para, rpc });
    return { rpc, signer };
  }, [para, isConnected]);

  return { rpc, signer };
}
