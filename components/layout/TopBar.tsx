// components/layout/TopBar.tsx
'use client';

import {
  Menu,
  PanelTopOpen,
  Phone,
  User,
  LogOut,
  LayoutDashboard,
  LogIn,
  UserPlus,
  PlusCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth-context';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export default function TopBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handlePostListing = () => {
    if (isAuthenticated) {
      // Navigate to post listing page (placeholder for now)
      router.push('/listings/new');
    } else {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ];

  return (
    <header
      className={cn(
        // Positioning & container - High z-index to stay above Sheet
        'fixed top-4 left-1/2 -translate-x-1/2 z-95',
        'w-[min(94%,1280px)] max-w-7xl',

        // Glassmorphism + shape
        'bg-transparent backdrop-blur-md backdrop-saturate-150', // increased blur for consistency
        'border border-white/10 dark:border-white/8',
        'rounded-2xl shadow-sm shadow-black/5',

        // Very subtle inner glow (optional but looks premium)
        "before:content-[''] before:absolute before:inset-0",
        'before:rounded-2xl before:bg-linear-to-b',
        'before:from-white/8 before:to-transparent before:opacity-60',
        'before:pointer-events-none',
      )}
    >
      <div className='px-5 sm:px-7 h-16 sm:h-16 flex items-center justify-between relative'>
        {/* LEFT - Logo + Navigation */}
        <div className='flex items-center gap-10'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-2.5'
          >
            <Image
              src='/logo.png'
              alt='Logo'
              width={50}
              height={50}
            />
          </Link>

          {/* Main Navigation - hidden on mobile */}
          <nav className='hidden md:flex items-center gap-7'>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className='text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT - Contact + CTA + Mobile Menu */}
        {/* RIGHT - Contact + CTA + Mobile Menu */}
        <div className='flex items-center gap-3 sm:gap-4'>
          {/* Phone - visible on larger screens */}
          <Link
            href='tel:+49123456789'
            className='hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors'
          >
            <Phone size={18} />
            <span>+49 123 456 789</span>
          </Link>

          {/* CTA Button - "Post a Listing" */}
          <Button
            variant={'link'}
            onClick={handlePostListing}
            className=''
          >
            Post a Listing
          </Button>

          {/* User Auth Dropdown - Desktop/Icon Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full hidden md:flex'
              >
                <User className='h-5 w-5' />
                <span className='sr-only'>User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-56 z-100'
            >
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className='mr-2 h-4 w-4' />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePostListing}>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    <span>Post a Listing</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    variant='destructive'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Welcome</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/login')}>
                    <LogIn className='mr-2 h-4 w-4 text-primary' />
                    <span>Log in</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/signup')}>
                    <UserPlus className='mr-2 h-4 w-4 text-primary' />
                    <span>Sign up</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button (Sheet Trigger) */}
          <Button
            variant='ghost'
            size='icon'
            aria-label='Toggle menu'
            className='md:hidden'
            onClick={() => setIsSheetOpen(!isSheetOpen)}
          >
            {isSheetOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </Button>

          <Sheet
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            modal={false}
          >
            <SheetContent
              side='top'
              className='w-full pt-28 pb-10 z-90'
            >
              {' '}
              {/* z-[90] to be below topbar (z-[100]) */}
              <SheetHeader className='hidden'>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className='flex flex-col items-center gap-6 text-lg font-medium'>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className='hover:text-primary transition-colors'
                    onClick={() => setIsSheetOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className='h-px w-20 bg-border my-2' />

                {!isAuthenticated ? (
                  <div className='flex flex-col gap-4 mt-4 w-full max-w-xs px-4'>
                    <Button
                      onClick={() => {
                        router.push('/login');
                        setIsSheetOpen(false);
                      }}
                    >
                      Log in
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        router.push('/signup');
                        setIsSheetOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                  </div>
                ) : (
                  <div className='flex flex-col gap-4 mt-4 w-full max-w-xs px-4'>
                    <Button
                      onClick={() => {
                        router.push('/dashboard');
                        setIsSheetOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => {
                        handleLogout();
                        setIsSheetOpen(false);
                      }}
                    >
                      Log out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
