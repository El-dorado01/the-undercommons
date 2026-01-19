'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Loader2,
  Edit,
  Trash2,
  Send,
  XCircle,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Tag,
  Calendar,
} from 'lucide-react';
import Image from 'next/image';

type ListingState = 'draft' | 'published' | 'closed';

interface Listing {
  id: { uuid: string };
  attributes: {
    title: string;
    description?: string;
    state: ListingState;
    createdAt: string;
    price?: {
      amount: number;
      currency: string;
    };
    publicData?: {
      category?: string;
      address?: {
        city?: string;
        zip?: string;
        street?: string;
        country?: string;
        state?: string;
      };
    };
  };
  relationships?: {
    images?: {
      data: Array<{ id: { uuid: string } }>;
    };
  };
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    setIsLoading(true);
    try {
      const response = await sharetribeSdk.ownListings.show({
        id: new UUID(listingId),
        include: ['images'],
      } as any);

      const listingData = response?.data?.data;
      const includedImages = response?.data?.included || [];

      if (listingData) {
        setListing(listingData as any);

        // Get first image
        const firstImageId =
          listingData.relationships?.images?.data?.[0]?.id?.uuid;
        if (firstImageId) {
          const imageData = includedImages.find(
            (img: any) => img.id.uuid === firstImageId,
          );
          const url = (imageData?.attributes?.variants as any)?.['default']
            ?.url;
          if (url) setImageUrl(url);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch listing:', error);
      toast.error('Failed to load listing');
      router.push('/dashboard/listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    setIsActionLoading(true);
    try {
      if (listing.attributes.state === 'draft') {
        await sharetribeSdk.ownListings.discardDraft({
          id: new UUID(listingId),
        } as any);
      } else {
        await sharetribeSdk.ownListings.close({
          id: new UUID(listingId),
        } as any);
      }
      toast.success('Listing removed');
      router.push('/dashboard/listings');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to remove listing');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsActionLoading(true);
    try {
      await sharetribeSdk.ownListings.publishDraft(
        { id: new UUID(listingId) },
        { expand: true } as any,
      );
      toast.success('Listing published');
      fetchListing();
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error('Failed to publish listing');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClose = async () => {
    setIsActionLoading(true);
    try {
      await sharetribeSdk.ownListings.close({ id: new UUID(listingId) } as any);
      toast.success('Listing closed');
      fetchListing();
    } catch (error: any) {
      console.error('Close error:', error);
      toast.error('Failed to close listing');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpen = async () => {
    setIsActionLoading(true);
    try {
      await sharetribeSdk.ownListings.open({ id: new UUID(listingId) } as any);
      toast.success('Listing opened');
      fetchListing();
    } catch (error: any) {
      console.error('Open error:', error);
      toast.error('Failed to open listing');
    } finally {
      setIsActionLoading(false);
    }
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

  if (isLoading) {
    return (
      <div className='w-full py-12 flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className='w-full py-12 text-center'>
        <p className='text-muted-foreground'>Listing not found</p>
        <Button
          onClick={() => router.push('/dashboard/listings')}
          className='mt-4'
        >
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full py-6 flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <Button
          variant='ghost'
          onClick={() => router.push('/dashboard/listings')}
          className='self-start'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Listings
        </Button>
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            onClick={() => router.push(`/dashboard/listings/${listingId}/edit`)}
            className='flex-1 sm:flex-none'
          >
            <Edit className='w-4 h-4 mr-2' />
            Edit
          </Button>
          {listing.attributes.state === 'draft' && (
            <Button
              onClick={handlePublish}
              disabled={isActionLoading}
              className='flex-1 sm:flex-none'
            >
              {isActionLoading ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Send className='w-4 h-4 mr-2' />
              )}
              Publish
            </Button>
          )}
          {listing.attributes.state === 'published' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  className='flex-1 sm:flex-none bg-yellow-600 text-white hover:bg-yellow-700 hover:text-white'
                >
                  <XCircle className='w-4 h-4 mr-2' />
                  Close
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Close Listing?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove your listing from public view. You can
                    reopen it later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClose}
                    className='bg-yellow-600 text-white hover:bg-yellow-700'
                  >
                    Close Listing
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {listing.attributes.state === 'closed' && (
            <Button
              onClick={handleOpen}
              disabled={isActionLoading}
              className='flex-1 sm:flex-none'
            >
              {isActionLoading ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <CheckCircle className='w-4 h-4 mr-2' />
              )}
              Open
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                className='flex-1 sm:flex-none'
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your listing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className='bg-red-600 text-white hover:bg-red-700'
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Image and Title */}
        <div className='lg:col-span-2 space-y-6'>
          <Card className='pt-0'>
            <CardContent className='p-0'>
              {imageUrl ? (
                <div className='relative w-full aspect-video bg-neutral-100 dark:bg-neutral-800'>
                  <Image
                    src={imageUrl}
                    alt={listing.attributes.title}
                    fill
                    className='object-contain rounded-t-lg'
                  />
                </div>
              ) : (
                <div className='w-full aspect-video bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center rounded-t-lg'>
                  <p className='text-muted-foreground'>No image available</p>
                </div>
              )}
              <div className='p-6'>
                <div className='flex items-start justify-between gap-4 mb-4'>
                  <h1 className='text-3xl font-bold'>
                    {listing.attributes.title}
                  </h1>
                  <Badge
                    variant={getStateBadgeVariant(listing.attributes.state)}
                    className={`${
                      getStateBadgeVariant(listing.attributes.state) ===
                        'secondary' && 'text-white'
                    }`}
                  >
                    {listing.attributes.state}
                  </Badge>
                </div>
                {listing.attributes.description && (
                  <p className='text-muted-foreground whitespace-pre-wrap'>
                    {listing.attributes.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Sidebar */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {listing.attributes.publicData?.category && (
                <div className='flex items-start gap-3'>
                  <Tag className='w-5 h-5 text-muted-foreground mt-0.5' />
                  <div>
                    <p className='text-sm font-medium'>Category</p>
                    <p className='text-sm text-muted-foreground'>
                      {listing.attributes.publicData.category}
                    </p>
                  </div>
                </div>
              )}

              {listing.attributes.publicData?.address && (
                <div className='flex items-start gap-3'>
                  <MapPin className='w-5 h-5 text-muted-foreground mt-0.5' />
                  <div>
                    <p className='text-sm font-medium'>Location</p>
                    <p className='text-sm text-muted-foreground'>
                      {listing.attributes.publicData.address.city}
                      {listing.attributes.publicData.address.zip &&
                        `, ${listing.attributes.publicData.address.zip}`}
                    </p>
                    {listing.attributes.publicData.address.street && (
                      <p className='text-sm text-muted-foreground'>
                        {listing.attributes.publicData.address.street}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className='flex items-start gap-3'>
                <Calendar className='w-5 h-5 text-muted-foreground mt-0.5' />
                <div>
                  <p className='text-sm font-medium'>Created</p>
                  <p className='text-sm text-muted-foreground'>
                    {new Date(listing.attributes.createdAt).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
