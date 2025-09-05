'use client';
import React, { useState, useEffect } from 'react';
import {
  CoinsIcon,
  CalendarIcon,
  LockIcon,
  UnlockIcon,
  ClockIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { isSome, type Account } from '@solana/kit';
import type { Vault } from '@repo/program-client';

interface TimeLockItemProps {
  item: Account<Vault>;
  index: number;
}

const TimeLockItem: React.FC<TimeLockItemProps> = ({ item, index }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const vaultData = item.data;

  const formatAmount = (amount: bigint, decimals: number = 9) => {
    const divisor = BigInt(10 ** decimals);
    const whole = amount / divisor;
    const fraction = amount % divisor;
    return `${whole.toString()}.${fraction.toString().padStart(decimals, '0').replace(/0+$/, '') || '0'}`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const isLocked = (unlockTimestamp: bigint) => {
    const currentTime = Math.floor(Date.now() / 1000);
    return Number(unlockTimestamp) > currentTime;
  };

  const calculateTimeLeft = (unlockTimestamp: bigint) => {
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

  useEffect(() => {
    if (isLocked(vaultData.unlockTimestamp)) {
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft(vaultData.unlockTimestamp));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [vaultData.unlockTimestamp]);

  const solOrSpl = isSome(vaultData.mint) ? 'SPL Token' : 'SOL';
  const isVaultLocked = isLocked(vaultData.unlockTimestamp);

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>
            Vault #{index + 1}
          </CardTitle>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isVaultLocked
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            }`}
          >
            {isVaultLocked ? (
              <LockIcon className='h-3 w-3' />
            ) : (
              <UnlockIcon className='h-3 w-3' />
            )}
            {isVaultLocked ? 'Locked' : 'Unlocked'}
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2 text-sm'>
          <CoinsIcon className='h-4 w-4 text-muted-foreground' />
          <span className='font-medium'>
            {formatAmount(vaultData.amount)} {solOrSpl}
          </span>
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <CalendarIcon className='h-4 w-4 text-muted-foreground' />
          <span>
            <span className='text-muted-foreground'>Unlock: </span>
            {formatTimestamp(vaultData.unlockTimestamp)}
          </span>
        </div>

        {isVaultLocked && timeLeft && (
          <div className='flex items-center gap-2 text-sm'>
            <ClockIcon className='h-4 w-4 text-muted-foreground' />
            <span>
              <span className='text-muted-foreground'>Time left: </span>
              <span className='font-mono font-medium text-orange-600 dark:text-orange-400'>
                {timeLeft}
              </span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeLockItem;
