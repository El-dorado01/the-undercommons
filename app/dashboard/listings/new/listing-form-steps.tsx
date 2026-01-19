import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import React from 'react';

export const CATEGORIES = ['Time', 'Skill', 'Labor', 'Space', 'Items'];

export interface ListingFormData {
  category: string;
  title: string;
  description: string;
  city: string;
  zip: string;
  address: string;
  imageId: string | null;
  imageUrl: string | null;
  price: number;
}

export const INITIAL_FORM: ListingFormData = {
  category: '',
  title: '',
  description: '',
  city: '',
  zip: '',
  address: '',
  imageId: null,
  imageUrl: null,
  price: 0,
};

interface StepProps {
  formData: ListingFormData;
  updateField: (
    field: keyof ListingFormData,
    value: string | number | null,
  ) => void;
}

export function DetailsStep({ formData, updateField }: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Listing Details</CardTitle>
        <CardDescription>
          Basic information about what you are offering.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='category'>
            Category <span className='text-destructive'>*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(val) => updateField('category', val)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select a category' />
            </SelectTrigger>
            <SelectContent>
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
        <div className='space-y-2'>
          <Label htmlFor='title'>
            Title <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='title'
            placeholder='e.g. Graphic Design Services'
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>

        {/* Price field removed per user request */}

        <div className='space-y-2'>
          <Label htmlFor='description'>
            Description <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='description'
            placeholder='Describe what you are offering in detail...'
            className='min-h-[150px]'
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>
      </CardContent>
    </>
  );
}

export function LocationStep({ formData, updateField }: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Location</CardTitle>
        <CardDescription>Where is this listing available?</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='city'>
              City <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='city'
              placeholder='e.g. New York'
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='zip'>Zip / Postal Code</Label>
            <Input
              id='zip'
              placeholder='e.g. 10001'
              value={formData.zip}
              onChange={(e) => updateField('zip', e.target.value)}
            />
          </div>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='address'>Address (Optional)</Label>
          <Input
            id='address'
            placeholder='Street address'
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
        </div>
      </CardContent>
    </>
  );
}

interface PhotosStepProps extends StepProps {
  isUploading: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function PhotosStep({
  formData,
  updateField,
  isUploading,
  handleImageUpload,
}: PhotosStepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          Add a photo to make your listing stand out.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors'>
          {formData.imageUrl ? (
            <div className='relative w-full aspect-video md:aspect-[3/2] max-h-[300px] rounded-lg overflow-hidden group'>
              <img
                src={formData.imageUrl}
                alt='Listing preview'
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => {
                    updateField('imageId', null);
                    updateField('imageUrl', null);
                  }}
                >
                  <X className='w-4 h-4 mr-2' />
                  Remove Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className='text-center space-y-4'>
              <div className='mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
                <Upload className='w-6 h-6 text-primary' />
              </div>
              <div>
                <h3 className='text-lg font-medium'>Upload a photo</h3>
                <p className='text-sm text-neutral-500'>PNG, JPG up to 20MB</p>
              </div>
              <Button
                variant='outline'
                className='relative cursor-pointer'
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Select File'}
                <input
                  type='file'
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                  accept='image/*'
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
}
