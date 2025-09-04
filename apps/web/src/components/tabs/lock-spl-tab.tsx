import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Image from 'next/image';

const LockSplTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lock SPL Token</CardTitle>
        <CardDescription>
          Deposit SPL tokens into a secure time-locked account.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='amount'>Amount (SPL)</Label>
          <div className='flex items-center gap-2 mt-1'>
            <Image
              src='/sol.svg'
              alt='SOL'
              className='w-5 h-5'
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
          <p className='text-xs text-muted-foreground mt-1'>
            Minimum: 0.001 SOL
          </p>
        </div>
        <div>
          <Label htmlFor='duration'>Duration</Label>
          <select id='duration' className='w-full mt-1 p-2 border rounded'>
            <option value='1'>1 day</option>
            <option value='7'>1 week</option>
            <option value='30'>1 month</option>
            <option value='365'>1 year</option>
          </select>
        </div>
        <Button className='w-full'>Create SPL-Token Lock</Button>
      </CardContent>
    </Card>
  );
};

export default LockSplTab;
