'use client';
import useTimeLockAccounts from '@/hooks/useTimeLockAccounts';
import { Clock10Icon, LockIcon, UnlockIcon } from 'lucide-react';
import React, { useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import TimeLockItem from './time-lock-item';
import { isLocked } from '@/lib/utils';

const TimeLockList = () => {
  const { data, isPending } = useTimeLockAccounts();

  // Separate data into 2 distinct lists
  const separateTimeLockItems = useCallback(
    (items: typeof data) => {
      if (!items) return { lockedItems: [], unlockedItems: [] };

      const lockedItems = items
        .filter((item) => isLocked(item.data.unlockTimestamp))
        .sort(
          (a, b) =>
            Number(a.data.unlockTimestamp) - Number(b.data.unlockTimestamp)
        );

      const unlockedItems = items
        .filter((item) => !isLocked(item.data.unlockTimestamp))
        .sort(
          (a, b) =>
            Number(a.data.unlockTimestamp) - Number(b.data.unlockTimestamp)
        );

      return { lockedItems, unlockedItems };
    },
    [data]
  );

  const { lockedItems, unlockedItems } = separateTimeLockItems(data);
  const totalItems = lockedItems.length + unlockedItems.length;

  const renderLoadingState = () => (
    <ScrollArea className='h-[600px] w-full'>
      <div className='space-y-4'>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-16' />
              </div>
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-4' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-4' />
                  <Skeleton className='h-4 w-40' />
                </div>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-4' />
                  <Skeleton className='h-4 w-28' />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );

  const renderEmptyState = (message: string) => (
    <Card>
      <CardContent className='py-8 text-center'>
        <p className='text-muted-foreground'>{message}</p>
        <p className='text-sm text-muted-foreground mt-2'>
          Create your first SOL time lock to get started
        </p>
      </CardContent>
    </Card>
  );

  const renderTabContent = (
    items: typeof lockedItems,
    emptyMessage: string
  ) => (
    <TabsContent
      value={items === lockedItems ? 'locked' : 'unlocked'}
      className='mt-4'
    >
      {items.length > 0 ? (
        <ScrollArea className='h-[600px] w-full'>
          <div className='space-y-4 pr-4'>
            {items.map((item, index) => (
              <TimeLockItem
                key={`${items === lockedItems ? 'locked' : 'unlocked'}-${item.address}-${index}`}
                item={item}
                index={index}
              />
            ))}
          </div>
        </ScrollArea>
      ) : (
        renderEmptyState(emptyMessage)
      )}
    </TabsContent>
  );

  return (
    <section className='mb-12'>
      <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
        <Clock10Icon />
        Your Time Locks
      </h2>
      <p className='text-muted-foreground mb-6'>
        View and manage your Solana time-based locks wallets
      </p>

      {isPending ? (
        renderLoadingState()
      ) : totalItems > 0 ? (
        <Tabs defaultValue='locked' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='locked' className='flex items-center gap-2'>
              <LockIcon className='h-4 w-4' />
              Locked ({lockedItems.length})
            </TabsTrigger>
            <TabsTrigger value='unlocked' className='flex items-center gap-2'>
              <UnlockIcon className='h-4 w-4' />
              Unlocked ({unlockedItems.length})
            </TabsTrigger>
          </TabsList>

          {renderTabContent(lockedItems, 'No locked vaults yet')}
          {renderTabContent(unlockedItems, 'No unlocked vaults yet')}
        </Tabs>
      ) : (
        renderEmptyState('No time locks created yet')
      )}
    </section>
  );
};

export default TimeLockList;
