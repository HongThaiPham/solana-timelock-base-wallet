'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import Image from 'next/image';
import Calendar24 from '../calendar-24';
import { useAccount } from '@getpara/react-sdk';
import { ConnectButton } from '../connect-button';

const LockSolTab = () => {
  const { isConnected } = useAccount();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lock SOL</CardTitle>
        <CardDescription>
          Deposit SOL into a secure time-locked account.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 flex justify-between'>
        <div className='space-y-2'>
          <Label htmlFor='amount'>Amount (SOL)</Label>
          <div className='flex items-center gap-2'>
            <Image
              src='/sol.svg'
              alt='SOL'
              className='size-5 object-center'
              width={'5'}
              height={'5'}
            />
            <Input
              id='amount'
              type='number'
              placeholder='0.001'
              min='0.001'
              step='0.001'
            />
            <span className='text-sm text-muted-foreground'>SOL</span>
          </div>
          <p className='text-xs text-muted-foreground'>Minimum: 0.001 SOL</p>
        </div>
        <div className='space-y-2'>
          <Calendar24 />
        </div>
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button className='w-full'>Create SOL Lock</Button>
        ) : (
          <ConnectButton
            className='w-full'
            label='Please connect your wallet first'
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default LockSolTab;
