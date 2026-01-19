import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import {
  IconSettings,
  IconClipboardList,
  IconMessage,
  IconPlus,
  IconLogout,
  IconLayout,
  IconClipboardListFilled,
  IconMessageFilled,
  IconSettingsFilled,
  IconLayoutFilled,
} from '@tabler/icons-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-context';
import Link from 'next/link';
import Image from 'next/image';
import { CommandIcon } from 'lucide-react';

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Helper to get initials
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile =
    (user as any)?.data?.data?.attributes?.profile ||
    (user?.attributes as any)?.profile;
  const firstName = profile?.firstName || 'User';
  const lastName = profile?.lastName || '';
  const displayName =
    profile?.publicData?.displayName || `${firstName} ${lastName}`;
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
  // Get avatar URL from included relationship or fallback to metadata
  const avatarUrl =
    (user as any)?.data.included[0]?.attributes?.variants?.['default']?.url ||
    (user as any)?.profileImage?.attributes?.variants?.['default']?.url ||
    (user as any)?.profileImage?.attributes?.variants?.['scaled-small']?.url ||
    (user as any)?.metadata?.avatarUrl;

  const links = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon:
        pathname === '/dashboard' ? (
          <IconLayoutFilled className='h-5 w-5 shrink-0 text-primary dark:text-primary' />
        ) : (
          <IconLayout className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
        ),
    },
    {
      label: 'My Listings',
      href: '/dashboard/listings',
      icon: pathname?.startsWith('/dashboard/listings') ? (
        <IconClipboardListFilled className='h-5 w-5 shrink-0 text-primary dark:text-primary' />
      ) : (
        <IconClipboardList className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
    {
      label: 'Messages',
      href: '/dashboard/messages',
      icon: pathname?.startsWith('/dashboard/messages') ? (
        <IconMessageFilled className='h-5 w-5 shrink-0 text-primary dark:text-primary' />
      ) : (
        <IconMessage className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: pathname?.startsWith('/dashboard/settings') ? (
        <IconSettingsFilled className='h-5 w-5 shrink-0 text-primary dark:text-primary' />
      ) : (
        <IconSettings className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
    {
      label: 'Post Listing',
      href: '/dashboard/listings/new',
      icon: (
        <IconPlus className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <Sidebar
      open={open}
      setOpen={setOpen}
      // animate={false}
    >
      <SidebarBody className='justify-between gap-10 h-screen fixed inset-0 z-50'>
        <div className='flex flex-1 flex-col overflow-x-hidden overflow-y-auto'>
          <>
            <Logo />
          </>
          <div className='mt-8 flex flex-col gap-2'>
            {links.map((link, idx) => {
              const isActive =
                link.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname?.startsWith(link.href);
              return (
                <SidebarLink
                  key={idx}
                  link={link}
                  className={cn(
                    isActive &&
                      'rounded-md text-primary dark:text-primary/70 font-medium',
                  )}
                />
              );
            })}
            <div
              onClick={() => logout()}
              className={cn(
                'flex items-center justify-start gap-2 cursor-pointer group/sidebar py-2 text-red-500! hover:text-red-600!',
              )}
            >
              <IconLogout className='h-5 w-5 shrink-0 text-red-500 group-hover/sidebar:text-red-600' />

              <motion.span
                // animate={{
                //   display: animate
                //     ? open
                //       ? 'inline-block'
                //       : 'none'
                //     : 'inline-block',
                //   opacity: animate ? (open ? 1 : 0) : 1,
                // }}
                className='text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block p-0! m-0! text-red-500! hover:text-red-600!'
              >
                Logout
              </motion.span>
            </div>
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: displayName,
              href: '/dashboard/profile',
              icon: avatarUrl ? (
                <Image
                  src={avatarUrl}
                  className='h-7 w-7 shrink-0 rounded-full'
                  width={50}
                  height={50}
                  alt='Avatar'
                />
              ) : (
                <div className='h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary'>
                  {profile?.abbreviatedName || getInitials(firstName)}
                </div>
              ),
            }}
          />
        </div>
      </SidebarBody>
      <div
        className={cn(
          'mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-background md:flex-row dark:border-neutral-700',
          'min-h-screen pl-8 md:pl-20 pr-8 md:pr-4 py-4',
        )}
      >
        {children}
      </div>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href='/'
      className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black'
    >
      {/* <div className='h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white' /> */}
      {/* <Image src="/logo.png" alt="Logo" width={50} height={50} className='w-10 h-10' /> */}
      <CommandIcon className='h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200' />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='font-medium whitespace-pre text-black dark:text-white'
      >
        The Undercommons
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href='/'
      className='relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black'
    >
      <div className='h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white' />
    </Link>
  );
};
