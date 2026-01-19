'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { sharetribeSdk } from '@/lib/sharetribe';
// @ts-ignore
import * as SDK from 'sharetribe-flex-sdk';
const { types } = SDK as any;
const { UUID } = types;
import { toast } from 'sonner';
import {
  LayoutGrid,
  Table,
  MoreVertical,
  Plus,
  Loader2,
  Eye,
  Edit,
  Trash2,
  Send,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';

type ListingState = 'draft' | 'published' | 'closed';
type ViewMode = 'grid' | 'table';

interface Listing {
  id: { uuid: string };
  attributes: {
    title: string;
    description?: string;
    state: ListingState;
    createdAt: string;
    publicData?: {
      category?: string;
      address?: {
        city?: string;
      };
    };
  };
  relationships?: {
    images?: {
      data: Array<{ id: { uuid: string } }>;
    };
  };
}

interface ImageData {
  id: { uuid: string };
  attributes: {
    variants: {
      default?: { url: string };
    };
  };
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [images, setImages] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [stateFilter, setStateFilter] = useState<'all' | ListingState>('all');
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'title-asc' | 'title-desc'
  >('newest');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await sharetribeSdk.ownListings.query({
        include: ['images'],
      } as any);

      const listingsData = response?.data?.data || [];
      const includedImages = response?.data?.included || [];

      // Build image map
      const imageMap = new Map<string, string>();
      (includedImages as any[]).forEach((item: any) => {
        if (item.attributes?.variants?.default?.url) {
          imageMap.set(item.id.uuid, item.attributes.variants.default.url);
        }
      });

      setListings(listingsData as any);
      setImages(imageMap);
    } catch (error: any) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, state: ListingState) => {
    try {
      // For drafts, use discardDraft; for others, close then delete isn't available, so we just close
      if (state === 'draft') {
        await sharetribeSdk.ownListings.discardDraft({
          id: new UUID(id),
        } as any);
      } else {
        // For published/closed listings, we can only close them
        await sharetribeSdk.ownListings.close({ id: new UUID(id) } as any);
      }
      toast.success('Listing removed');
      fetchListings();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to remove listing');
    }
  };

  const handlePublish = async (id: string) => {
    // Find the listing to validate
    const listing = listings.find((l) => l.id.uuid === id);
    if (!listing) return;

    // Validate required fields
    const hasImage =
      listing.relationships?.images?.data &&
      listing.relationships.images.data.length > 0;
    const hasTitle =
      listing.attributes.title && listing.attributes.title.trim().length > 0;
    const hasDescription =
      listing.attributes.description &&
      listing.attributes.description.trim().length > 0;
    const hasCategory = listing.attributes.publicData?.category;

    if (!hasImage) {
      toast.error('Please add a thumbnail image before publishing');
      return;
    }

    if (!hasTitle || !hasDescription || !hasCategory) {
      toast.error(
        'Please complete all required fields (title, description, category) before publishing',
      );
      return;
    }

    try {
      await sharetribeSdk.ownListings.publishDraft(
        { id: new UUID(id) } as any,
        { expand: true } as any,
      );
      toast.success('Listing published');
      fetchListings();
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error('Failed to publish listing');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await sharetribeSdk.ownListings.close({ id: new UUID(id) } as any);
      toast.success('Listing closed');
      fetchListings();
    } catch (error: any) {
      console.error('Close error:', error);
      toast.error('Failed to close listing');
    }
  };

  const handleOpen = async (id: string) => {
    try {
      await sharetribeSdk.ownListings.open({ id: new UUID(id) } as any);
      toast.success('Listing opened');
      fetchListings();
    } catch (error: any) {
      console.error('Open error:', error);
      toast.error('Failed to open listing');
    }
  };

  const getFilteredAndSortedListings = () => {
    let filtered = listings;

    // Filter by state
    if (stateFilter !== 'all') {
      filtered = filtered.filter((l) => l.attributes.state === stateFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.attributes.createdAt).getTime() -
            new Date(a.attributes.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.attributes.createdAt).getTime() -
            new Date(b.attributes.createdAt).getTime()
          );
        case 'title-asc':
          return a.attributes.title.localeCompare(b.attributes.title);
        case 'title-desc':
          return b.attributes.title.localeCompare(a.attributes.title);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const getStateBadgeVariant = (state: ListingState) => {
    switch (state) {
      case 'draft':
        return 'secondary';
      case 'published':
        return 'default';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getFirstImageUrl = (listing: Listing) => {
    const imageIds = listing.relationships?.images?.data || [];
    if (imageIds.length > 0) {
      return images.get(imageIds[0].id.uuid);
    }
    return null;
  };

  const displayedListings = getFilteredAndSortedListings();

  return (
    <div className='w-full py-6 flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>My Listings</h1>
          <p className='text-muted-foreground'>
            Manage your marketplace listings
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/listings/new')}>
          <Plus className='w-4 h-4 mr-2' />
          New Listing
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
        <div className='flex flex-wrap gap-3'>
          <Select
            value={stateFilter}
            onValueChange={(val: any) => setStateFilter(val)}
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Filter by state' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All States</SelectItem>
              <SelectItem value='draft'>Draft</SelectItem>
              <SelectItem value='published'>Published</SelectItem>
              <SelectItem value='closed'>Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(val: any) => setSortBy(val)}
          >
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='newest'>Newest First</SelectItem>
              <SelectItem value='oldest'>Oldest First</SelectItem>
              <SelectItem value='title-asc'>Title (A-Z)</SelectItem>
              <SelectItem value='title-desc'>Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex gap-2 border rounded-md p-1'>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className='w-4 h-4' />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setViewMode('table')}
          >
            <Table className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && displayedListings.length === 0 && (
        <Card className='py-12'>
          <CardContent className='flex flex-col items-center justify-center text-center'>
            <div className='w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
              <LayoutGrid className='w-8 h-8 text-primary' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>No listings found</h3>
            <p className='text-muted-foreground mb-4'>
              {stateFilter !== 'all'
                ? `You don't have any ${stateFilter} listings yet.`
                : "You haven't created any listings yet."}
            </p>
            <Button onClick={() => router.push('/dashboard/listings/new')}>
              <Plus className='w-4 h-4 mr-2' />
              Create Your First Listing
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && displayedListings.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {displayedListings.map((listing) => {
            const imageUrl = getFirstImageUrl(listing);
            return (
              <Card
                key={listing.id.uuid}
                className='overflow-hidden group hover:shadow-lg transition-shadow pt-0 flex flex-col'
              >
                <div className='h-48 relative bg-neutral-100 dark:bg-neutral-800'>
                  {imageUrl ? (
                    <Image
                      width={400}
                      height={300}
                      src={imageUrl}
                      alt={listing.attributes.title}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                      <LayoutGrid className='w-12 h-12' />
                    </div>
                  )}
                </div>
                <CardHeader className='px-4'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <CardTitle className='text-lg truncate'>
                        {listing.attributes.title}
                      </CardTitle>
                      <CardDescription className='line-clamp-2'>
                        {listing.attributes.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                        >
                          <MoreVertical className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/listings/${listing.id.uuid}`,
                            )
                          }
                        >
                          <Eye className='w-4 h-4 mr-2' />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/listings/${listing.id.uuid}/edit`,
                            )
                          }
                        >
                          <Edit className='w-4 h-4 mr-2' />
                          Edit
                        </DropdownMenuItem>
                        {listing.attributes.state === 'draft' && (
                          <DropdownMenuItem
                            onClick={() => handlePublish(listing.id.uuid)}
                          >
                            <Send className='w-4 h-4 mr-2' />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {listing.attributes.state === 'published' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                variant='warning'
                                onSelect={(e) => e.preventDefault()}
                              >
                                <XCircle className='w-4 h-4 mr-2' />
                                Close
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Close Listing?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove your listing from public
                                  view. You can reopen it later.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleClose(listing.id.uuid)}
                                  className='bg-yellow-600 text-white hover:bg-yellow-700'
                                >
                                  Close Listing
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {listing.attributes.state === 'closed' && (
                          <DropdownMenuItem
                            onClick={() => handleOpen(listing.id.uuid)}
                          >
                            <CheckCircle className='w-4 h-4 mr-2' />
                            Open
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              variant='destructive'
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className='w-4 h-4 mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Listing?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your listing.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(
                                    listing.id.uuid,
                                    listing.attributes.state,
                                  )
                                }
                                className='bg-red-600 text-white hover:bg-red-700'
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className='px-4 pb-4 pt-0'>
                  <div className='flex items-center justify-between'>
                    <div className='flex gap-2'>
                      <Badge
                        variant={getStateBadgeVariant(listing.attributes.state)}
                        className={`${
                          getStateBadgeVariant(listing.attributes.state) ===
                            'secondary' && 'text-white'
                        }`}
                      >
                        {listing.attributes.state}
                      </Badge>
                      {listing.attributes.publicData?.category && (
                        <Badge variant='outline'>
                          {listing.attributes.publicData.category}
                        </Badge>
                      )}
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {new Date(
                        listing.attributes.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {!isLoading && viewMode === 'table' && displayedListings.length > 0 && (
        <Card>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='border-b'>
                <tr className='text-left'>
                  <th className='p-3 font-medium'>Listing</th>
                  <th className='p-3 font-medium'>Category</th>
                  <th className='p-3 font-medium'>State</th>
                  <th className='p-3 font-medium'>Created</th>
                  <th className='p-3 font-medium text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedListings.map((listing) => {
                  const imageUrl = getFirstImageUrl(listing);
                  return (
                    <tr
                      key={listing.id.uuid}
                      className='border-b last:border-0 hover:bg-muted/50'
                    >
                      <td className='p-3'>
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 rounded bg-neutral-100 dark:bg-neutral-800 shrink-0'>
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={listing.attributes.title}
                                className='w-full h-full object-cover rounded'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center'>
                                <LayoutGrid className='w-5 h-5 text-muted-foreground' />
                              </div>
                            )}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-medium truncate'>
                              {listing.attributes.title}
                            </p>
                            <p className='text-sm text-muted-foreground truncate'>
                              {listing.attributes.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='p-3'>
                        {listing.attributes.publicData?.category && (
                          <Badge variant='outline'>
                            {listing.attributes.publicData.category}
                          </Badge>
                        )}
                      </td>
                      <td className='p-3'>
                        <Badge
                          variant={getStateBadgeVariant(
                            listing.attributes.state,
                          )}
                          className={`${
                            getStateBadgeVariant(listing.attributes.state) ===
                              'secondary' && 'text-white'
                          }`}
                        >
                          {listing.attributes.state}
                        </Badge>
                      </td>
                      <td className='p-3 text-sm text-muted-foreground'>
                        {new Date(
                          listing.attributes.createdAt,
                        ).toLocaleDateString()}
                      </td>
                      <td className='p-3 text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                            >
                              <MoreVertical className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/listings/${listing.id.uuid}`,
                                )
                              }
                            >
                              <Eye className='w-4 h-4 mr-2' />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/listings/${listing.id.uuid}/edit`,
                                )
                              }
                            >
                              <Edit className='w-4 h-4 mr-2' />
                              Edit
                            </DropdownMenuItem>
                            {listing.attributes.state === 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handlePublish(listing.id.uuid)}
                              >
                                <Send className='w-4 h-4 mr-2' />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {listing.attributes.state === 'published' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    variant='warning'
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <XCircle className='w-4 h-4 mr-2' />
                                    Close
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Close Listing?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove your listing from public
                                      view. You can reopen it later.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleClose(listing.id.uuid)
                                      }
                                      className='bg-yellow-600 text-white hover:bg-yellow-700'
                                    >
                                      Close Listing
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {listing.attributes.state === 'closed' && (
                              <DropdownMenuItem
                                onClick={() => handleOpen(listing.id.uuid)}
                              >
                                <CheckCircle className='w-4 h-4 mr-2' />
                                Open
                              </DropdownMenuItem>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  variant='destructive'
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className='w-4 h-4 mr-2' />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Listing?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your listing.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(
                                        listing.id.uuid,
                                        listing.attributes.state,
                                      )
                                    }
                                    className='bg-destructive text-white hover:bg-destructive/90'
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
