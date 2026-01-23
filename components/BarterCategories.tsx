'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ArrowRight,
  Clock,
  Hammer,
  Scissors,
  BicepsFlexed,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- DATA ---

const CATEGORIES = [
  {
    id: 'time',
    label: 'Time',
    icon: Clock,
    shortDescription:
      'Exchange your time to help others with their daily needs.',
    longDescription:
      "Time is one of our most valuable assets. Whether it's waiting in line for a busy professional, offering companionship to the elderly, or helping someone run errands, your time can make a significant difference. Connect with neighbors who need a helping hand.",
    features: [
      'Assistance with daily errands & grocery shopping',
      'Companionship for events or appointments',
      'Queue waiting services for ticket launches',
      'Carpooling, rides, and transportation help',
      'Pet sitting or dog walking services',
    ],
  },
  {
    id: 'skill',
    label: 'Skill',
    icon: Scissors,
    shortDescription: 'Share your expertise, from coding to creative arts.',
    longDescription:
      'Everyone has a talent worth sharing. Offer your professional skills in exchange for what you need. From teaching a language or instrument to providing technical support, graphic design, or consulting, your skills can open doors to new opportunities.',
    features: [
      'Professional consulting & business advice',
      'Creative arts, graphic design & photography',
      'Technical programming & IT support',
      'Language tutoring & music lessons',
      'Accounting, legal or administrative help',
    ],
  },
  {
    id: 'labor',
    label: 'Labor',
    icon: BicepsFlexed,
    shortDescription: 'Physical assistance for moving, gardening, and repairs.',
    longDescription:
      'Got a strong back or a green thumb? Offer your physical labor for tasks that others might find difficult. Help neighbors move homes, maintain their gardens, clean out garages, or handle minor home repairs. Physical effort is highly valued in the Undercommons.',
    features: [
      'Moving assistance & heavy lifting',
      'Garden maintenance & landscaping',
      'Deep house cleaning & organization',
      'Junk removal & hauling services',
      'Minor home repairs & painting',
    ],
  },
  {
    id: 'space',
    label: 'Space',
    icon: Home,
    shortDescription: 'Monetize unused space like storage, parking, or desks.',
    longDescription:
      'Do you have an empty garage, a spare room, or an unused parking spot? Turn your underutilized space into a valuable asset. Offer secure storage for neighbors, a quiet co-working desk for a freelancer, or a venue for small community events.',
    features: [
      'Secure storage units & garage space',
      'Event venues for small gatherings',
      'Office sharing & co-working desks',
      'Private parking spot rentals',
      'Garden plots for urban farming',
    ],
  },
  {
    id: 'items',
    label: 'Items',
    icon: Hammer,
    shortDescription: 'Trade tools, gear, furniture, and household goods.',
    longDescription:
      "Don't let useful items gather dust. Trade tools you rarely use, swap furniture that no longer fits your style, or exchange outgrown clothing. The Items category encourages a circular economy where goods find new life with people who need them.",
    features: [
      'Tool lending libraries & equipment sharing',
      'High-quality clothing & gear exchange',
      'Furniture trading & home decor swaps',
      'Kitchen appliances & party supplies',
      'Books, electronics & hobby gear',
    ],
  },
];

// --- COMPONENT ---

export default function BarterCategories() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);

  // Auto-cycle through categories
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = CATEGORIES.findIndex((cat) => cat.id === current);
        const nextIndex = (currentIndex + 1) % CATEGORIES.length;
        return CATEGORIES[nextIndex].id;
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const activeCategory =
    CATEGORIES.find((cat) => cat.id === activeTab) || CATEGORIES[0];

  return (
    <section className='w-full pt-14'>
      {/* Header */}
      <div className='mb-10 max-w-2xl'>
        <span className='text-sm font-medium tracking-widest text-muted-foreground uppercase mb-4 block'>
          // Categories //
        </span>
        <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-6 uppercase'>
          Everything you can barter
        </h2>
        <p className='text-muted-foreground leading-relaxed'>
          Users create posts by selecting a category and listing what they need
          and what they can offer in return.
        </p>
      </div>

      {/* Content Block */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start'>
        {/* Left: Navigation Tabs */}
        <div className='lg:col-span-5 space-y-2'>
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={cn(
                'w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden',
                activeTab === category.id
                  ? 'bg-gray-50 shadow-sm'
                  : 'hover:bg-gray-50/50',
              )}
            >
              <div className='flex items-center justify-between relative z-10'>
                <div className='flex items-center gap-4'>
                  <span
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                      activeTab === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-muted-foreground group-hover:bg-gray-200',
                    )}
                  >
                    <category.icon className='w-5 h-5' />
                  </span>
                  <span
                    className={cn(
                      'text-lg font-medium transition-colors',
                      activeTab === category.id
                        ? 'text-foreground'
                        : 'text-muted-foreground group-hover:text-foreground',
                    )}
                  >
                    {category.label}
                  </span>
                </div>

                {activeTab === category.id && (
                  <motion.div
                    layoutId='active-indicator'
                    className='text-primary'
                  >
                    <ArrowRight className='w-5 h-5' />
                  </motion.div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Right: Dynamic Content */}
        <div className='lg:col-span-7 pt-2'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeCategory.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className='space-y-6'
            >
              <div>
                <h3 className='text-xl md:text-2xl font-bold text-foreground mb-3'>
                  {activeCategory.label}
                </h3>
                <p className='text-lg text-foreground/80 leading-relaxed mb-4'>
                  {activeCategory.shortDescription}
                </p>
                <p className='text-muted-foreground leading-relaxed'>
                  {activeCategory.longDescription}
                </p>
              </div>

              <div className='h-px w-full bg-border/50' />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
                {activeCategory.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className='flex items-start gap-3'
                  >
                    <div className='shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5'>
                      <Check className='w-3 h-3 text-primary' />
                    </div>
                    <span className='text-sm font-medium text-foreground/80 leading-tight'>
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Optional Decorative Image Area - abstract representation */}
              <div className='mt-8 w-full h-48 md:h-56 rounded-2xl bg-transparent flex items-center justify-center border border-border/30 relative overflow-hidden group'>
                <div className='absolute inset-0 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] bg-size-[16px_16px] opacity-30' />
                <activeCategory.icon className='w-20 h-20 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500 ease-out' />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
