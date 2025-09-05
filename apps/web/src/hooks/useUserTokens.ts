'use client';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from '@getpara/react-sdk';
import { useParaSigner } from './useParaSigner';
import { address } from '@solana/addresses';

export interface TokenAccount {
  mint: string;
  decimals: number;
  amount: string;
  uiAmount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
}

let tokenProgram = address('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

const useUserTokens = () => {
  const { isConnected } = useAccount();
  const { signer, rpc } = useParaSigner();

  return useQuery({
    queryKey: ['userTokens', signer?.address],
    queryFn: async (): Promise<TokenAccount[]> => {
      if (!signer?.address) {
        throw new Error('Wallet not connected');
      }

      try {
        // Get all token accounts for the user
        const tokenAccounts = await rpc
          .getTokenAccountsByOwner(
            signer.address,
            {
              programId: tokenProgram,
            },
            {
              encoding: 'base64',
            }
          )
          .send();

        console.log('Fetched token accounts:', tokenAccounts);

        // Filter out accounts with zero balance and map to our TokenAccount interface
        // const tokens = tokenAccounts.value
        //   .map((account) => {
        //     const parsedInfo = (account.account.data)
        //       .parsed.info;
        //     const mint = parsedInfo.mint;
        //     const tokenAmount = parsedInfo.tokenAmount;

        //     // Skip tokens with zero balance
        //     if (tokenAmount.uiAmount === 0) {
        //       return null;
        //     }

        //     const knownToken = KNOWN_TOKENS[mint];

        //     return {
        //       mint,
        //       decimals: tokenAmount.decimals,
        //       amount: tokenAmount.amount,
        //       uiAmount: tokenAmount.uiAmount || 0,
        //       symbol:
        //         knownToken?.symbol ||
        //         `TOKEN-${mint.slice(0, 4)}...${mint.slice(-4)}`,
        //       name: knownToken?.name || `Unknown Token`,
        //       logoURI: knownToken?.logoURI,
        //     } as TokenAccount;
        //   })
        //   .filter((token) => token !== null) as TokenAccount[];

        return [];
      } catch (error) {
        console.error('Error fetching user tokens:', error);
        throw error;
      }
    },
    enabled: isConnected && !!signer,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

export default useUserTokens;
