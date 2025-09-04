'use client';
import Link from 'next/link';
import { ModeToggle } from './mode-toggle';
import { ConnectButton } from './connect-button';
import { Button } from './ui/button';
import GithubIcon from './github-icon';
import XIcon from './x-icon';
import Image from 'next/image';

export default function Header() {
  return (
    <div className='border-b'>
      <div className='flex flex-row items-center justify-between px-4 py-3 container mx-auto'>
        <div className='flex items-center gap-6'>
          <Image
            src='/sol.svg'
            alt='SOL'
            className='w-5 h-5'
            width={'5'}
            height={'5'}
          />
          <h1 className='text-xl font-bold'>Solana Time-base wallet</h1>
        </div>
        <div className='flex items-center gap-2'>
          <ConnectButton />
          <Button variant='secondary' size={'icon'} asChild>
            <Link
              href={'https://github.com/HongThaiPham/time-locked-wallet'}
              target='_blank'
              className='gap-2'
            >
              <GithubIcon />{' '}
            </Link>
          </Button>

          <Button variant='secondary' asChild size={'icon'}>
            <Link
              href={'https://x.com/leopham_it'}
              target='_blank'
              className='gap-2'
            >
              <XIcon />
            </Link>
          </Button>

          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
