'use client';

import { useModal, useAccount, useWallet } from '@getpara/react-sdk';
import { Button } from './ui/button';

export function ConnectButton() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();

  return (
    <Button variant='outline' onClick={() => openModal()}>
      {isConnected
        ? `Connected: ${wallet?.address?.slice(0, 6)}...${wallet?.address?.slice(-4)}`
        : 'Connect Wallet'}
    </Button>
  );
}
