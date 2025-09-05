import { Card, CardContent } from '@/components/ui/card';
import InitVaultTabs from '@/components/tabs/init-vault-tab';
import { Clock10Icon } from 'lucide-react';
import HowItWorks from '@/components/how-it-works';
import TimeLockList from '@/components/time-lock-list';

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

        <TimeLockList />
      </div>
    </div>
  );
}
