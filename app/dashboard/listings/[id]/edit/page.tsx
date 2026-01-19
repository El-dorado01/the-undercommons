'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DetailsStep,
  LocationStep,
  PhotosStep,
  ListingFormData,
  INITIAL_FORM,
} from '../../new/listing-form-steps';

const { LatLng, Money, UUID } = types;

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.id as string;
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [listingState, setListingState] = useState<
    'draft' | 'published' | 'closed'
  >('draft');

  useEffect(() => {
    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

  const fetchListing = async () => {
    setIsLoading(true);
    try {
      const res = await sharetribeSdk.ownListings.show({
        id: new UUID(listingId),
        include: ['images'],
      } as any);

      const listing = res?.data?.data;
      if (listing) {
        const attr = listing.attributes;
        const publicData = (attr.publicData as any) || {};
        const location = publicData.address || {};
        const includedImages = res.data.included || [];
        const firstImage = includedImages.find(
          (img: any) => img.type === 'image',
        );

        setFormData({
          title: attr.title || '',
          description: attr.description || '',
          price: attr.price ? attr.price.amount / 100 : 0,
          category: publicData.category || '',
          city: location.city || '',
          zip: location.zip || '',
          address: location.street || '',
          imageId: firstImage?.id?.uuid || null,
          imageUrl:
            (firstImage?.attributes?.variants as any)?.['default']?.url || null,
        });

        setListingState(
          (attr.state as 'draft' | 'published' | 'closed') || 'draft',
        );
      }
    } catch (e) {
      console.error('Failed to fetch listing', e);
      toast.error('Failed to load listing');
      router.push('/dashboard/listings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (
    field: keyof ListingFormData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const updateParams = {
        id: new UUID(listingId),
        title: formData.title,
        description: formData.description,
        price: new Money(formData.price * 100, 'USD'),
        publicData: {
          category: formData.category,
          address: {
            city: formData.city,
            zip: formData.zip,
            street: formData.address,
            country: 'USA',
            state: 'NY',
          },
        },
        images: formData.imageId ? [new UUID(formData.imageId)] : [],
      };

      await sharetribeSdk.ownListings.update(updateParams as any);
      toast.success('Listing updated');
      return true;
    } catch (e: any) {
      console.error('Save error:', e);
      toast.error(e.message || 'Failed to save changes');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleNext = async () => {
    if (currentStep === 1 || currentStep === 2) {
      const saved = await saveChanges();
      if (saved) nextStep();
    } else {
      nextStep();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadResult = await sharetribeSdk.images.upload({ image: file });
      const imageId = uploadResult?.data?.data?.id?.uuid;
      const imageUrl =
        uploadResult?.data?.data?.attributes?.variants?.['default']?.url;

      if (!imageId) throw new Error('Failed to get image ID');

      updateField('imageId', imageId);

      if (imageUrl) {
        updateField('imageUrl', imageUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) =>
          updateField('imageUrl', e.target?.result as string);
        reader.readAsDataURL(file);
      }

      toast.success('Image uploaded');
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAndExit = async () => {
    const saved = await saveChanges();
    if (saved) {
      router.push('/dashboard/listings');
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      // Save changes first
      await saveChanges();

      // Then publish if it's a draft
      if (listingState === 'draft') {
        await sharetribeSdk.ownListings.publishDraft(
          { id: new UUID(listingId) },
          { expand: true } as any,
        );
        toast.success('Listing published!');
      }

      router.push('/dashboard/listings');
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error('Failed to publish listing');
    } finally {
      setIsSaving(false);
    }
  };

  const progress = (currentStep / 3) * 100;

  if (isLoading) {
    return (
      <div className='max-w-3xl mx-auto w-full py-12 flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto w-full py-6 flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Edit Listing</h1>
          <p className='text-muted-foreground'>Update your listing details</p>
        </div>
        <Button
          variant='outline'
          onClick={() => router.push('/dashboard/listings')}
        >
          <X className='w-4 h-4 mr-2' />
          Cancel
        </Button>
      </div>

      <div className='space-y-2'>
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>Step {currentStep} of 3</span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <Progress
          value={progress}
          className='h-2'
        />
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            {currentStep === 1 && (
              <DetailsStep
                formData={formData}
                updateField={updateField}
              />
            )}

            {currentStep === 2 && (
              <LocationStep
                formData={formData}
                updateField={updateField}
              />
            )}

            {currentStep === 3 && (
              <PhotosStep
                formData={formData}
                updateField={updateField}
                isUploading={isUploading}
                handleImageUpload={handleImageUpload}
              />
            )}

            <CardFooter className='flex justify-between pt-6 border-t bg-neutral-50/50 dark:bg-neutral-900/50'>
              <Button
                variant='outline'
                onClick={prevStep}
                disabled={currentStep === 1 || isSaving}
              >
                <ChevronLeft className='w-4 h-4 mr-2' />
                Back
              </Button>

              <div className='flex gap-2'>
                {currentStep < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 &&
                        (!formData.title ||
                          !formData.category ||
                          !formData.description)) ||
                      (currentStep === 2 && !formData.city) ||
                      isSaving
                    }
                  >
                    {isSaving && (
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    )}
                    Next
                    <ChevronRight className='w-4 h-4 ml-2' />
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveAndExit}
                      variant='outline'
                      disabled={isSaving || !formData.title || isUploading}
                    >
                      {isSaving ? (
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      ) : (
                        <Save className='w-4 h-4 mr-2' />
                      )}
                      Save & Exit
                    </Button>
                    {listingState === 'draft' && (
                      <Button
                        onClick={handlePublish}
                        disabled={isSaving || !formData.title || isUploading}
                      >
                        {isSaving ? (
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        ) : (
                          <Save className='w-4 h-4 mr-2' />
                        )}
                        Save & Publish
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
