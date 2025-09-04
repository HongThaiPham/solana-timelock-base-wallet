'use client';
import Link from 'next/link';
import { ModeToggle } from './mode-toggle';
import { ConnectButton } from './connect-button';

export default function Header() {
  const links = [{ to: '/', label: 'Home' }] as const;

  return (
    <div>
      <div className='flex flex-row items-center justify-between px-2 py-1 container mx-auto'>
        <nav className='flex gap-4 text-lg'>
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className='flex items-center gap-2'>
          <ConnectButton />
          <ModeToggle />
        </div>
      </div>
      <hr />
    </div>
  );
}
