import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LockIcon } from 'lucide-react';
import LockSolTab from './lock-sol-tab';
import LockSplTab from './lock-spl-tab';

const InitVaultTabs = () => {
  return (
    <Tabs defaultValue='sol'>
      <TabsList>
        <TabsTrigger value='sol'>
          <LockIcon className='mr-2 h-4 w-4' />
          Lock SOL
        </TabsTrigger>
        <TabsTrigger value='spl'>
          <LockIcon className='mr-2 h-4 w-4' />
          Lock SPL token
        </TabsTrigger>
      </TabsList>
      <TabsContent value='sol'>
        <LockSolTab />
      </TabsContent>
      <TabsContent value='spl'>
        <LockSplTab />
      </TabsContent>
    </Tabs>
  );
};

export default InitVaultTabs;
