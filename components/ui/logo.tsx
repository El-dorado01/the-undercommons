'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconGridDots } from '@tabler/icons-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  textOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo = ({
  className,
  iconOnly,
  textOnly,
  size = 'md',
}: LogoProps) => {
  const sizeClasses = {
    sm: {
      text: 'text-base',
      dot: 'w-0.5 h-0.5',
      gap: 'gap-0.5',
    },
    md: {
      text: 'text-xl',
      dot: 'w-1 h-1',
      gap: 'gap-1',
    },
    lg: {
      text: 'text-2xl',
      dot: 'w-1.5 h-1.5',
      gap: 'gap-1.5',
    },
    xl: {
      text: 'text-4xl',
      dot: 'w-2 h-2',
      gap: 'gap-2',
    },
  };

  const currentSize = sizeClasses[size];

  const DotGrid = () => (
    <div className={cn('flex flex-col items-center', currentSize.gap)}>
      <div className={cn('flex', currentSize.gap)}>
        <div className={cn('rounded-full bg-foreground/60', currentSize.dot)} />
        <div className={cn('rounded-full bg-foreground/60', currentSize.dot)} />
        <div className={cn('rounded-full bg-foreground/60', currentSize.dot)} />
      </div>
      <div className={cn('flex', currentSize.gap)}>
        <div className={cn('rounded-full bg-foreground/60', currentSize.dot)} />
        <div className={cn('rounded-full bg-foreground/60', currentSize.dot)} />
        <div className={cn('rounded-full bg-foreground/60', currentSize.dot)} />
      </div>
    </div>
  );

  return (
    <Link
      href='/'
      className={cn(
        'group flex flex-col justify-center items-center transition-opacity hover:opacity-90 font-serif font-semibold shrink-0',
        className,
      )}
    >
      {!iconOnly && (
        <span
          className={cn(
            'font-lora lowercase text-foreground tracking-tight whitespace-nowrap shrink-0',
            currentSize.text,
          )}
        >
          the undercommons
        </span>
      )}
      {!textOnly && (
        <div className={cn(!iconOnly && 'mt-1', 'w-full')}>
          <DotGrid />
        </div>
      )}
    </Link>
  );
};
