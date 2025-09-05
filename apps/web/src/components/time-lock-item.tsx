'use client';
import React, { useState, useEffect } from 'react';
import {
  CoinsIcon,
  CalendarIcon,
  LockIcon,
  UnlockIcon,
  ClockIcon,
  DownloadIcon,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { isSome, type Account } from '@solana/kit';
import type { Vault } from '@repo/program-client';
import useWithdrawSolLock from '@/hooks/useWithdrawSolLock';
import {
  formatAmount,
  formatTimestamp,
  isLocked,
  calculateTimeLeft,
} from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface TimeLockItemProps {
  item: Account<Vault>;
  index: number;
}

const TimeLockItem: React.FC<TimeLockItemProps> = ({ item, index }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const vaultData = item.data;
  const withdrawSolLock = useWithdrawSolLock(item.address);

  const handleWithdraw = async () => {
    const signature = await withdrawSolLock.mutateAsync();

    toast.custom((t) => (
      <div
        className={`bg-white px-6 py-4 shadow-md rounded-full ${
          t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
        }`}
      >
        <Link href={`https://explorer.solana.com/tx/${signature}`}>
          View Transaction
        </Link>
      </div>
    ));
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
              <LockIcon className='size-3' />
            ) : (
              <UnlockIcon className='size-3' />
            )}
            {isVaultLocked ? 'Locked' : 'Unlocked'}
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2 text-sm'>
          <CoinsIcon className='size-4 text-muted-foreground' />
          <span className='font-medium'>
            {formatAmount(vaultData.amount)} {solOrSpl}
          </span>
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <CalendarIcon className='size-4 text-muted-foreground' />
          <span>
            <span className='text-muted-foreground'>Unlock: </span>
            {formatTimestamp(vaultData.unlockTimestamp)}
          </span>
        </div>

        {isVaultLocked && timeLeft && (
          <div className='flex items-center gap-2 text-sm'>
            <ClockIcon className='size-4 text-muted-foreground' />
            <span>
              <span className='text-muted-foreground'>Time left: </span>
              <span className='font-mono font-medium text-orange-600 dark:text-orange-400'>
                {timeLeft}
              </span>
            </span>
          </div>
        )}

        {!isVaultLocked && !isSome(vaultData.mint) && (
          <div className='pt-3 border-t'>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawSolLock.isPending}
              className='w-full'
              size='sm'
            >
              {withdrawSolLock.isPending ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <DownloadIcon className='size-4' />
              )}
              {withdrawSolLock.isPending ? 'Withdrawing...' : 'Withdraw SOL'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeLockItem;
