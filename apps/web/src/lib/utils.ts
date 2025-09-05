import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createSolanaRpc } from '@solana/kit';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const solanaKitRpc = createSolanaRpc(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
);

// Time lock utility functions
export const formatAmount = (amount: bigint, decimals: number = 9) => {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  return `${whole.toString()}.${fraction.toString().padStart(decimals, '0').replace(/0+$/, '') || '0'}`;
};

export const formatTimestamp = (timestamp: bigint) => {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
};

export const isLocked = (unlockTimestamp: bigint) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return Number(unlockTimestamp) > currentTime;
};

export const calculateTimeLeft = (unlockTimestamp: bigint) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const unlockTime = Number(unlockTimestamp);
  const difference = unlockTime - currentTime;

  if (difference <= 0) {
    return '';
  }

  const days = Math.floor(difference / (24 * 60 * 60));
  const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((difference % (60 * 60)) / 60);
  const seconds = difference % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};
