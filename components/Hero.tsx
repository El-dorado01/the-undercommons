import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Plus, Search } from 'lucide-react';
import { Separator } from './ui/separator';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className='flex flex-col pt-24'>
      <div className='flex flex-col md:flex-row md:space-x-10 space-y-3 items-start'>
        <h1 className='w-full md:w-3/5 uppercase font-extrabold tracking-wider text-4xl md:text-6xl'>
          The Undercommons
        </h1>

        <div className='w-full md:w-2/5 min-w-0 bg-transparent backdrop-blur-sm rounded-2xl p-4 shadow-sm'>
          <div className='px-5 sm:px-7 h-16 flex items-center justify-between gap-4 border rounded-2xl min-w-0'>
            <input
              type='text'
              placeholder='Search the undercommons...'
              className='bg-transparent outline-none w-full min-w-0 placeholder:text-muted-foreground'
            />
            <Button
              size={'icon'}
              aria-label='Search'
            >
              <Search className='h-4 w-4' />
            </Button>
          </div>
          {/* OR Divider */}
          <div className='flex items-center my-4 gap-3'>
            <Separator className='flex-1' />
            <span className='text-xs text-muted-foreground mx-2 whitespace-nowrap'>
              OR
            </span>
            <Separator className='flex-1' />
          </div>
          {/* Post Listing Button */}
          <Button className='w-full py-6'>
            <Plus className='h-4 w-4 mr-2' /> Post a Listing
          </Button>
        </div>
      </div>

      <div className='mt-8'>
        {/* Placeholder for hero copy / CTA */}
        <p className='text-muted-foreground max-w-xl'>
          The Undercommons is an online bartering marketplace that allows users
          to trade their Time, Skills, Space, Labor, or Items interchangeably.
          Simply set up a profile, post what you're offering and browse what
          others have posted. When you find a match, reach out to make a
          trade—no money required.
        </p>

        {/* CTA Buttons */}
        <Button
          asChild
          variant={'outline'}
          className='mt-6 py-6'
        >
          <Link href={'/discover'}>
            Discover More <ArrowRight className='h-4 w-4 ml-2' />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Hero;
