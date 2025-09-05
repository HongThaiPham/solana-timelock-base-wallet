import { useQuery } from '@tanstack/react-query';
import {
  fetchAllVault,
  TIMELOCK_BASE_WALLET_PROGRAM_PROGRAM_ADDRESS,
  VAULT_DISCRIMINATOR,
} from '@repo/program-client';
import { useSolana } from './useSolana';
import bs58 from 'bs58';
import { useWallet } from '@getpara/react-sdk';
import type { Base58EncodedBytes } from '@solana/kit';
const useTimeLockAccounts = () => {
  const { rpc } = useSolana();
  const { data: wallet } = useWallet();

  return useQuery({
    queryKey: ['timelock-accounts'],
    queryFn: async () => {
      if (!rpc || !wallet || !wallet.address) return [];
      const accounts = await rpc
        .getProgramAccounts(TIMELOCK_BASE_WALLET_PROGRAM_PROGRAM_ADDRESS, {
          commitment: 'finalized',
          filters: [
            {
              memcmp: {
                offset: BigInt(0),
                bytes: bs58.encode(
                  VAULT_DISCRIMINATOR
                ) as unknown as Base58EncodedBytes,
                encoding: 'base58',
              },
            },
            {
              memcmp: {
                offset: BigInt(8),
                bytes: wallet.address as unknown as Base58EncodedBytes,
                encoding: 'base58',
              },
            },
          ],
        })
        .send();

      const address = accounts.map((acc) => acc.pubkey);
      return fetchAllVault(rpc, address);
    },
    enabled: !!rpc && !!wallet,
  });
};

export default useTimeLockAccounts;
