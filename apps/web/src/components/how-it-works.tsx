import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LockIcon, TimerIcon, UnlockIcon } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section>
      <h2 className='text-2xl font-bold mb-4'>How It Works</h2>
      <div className='grid md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <div className='size-12 rounded-full bg-muted flex items-center justify-center'>
                <LockIcon className='size-6' />
              </div>
              Lock Funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Deposit SOL or SPL-Token into a secure time-locked wallet with
              your chosen unlock time.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <div className='size-12 rounded-full bg-muted flex items-center justify-center'>
                <TimerIcon className='size-6' />
              </div>
              Wait Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Your funds are safely stored on-chain. Track the countdown until
              your unlock time.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <div className='size-12 rounded-full bg-muted flex items-center justify-center'>
                <UnlockIcon className='size-6' />
              </div>
              Withdraw
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Once unlocked, close account, withdraw your funds and rent
              directly to your wallet.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HowItWorks;
