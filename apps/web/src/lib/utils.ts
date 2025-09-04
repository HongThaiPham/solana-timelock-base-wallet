import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createSolanaRpc } from '@solana/kit';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const solanaKitRpc = createSolanaRpc(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
);
