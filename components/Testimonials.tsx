'use client';

import * as React from 'react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

// --- CONFIGURATION: EDIT DATA HERE ---

const STATS = {
  value: '+99%',
  label: 'Achieving Excellence Every Time',
};

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      'Working with Boulevard felt less like building with a creative partner. Every visual, every word-just hit right.',
    author: 'David Wilson',
    role: 'Business Consultant',
    image: '/placeholder-user.jpg', // You can replace this with actual image paths
    socialUrl: '#',
  },
  {
    id: 2,
    quote:
      "The attention to detail was exceptional. They didn't just meet our expectations, they completely redefined them.",
    author: 'Sarah Jenkins',
    role: 'Marketing Director',
    image: '/placeholder-user-2.jpg',
    socialUrl: '#',
  },
  {
    id: 3,
    quote:
      'A truly transformative experience for our brand identity. Professional, creative, and incredibly efficient.',
    author: 'Michael Chen',
    role: 'Tech Founder',
    image: '/placeholder-user-3.jpg',
    socialUrl: '#',
  },
];

const BRANDS = [
  { name: 'Sisyphus', logo: 'sisyphus' },
  { name: 'Magnolia', logo: 'magnolia' },
  { name: 'Epicurious', logo: 'epicurious' },
  { name: 'Sisyphus', logo: 'sisyphus' },
];

// --- COMPONENT ---

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveIndex(
      (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  };

  const activeTestimonial = TESTIMONIALS[activeIndex];

  return (
    <section className='w-full pt-20'>
      {/* Header Row */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6'>
        <div className='space-y-4'>
          <span className='text-sm font-medium tracking-widest text-muted-foreground uppercase'>
            // Testimonials //
          </span>
          <h2 className='text-3xl md:text4xl font-extrabold tracking-tight text-foreground uppercase'>
            What Our Clients Say
          </h2>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='default'
            size='icon'
            className='rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all'
            onClick={prevTestimonial}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <Button
            variant='default'
            size='icon'
            className='rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all'
            onClick={nextTestimonial}
          >
            <ArrowRight className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <div className='w-full h-px bg-primary/20 mb-16' />

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start'>
        {/* Left Column: Static Info */}
        <div className='lg:col-span-4 space-y-12'>
          <div className='max-w-xs'>
            <p className='font-semibold uppercase leading-relaxed text-foreground/90'>
              Words from the ones who know us best
            </p>
          </div>

          <div className='space-y-2'>
            <span className='text-3xl md:text-4xl font-medium tracking-tighter text-foreground block'>
              {STATS.value}
            </span>
            <p className='text-muted-foreground'>{STATS.label}</p>
          </div>
        </div>

        {/* Right Column: Dynamic Testimonial */}
        <div className='lg:col-span-8 relative min-h-[300px]'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className='space-y-10'
            >
              <div className='relative'>
                <h3 className='text-xl md:text-2xl font-medium leading-tight tracking-tight text-foreground'>
                  "{activeTestimonial.quote}"
                </h3>
              </div>

              <div className='flex items-center justify-between border-t border-primary/10 pt-8'>
                <div className='flex items-center gap-4'>
                  <div className='h-14 w-14 rounded-full bg-primary/20 overflow-hidden relative'>
                    {/* Placeholder for user image if not provided */}
                    <div className='absolute inset-0 bg-primary/30 flex items-center justify-center text-gray-500'>
                      {/* Fallback Initial if no image */}
                      {activeTestimonial.author[0]}
                    </div>
                    {/* Uncomment below when real images are available */}
                    {/* <Image 
                          src={activeTestimonial.image} 
                          alt={activeTestimonial.author} 
                          fill 
                          className="object-cover" 
                        /> */}
                  </div>
                  <div>
                    <h4 className='font-bold text-lg text-foreground'>
                      {activeTestimonial.author}
                    </h4>
                    <p className='text-muted-foreground'>
                      {activeTestimonial.role}
                    </p>
                  </div>
                </div>

                <Link
                  href={activeTestimonial.socialUrl}
                  className='p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-foreground'
                >
                  <Twitter className='w-5 h-5' />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Brand Footer */}
      {/* <div className='mt-24 space-y-6'>
        <p className='text-sm font-medium text-foreground/80 flex items-center gap-2'>
          <span className='h-1.5 w-1.5 rounded-full bg-foreground'></span>
          Working with brands that matter
        </p>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {BRANDS.map((brand, idx) => (
            <div
              key={idx}
              className='group flex items-center justify-center h-28 border border-primary/20 rounded-2xl bg-white hover:border-primary/30 hover:shadow-sm transition-all duration-300'
            >
              <BrandLogo name={brand.name} />
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
}

// Simple internal component to render brand logos based on name
// In a real app, these would be SVGs or Image components
function BrandLogo({ name }: { name: string }) {
  const isSisyphus = name === 'Sisyphus';
  const isMagnolia = name === 'Magnolia';
  const isEpicurious = name === 'Epicurious';

  return (
    <div className='flex items-center gap-2 text-foreground font-bold text-xl'>
      {/* Abstract Icon Placeholders matching the style */}
      {isSisyphus && (
        <>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            className='text-foreground'
          >
            <path
              d='M16.5 2L20.5 6L16.5 10'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M12 7L16 11L12 15'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M7.5 12L11.5 16L7.5 20'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span className='tracking-tight'>Sisyphus</span>
        </>
      )}

      {isMagnolia && (
        <>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            className='text-foreground'
          >
            <path
              d='M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinejoin='round'
            />
          </svg>
          <span className='tracking-tight'>Magnolia</span>
        </>
      )}

      {isEpicurious && (
        <>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            className='text-foreground'
          >
            <path
              d='M6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34315 4.34315 3 6 3Z'
              stroke='currentColor'
              strokeWidth='2'
            />
            <path
              d='M9 8H15'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M9 12H15'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M9 16H13'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
          <span className='tracking-tight'>Epicurious</span>
        </>
      )}
    </div>
  );
}
