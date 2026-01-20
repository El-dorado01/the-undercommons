'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sharetribeSdk } from '@/lib/sharetribe';
// @ts-ignore
import * as SDK from 'sharetribe-flex-sdk';
const { types } = SDK as any;
const { UUID } = types;
import { toast } from 'sonner';
import {
  Loader2,
  Search,
  MessageSquare,
  MapPin,
  Tag,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import Image from 'next/image';

interface Listing {
  id: { uuid: string };
  attributes: {
    title: string;
    description?: string;
    createdAt: string;
    publicData?: {
      category?: string;
      address?: {
        city?: string;
        zip?: string;
      };
    };
  };
  relationships?: {
    author?: {
      data: { id: { uuid: string } };
    };
    images?: {
      data: Array<{ id: { uuid: string } }>;
    };
  };
}

const ITEMS_PER_PAGE = 12;
const CATEGORIES = ['Time', 'Skill', 'Labor', 'Space', 'Items'];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [images, setImages] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, selectedCategory]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await sharetribeSdk.listings.query({
        include: ['images', 'author'],
        pub_state: 'published',
      } as any);

      const listingsData = response?.data?.data || [];
      const includedImages = response?.data?.included || [];

      // Filter out current user's listings
      const otherUsersListings = listingsData.filter((listing: any) => {
        const authorId = listing.relationships?.author?.data?.id?.uuid;
        // The user object has nested data.data.id.uuid structure at runtime
        const currentUserId = (user as any)?.data?.data?.id?.uuid;
        return authorId !== currentUserId;
      });

      // Build image map
      const imageMap = new Map<string, string>();
      (includedImages as any[]).forEach((item: any) => {
        if (item.type === 'image' && item.attributes?.variants?.default?.url) {
          imageMap.set(item.id.uuid, item.attributes.variants.default.url);
        }
      });

      setListings(otherUsersListings as any);
      setImages(imageMap);
    } catch (error: any) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (l) => l.attributes.publicData?.category === selectedCategory,
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((l) => {
        const titleMatch = l.attributes.title.toLowerCase().includes(query);
        const idMatch = l.id.uuid.toLowerCase().includes(query);
        const descMatch = l.attributes.description
          ?.toLowerCase()
          .includes(query);
        return titleMatch || idMatch || descMatch;
      });
    }

    setFilteredListings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getFirstImageUrl = (listing: Listing) => {
    const imageIds = listing.relationships?.images?.data || [];
    if (imageIds.length > 0) {
      return images.get(imageIds[0].id.uuid);
    }
    return null;
  };

  const handleSendInquiry = (listingId: string) => {
    // TODO: Implement messaging/inquiry functionality
    toast.info('Messaging feature coming soon!');
  };

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentListings = filteredListings.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }

    return (
      <div className='flex items-center justify-center gap-2 mt-8'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className='w-4 h-4' />
        </Button>
        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              className='px-2 text-muted-foreground'
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size='sm'
              onClick={() => goToPage(page as number)}
            >
              {page}
            </Button>
          ),
        )}
        <Button
          variant='outline'
          size='sm'
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className='w-4 h-4' />
        </Button>
      </div>
    );
  };

  return (
    <div className='w-full py-6 flex flex-col gap-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Marketplace</h1>
        <p className='text-muted-foreground'>
          Discover what others are offering in the community
        </p>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search by title, ID, or description...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className='w-full md:w-[200px]'>
            <SelectValue placeholder='All Categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem
                key={cat}
                value={cat}
              >
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <p className='text-sm text-muted-foreground'>
          {filteredListings.length}{' '}
          {filteredListings.length === 1 ? 'listing' : 'listings'} found
        </p>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredListings.length === 0 && (
        <Card className='py-12'>
          <CardContent className='flex flex-col items-center justify-center text-center'>
            <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
              <LayoutGrid className='w-8 h-8 text-primary' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>No listings found</h3>
            <p className='text-muted-foreground mb-4'>
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No listings are currently available'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Listings Grid */}
      {!isLoading && currentListings.length > 0 && (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {currentListings.map((listing) => {
              const imageUrl = getFirstImageUrl(listing);
              return (
                <Card
                  key={listing.id.uuid}
                  className='overflow-hidden group hover:shadow-lg transition-shadow relative h-80'
                >
                  {/* Background Image */}
                  <div className='absolute inset-0 bg-neutral-100 dark:bg-neutral-800'>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={listing.attributes.title}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                        <LayoutGrid className='w-12 h-12' />
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent' />

                  {/* Content Overlay */}
                  <div className='absolute inset-x-0 bottom-0 p-4 text-white space-y-3'>
                    <div>
                      <h3 className='text-lg font-semibold line-clamp-2 mb-1'>
                        {listing.attributes.title}
                      </h3>
                      {listing.attributes.description && (
                        <p className='text-sm text-white/80 line-clamp-2'>
                          {listing.attributes.description}
                        </p>
                      )}
                    </div>

                    <div className='flex flex-wrap gap-2'>
                      {listing.attributes.publicData?.category && (
                        <Badge
                          variant='secondary'
                          className='gap-1 bg-white/20 text-white border-white/30 hover:bg-white/30'
                        >
                          <Tag className='w-3 h-3' />
                          {listing.attributes.publicData.category}
                        </Badge>
                      )}
                      {listing.attributes.publicData?.address?.city && (
                        <Badge
                          variant='secondary'
                          className='gap-1 bg-white/20 text-white border-white/30 hover:bg-white/30'
                        >
                          <MapPin className='w-3 h-3' />
                          {listing.attributes.publicData.address.city}
                        </Badge>
                      )}
                    </div>

                    <Button
                      className='w-full bg-white text-black hover:bg-white/90'
                      onClick={() => handleSendInquiry(listing.id.uuid)}
                    >
                      <MessageSquare className='w-4 h-4 mr-2' />
                      Send Inquiry
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}
