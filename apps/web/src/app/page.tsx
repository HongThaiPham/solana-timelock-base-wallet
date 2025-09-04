'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import InitVaultTabs from '@/components/tabs/init-vault-tab';
import { Clock10Icon } from 'lucide-react';
import HowItWorks from '@/components/how-it-works';

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-8 space-y-8 max-w-7xl'>
      <section>
        <h2 className='text-2xl font-bold mb-4'>
          Management SOL/SPL-token Time-base Lock wallet
        </h2>
        <p className='text-muted-foreground mb-6'>
          Lock your SOL or SPL tokens for a specified period. Funds will be
          secure until the unlock time.
        </p>
      </section>
      <HowItWorks />
      <div className='grid md:grid-cols-3 gap-6 mb-12'>
        <div className='col-span-2'>
          <InitVaultTabs />
        </div>
        <div>
          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-4 flex items-center gap-2'>
              <Clock10Icon />
              Your Time Locks
            </h2>
            <p className='text-muted-foreground mb-6'>
              View and manage your Solana time-based locks wallets
            </p>
            <Card>
              <CardContent className='py-8 text-center'>
                <p className='text-muted-foreground'>
                  No time locks created yet
                </p>
                <p className='text-sm text-muted-foreground mt-2'>
                  Create your first SOL time lock to get started
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
