'use client';

import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Mock Data
const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Guitar Lessons for Coding Help',
    description:
      'I can teach you acoustic or electric guitar (beginner to intermediate) in exchange for help with my React project.',
    category: 'Skill',
    location: 'Berlin, DE',
    author: 'Alex M.',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Garden Maintenance for Fresh Produce',
    description:
      'Offering weekend gardening labor. Happy to help weed, plant, or harvest in exchange for a box of fresh veggies.',
    category: 'Labor',
    location: 'Hamburg, DE',
    author: 'Sarah K.',
    image:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Vintage Film Camera Swap',
    description:
      'Have a Canon AE-1 in great condition. Looking to trade for a decent road bike or similar value item.',
    category: 'Items',
    location: 'Munich, DE',
    author: 'Jonas B.',
    image:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop',
  },
  {
    id: '4',
    title: 'Co-working Desk in Kreuzberg',
    description:
      'I have an empty desk in my studio. Available Mon-Fri 9-5. Looking for graphic design help in return.',
    category: 'Space',
    location: 'Berlin, DE',
    author: 'Elena R.',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop',
  },
  {
    id: '5',
    title: 'Dog Walking for Spanish Lessons',
    description:
      'Love dogs? I need a walker for my Golden Retriever twice a week. I can teach you Spanish (native speaker).',
    category: 'Time',
    location: 'Cologne, DE',
    author: 'Mateo L.',
    image:
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&auto=format&fit=crop',
  },
  {
    id: '6',
    title: 'Carpentry Repairs for Website SEO',
    description:
      'Professional carpenter offering 5 hours of work (shelves, repairs, etc.) in exchange for SEO audit of my site.',
    category: 'Skill',
    location: 'Frankfurt, DE',
    author: 'Thomas W.',
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop',
  },
];

export default function FeaturedListings() {
  const router = useRouter();
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnMouseEnter: true, stopOnInteraction: false }),
  );

  return (
    <section
      id='featured'
      className='py-16 md:py-24 overflow-hidden relative'
    >
      <div className='max-w-7xl mx-auto mb-10 md:mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-4'>
        <div>
          <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight mb-4 uppercase'>
            Recently Added
          </h2>
          <p className='text-muted-foreground text-lg max-w-xl'>
            See what the community is trading right now. From skills to spaces,
            find your next barter opportunity.
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard')}
          variant='outline'
          className='hidden md:flex'
        >
          View All Listings
        </Button>
      </div>

      <div className='max-w-7xl mx-auto md:px-6'>
        <Carousel
          plugins={[plugin.current]}
          className='w-full'
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent className='-ml-4'>
            {MOCK_LISTINGS.map((listing) => (
              <CarouselItem
                key={listing.id}
                className='pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4'
              >
                <div className='p-1'>
                  <Card className='overflow-hidden group hover:shadow-lg transition-shadow relative h-[400px] border-none rounded-2xl'>
                    {/* Background Image */}
                    <div className='absolute inset-0 bg-neutral-100 dark:bg-neutral-800 pointer-events-none'>
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                      />
                    </div>

                    {/* Gradient Overlay */}
                    <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent pointer-events-none' />

                    {/* Content Overlay */}
                    <div className='absolute inset-x-0 bottom-0 p-5 pb-8 text-white flex flex-col h-full justify-end'>
                      <div className='translate-y-4 group-hover:translate-y-0 transition-transform duration-300'>
                        {/* Author Info */}
                        <div className='flex items-center gap-2 mb-3 opacity-90'>
                          <div className='w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold backdrop-blur-xs'>
                            {listing.author[0]}
                          </div>
                          <span className='text-xs font-medium tracking-wide'>
                            {listing.author}
                          </span>
                        </div>

                        <h3 className='text-xl font-bold leading-tight mb-2 line-clamp-2'>
                          {listing.title}
                        </h3>
                        <p className='text-sm text-white/80 line-clamp-2 mb-4'>
                          {listing.description}
                        </p>

                        <div className='flex flex-wrap gap-2 mb-5'>
                          <Badge
                            variant='secondary'
                            className='gap-1.5 bg-white/10 text-white border-white/20 backdrop-blur-xs hover:bg-white/20 transition-colors'
                          >
                            <Tag className='w-3 h-3' />
                            {listing.category}
                          </Badge>
                          <Badge
                            variant='secondary'
                            className='gap-1.5 bg-white/10 text-white border-white/20 backdrop-blur-xs hover:bg-white/20 transition-colors'
                          >
                            <MapPin className='w-3 h-3' />
                            {listing.location}
                          </Badge>
                        </div>

                        <Button
                          onClick={() => router.push('/signup')}
                          className='w-full bg-white text-black hover:bg-white/90 font-medium'
                          size='lg'
                        >
                          Ask to Trade
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Controls */}
          <div className='hidden md:block'>
            <CarouselPrevious className='left-0 -translate-x-1/2' />
            <CarouselNext className='right-0 translate-x-1/2' />
          </div>
        </Carousel>
      </div>

      <div className='md:hidden md:px-6 mt-8'>
        <Button
          onClick={() => router.push('/dashboard')}
          variant='outline'
          className='w-full'
        >
          View All Listings
        </Button>
      </div>
    </section>
  );
}
