'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import {
  DetailsStep,
  LocationStep,
  PhotosStep,
  ListingFormData,
  INITIAL_FORM,
} from './listing-form-steps';

const { LatLng, Money, UUID } = types;

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ListingFormData>(INITIAL_FORM);
  const [listingId, setListingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const updateField = (
    field: keyof ListingFormData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveDraft = async (moveToNext = false) => {
    setIsLoading(true);
    try {
      const commonParams = {
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
          rules: 'Standard rules apply.',
        },
        geolocation: new LatLng(40.64542, -74.08508),
        images: formData.imageId ? [new UUID(formData.imageId)] : [],
      };

      if (listingId) {
        await sharetribeSdk.ownListings.update(
          {
            id: new UUID(listingId),
            ...commonParams,
          },
          { expand: true, include: ['images'] } as any,
        );
        toast.success('Draft saved');
      } else {
        if (!formData.title) {
          if (moveToNext) toast.error('Title is required to save draft');
          return false;
        }

        const res = await sharetribeSdk.ownListings.createDraft(
          {
            ...commonParams,
            privateData: {
              externalServiceId: 'created-via-dashboard',
            },
          },
          { expand: true, include: ['images'] } as any,
        );

        const newId = res?.data?.data?.id?.uuid;
        if (newId) {
          setListingId(newId);
          localStorage.setItem('draft_listing_id', newId);
          toast.success('Draft created');
        }
      }

      if (moveToNext) {
        nextStep();
      }
      return true;
    } catch (e: any) {
      console.error('Save draft error:', e);
      toast.error(e.message || 'Failed to save draft');
      return false;
    } finally {
      setIsLoading(false);
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
      await saveDraft(true);
    } else {
      nextStep();
    }
  };

  const handleDiscardDraft = async () => {
    if (listingId) {
      setIsLoading(true);
      try {
        await sharetribeSdk.ownListings.discardDraft({
          id: new UUID(listingId),
        });
        toast.success('Draft discarded');
      } catch (e) {
        console.error('Discard error', e);
      } finally {
        setIsLoading(false);
      }
    }
    localStorage.removeItem('draft_listing_id');
    setListingId(null);
    setFormData(INITIAL_FORM);
    setCurrentStep(1);
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

  const handlePublish = async () => {
    if (!listingId) {
      const saved = await saveDraft(false);
      if (!saved) return;
      return;
    }

    setIsLoading(true);
    try {
      await sharetribeSdk.ownListings.update({
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
      } as any);

      await sharetribeSdk.ownListings.publishDraft(
        {
          id: new UUID(listingId),
        },
        { expand: true } as any,
      );

      localStorage.removeItem('draft_listing_id');

      // Show success screen
      setShowSuccess(true);

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26a69a', '#ef5350', '#7e57c2', '#ffa726'],
      });

      // Redirect after delay
      setTimeout(() => {
        router.push('/dashboard/listings');
      }, 3500);
    } catch (error: any) {
      console.error('Publish listing error:', error);
      toast.error(error.message || 'Failed to publish listing');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className='max-w-3xl mx-auto w-full py-6 flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Create a New Listing
          </h1>
          <p className='text-muted-foreground'>
            Share what you have to offer with the community.
          </p>
        </div>
        {listingId && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
              >
                <X className='w-4 h-4 mr-2' />
                Discard Draft
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard Draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to discard this draft? This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDiscardDraft}
                  className='bg-destructive text-white hover:bg-destructive/90'
                >
                  Discard
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
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
                disabled={currentStep === 1 || isLoading}
              >
                <ChevronLeft className='w-4 h-4 mr-2' />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 &&
                      (!formData.title ||
                        !formData.category ||
                        !formData.description)) ||
                    (currentStep === 2 && !formData.city) ||
                    isLoading
                  }
                >
                  {isLoading && (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  )}
                  Next
                  <ChevronRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={isLoading || !formData.title || isUploading}
                >
                  {isLoading ? (
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  ) : (
                    <Save className='w-4 h-4 mr-2' />
                  )}
                  Post Listing
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
