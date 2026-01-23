'use client';

import React from 'react';

export default function VideoSection() {
  return (
    <section className='w-full py-12 md:py-16'>
      <div className='max-w-7xl mx-auto mb-6'>
        {/* Header */}
        <div className='max-w-2xl'>
          <span className='text-sm font-medium tracking-widest text-muted-foreground uppercase mb-3 block'>
            // How It Works //
          </span>
          <h2 className='text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-4 uppercase'>
            See The Undercommons in Action
          </h2>
          <p className='text-muted-foreground leading-relaxed'>
            Watch how our community is building a new economy based on mutual
            aid and direct exchange.
          </p>
        </div>
      </div>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Video Container */}
        <div className='relative w-full aspect-video rounded-2xl overflow-hidden border border-border/30 bg-muted/20 shadow-lg'>
          <iframe
            className='absolute inset-0 w-full h-full'
            src='https://www.youtube.com/embed/CC1zPPnf3sc'
            title='The Undercommons Video'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
