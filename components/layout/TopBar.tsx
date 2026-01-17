// components/layout/TopBar.tsx
'use client';

import { Menu, MenuIcon, PanelTopOpen, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function TopBar() {
  return (
    <header
      className={cn(
        // Positioning & container
        'fixed top-4 left-1/2 -translate-x-1/2 z-50',
        'w-[min(94%,1280px)] max-w-7xl',

        // Glassmorphism + shape
        'bg-transparent backdrop-blur-xs backdrop-saturate-150',
        'border border-white/10 dark:border-white/8',
        'rounded-2xl shadow-sm shadow-black/5',

        // Very subtle inner glow (optional but looks premium)
        "before:content-[''] before:absolute before:inset-0",
        'before:rounded-2xl before:bg-linear-to-b',
        'before:from-white/8 before:to-transparent before:opacity-60',
        'before:pointer-events-none',
      )}
    >
      <div className='px-5 sm:px-7 h-16 sm:h-16 flex items-center justify-between'>
        {/* LEFT - Logo + Navigation */}
        <div className='flex items-center gap-10'>
          {/* Logo */}
          <div className='flex items-center gap-2.5'>
            {/* <div className='w-8 h-8 rounded-lg bg-linear-to-br from-primary to-orange-700 flex items-center justify-center text-white font-bold text-xl'>
              D
            </div>
            <span className='font-semibold text-lg tracking-tight hidden sm:inline-block'>
              El Rey Dorado
            </span> */}
            <Image
              src='/logo.png'
              alt='Logo'
              width={50}
              height={50}
            />
          </div>

          {/* Main Navigation - hidden on mobile */}
          <nav className='hidden md:flex items-center gap-7'>
            <Link
              href='#features'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              Features
            </Link>
            <Link
              href='#pricing'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              Pricing
            </Link>
            <Link
              href='#about'
              className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
            >
              About
            </Link>
          </nav>
        </div>

        {/* RIGHT - Contact + CTA + Mobile Menu */}
        <div className='flex items-center gap-3 sm:gap-4'>
          {/* Phone - visible on larger screens */}
          <Link
            href='tel:+49123456789'
            className='hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
          >
            <Phone size={18} />
            <span>+49 123 456 789</span>
          </Link>

          {/* CTA Button */}
          <Button variant={'link'}>Post a Listing</Button>

          {/* Mobile Menu Button */}
          <Button
            variant='ghost'
            size='icon'
            aria-label='Toggle menu'
          >
            <PanelTopOpen className='hidden md:block h-5 w-5' />
            <MenuIcon className='md:hidden h-5 w-5' />
          </Button>
        </div>
      </div>
    </header>
  );
}
