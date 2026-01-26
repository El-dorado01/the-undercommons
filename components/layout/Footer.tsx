import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function Footer() {
  return (
    <footer className='w-full pt-10 border-t border-primary/10 mt-5'>
      <div className='flex flex-col gap-10'>
        {/* Tagline Section */}
        <div className='max-w-4xl'>
          <h2 className='text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight'>
            Give what you can. <br className='hidden md:block' />
            <span className='text-primary'>Get what you need.</span>
          </h2>
        </div>

        {/* Main Content Grid - 3 Columns (50% | 25% | 25%) */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 pt-10'>
          {/* Brand Column - Takes 50% width (col-span-2) */}
          <div className='md:col-span-2 space-y-8'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Logo
                  size='sm'
                  className='items-start'
                />
              </div>
              <p className='text-muted-foreground text-sm leading-relaxed max-w-sm'>
                Building a community where value is shared, not just spent. Join
                the movement to barter time, skills, and resources.
              </p>
            </div>

            {/* Moved Connect Section here */}
            <div className='space-y-3'>
              <h3 className='font-semibold text-foreground text-sm uppercase tracking-wide'>
                Connect
              </h3>
              <div className='flex gap-3'>
                <Link
                  href='https://www.instagram.com/the.undercommons/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-foreground px-3'
                >
                  <Instagram className='w-4 h-4' />
                  <span className='text-xs font-medium'>the.undercommons</span>
                </Link>
                <Link
                  href='mailto:contactus@theundercommons.com'
                  className='p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-foreground'
                >
                  <Mail className='w-4 h-4' />
                </Link>
              </div>
            </div>
          </div>

          {/* Links Column */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground'>Explore</h3>
            <ul className='space-y-3 text-sm text-muted-foreground'>
              <li>
                <Link
                  href='#'
                  className='hover:text-primary transition-colors'
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-primary transition-colors'
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-primary transition-colors'
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-primary transition-colors'
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal/Support Column */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-foreground'>Support</h3>
            <ul className='space-y-3 text-sm text-muted-foreground'>
              <li>
                <Link
                  href='#'
                  className='hover:text-primary transition-colors'
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-primary transition-colors'
                >
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-primary transition-colors'
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href='#'
                  className='hover:text-primary transition-colors'
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground'>
          <p>
            © {new Date().getFullYear()} The Undercommons. All rights reserved.
          </p>
          <div className='flex items-center gap-6'>
            {/* Optional extra bottom links */}
            <span>Made with care.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
