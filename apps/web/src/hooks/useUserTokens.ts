'use client';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from '@getpara/react-sdk';
import { Connection, type ParsedAccountData, PublicKey } from '@solana/web3.js';
import { useParaSigner } from './useParaSigner';

export interface TokenAccount {
  mint: string;
  decimals: number;
  amount: string;
  uiAmount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
}

const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

// Popular token list for devnet (you can expand this)
const KNOWN_TOKENS: Record<
  string,
  { symbol: string; name: string; logoURI?: string }
> = {
  // USDC on devnet
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU': {
    symbol: 'USDC',
    name: 'USD Coin',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  // Add more known tokens here
};

const useUserTokens = () => {
  const { isConnected } = useAccount();
  const { signer } = useParaSigner();

  return useQuery({
    queryKey: ['userTokens', signer?.address],
    queryFn: async (): Promise<TokenAccount[]> => {
      if (!signer?.address) {
        throw new Error('Wallet not connected');
      }

      const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
      const publicKey = new PublicKey(signer.address);

      try {
        // Get all token accounts for the user
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: TOKEN_PROGRAM_ID,
          }
        );

        // Filter out accounts with zero balance and map to our TokenAccount interface
        const tokens = tokenAccounts.value
          .map((account) => {
            const parsedInfo = (account.account.data as ParsedAccountData)
              .parsed.info;
            const mint = parsedInfo.mint;
            const tokenAmount = parsedInfo.tokenAmount;

            // Skip tokens with zero balance
            if (tokenAmount.uiAmount === 0) {
              return null;
            }

            const knownToken = KNOWN_TOKENS[mint];

            return {
              mint,
              decimals: tokenAmount.decimals,
              amount: tokenAmount.amount,
              uiAmount: tokenAmount.uiAmount || 0,
              symbol:
                knownToken?.symbol ||
                `TOKEN-${mint.slice(0, 4)}...${mint.slice(-4)}`,
              name: knownToken?.name || `Unknown Token`,
              logoURI: knownToken?.logoURI,
            } as TokenAccount;
          })
          .filter((token) => token !== null) as TokenAccount[];

        return tokens;
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
