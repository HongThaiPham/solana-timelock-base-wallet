'use client';

import { useModal, useAccount, useWallet, useLogout } from '@getpara/react-sdk';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Loader2, Wallet2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectButton({
  className,
  label = 'Connect Wallet',
}: {
  className?: string;
  label?: string;
}) {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();
  const { logout, isPending } = useLogout();

  if (!isConnected) {
    return (
      <Button
        variant='outline'
        onClick={() => openModal()}
        className={cn('h-full', className)}
        disabled={isPending}
      >
        {label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='h-full flex items-center justify-center'
          disabled={isPending}
        >
          {isPending ? <Loader2 className='animate-spin' /> : <Wallet2Icon />}
          {`${wallet?.address?.slice(0, 6)}...${wallet?.address?.slice(-4)}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openModal()}>
          Manage wallet
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            logout({
              clearPregenWallets: false, // Keep pre-generated wallets
            })
          }
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    // <Button variant='outline' onClick={() => openModal()} className='h-full'>
    //   {isConnected
    //     ? `Connected: ${wallet?.address?.slice(0, 6)}...${wallet?.address?.slice(-4)}`
    //     : 'Connect Wallet'}
    // </Button>
  );
}
