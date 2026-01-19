'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/auth-context';
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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { sharetribeSdk } from '@/lib/sharetribe';
import { toast } from 'sonner';
import { Loader2, Upload, User as UserIcon } from 'lucide-react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

const TRADE_CATEGORIES = ['Time', 'Skill', 'Labor', 'Space', 'Items'];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse existing data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extendedUser = user as any;

  const profile =
    extendedUser?.data?.data?.attributes?.profile ||
    extendedUser?.attributes?.profile;
  const publicData = profile?.publicData || {};

  // Get avatar URL from included relationship or fallback to metadata
  const avatarUrl =
    extendedUser?.data.included[0]?.attributes?.variants?.['default']?.url ||
    extendedUser?.profileImage?.attributes?.variants?.['default']?.url ||
    extendedUser?.profileImage?.attributes?.variants?.['scaled-small']?.url ||
    profile?.metadata?.avatarUrl;

  // || extendedUser?.included[0]?.attributes?.variants?.['default']?.url

  const [offering, setOffering] = useState<string[]>(publicData.offering || []);
  const [seeking, setSeeking] = useState<string[]>(publicData.seeking || []);

  // Basic Info State
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [displayName, setDisplayName] = useState(
    profile?.publicData?.displayName || profile?.displayName || '',
  );
  const [bio, setBio] = useState(profile?.bio || '');

  // Reset state when user data is re-fetched/updated
  useEffect(() => {
    if (user) {
      setFirstName(profile?.firstName || '');
      setLastName(profile?.lastName || '');
      setDisplayName(
        profile?.publicData?.displayName || profile?.displayName || '',
      );
      setBio(profile?.bio || '');
      setOffering(publicData.offering || []);
      setSeeking(publicData.seeking || []);
    }
  }, [user]); // Depend on user object reference change

  // Check for changes
  const hasBasicInfoChanges =
    firstName !== (profile?.firstName || '') ||
    lastName !== (profile?.lastName || '') ||
    displayName !==
      (profile?.publicData?.displayName || profile?.displayName || '') ||
    bio !== (profile?.bio || '');

  const hasPreferencesChanges =
    JSON.stringify(offering.sort()) !==
      JSON.stringify((publicData.offering || []).sort()) ||
    JSON.stringify(seeking.sort()) !==
      JSON.stringify((publicData.seeking || []).sort());

  const getInitials = (name: string) =>
    name?.substring(0, 2).toUpperCase() || 'U';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload image to Sharetribe
      const uploadResult = await sharetribeSdk.images.upload({ image: file });
      const imageId = uploadResult?.data?.data?.id?.uuid;

      if (!imageId) throw new Error('Failed to get image ID');

      // 2. Update user profile with new image ID
      await updateProfile({ profileImageId: imageId });
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to update avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleCategory = (
    category: string,
    currentList: string[],
    setList: (list: string[]) => void,
  ) => {
    if (currentList.includes(category)) {
      setList(currentList.filter((c) => c !== category));
    } else {
      setList([...currentList, category]);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        publicData: {
          ...publicData,
          offering,
          seeking,
        },
      });
      toast.success('Trade preferences saved');
    } catch (error) {
      console.error('Save preferences error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBasicInfo = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        displayName, // This updates the top-level displayName
        bio,
        publicData: {
          ...publicData,
          displayName, // Also update duplicate in publicData if used there
        },
      });
      toast.success('Profile information saved');
    } catch (error) {
      console.error('Save basic info error:', error);
      toast.error('Failed to save profile information');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='flex flex-col gap-6 mx-auto w-full'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Profile Settings</h1>
        <p className='text-muted-foreground'>
          Manage your public profile and trade preferences.
        </p>
      </div>

      <div className='grid gap-6'>
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Click on the avatar to upload a new photo.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-6 sm:flex-row sm:gap-10'>
            <div
              className='relative group cursor-pointer'
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className='h-32 w-32 border-4 border-muted transition-opacity group-hover:opacity-80'>
                <AvatarImage
                  src={avatarUrl}
                  className='object-cover'
                />
                <AvatarFallback className='text-4xl bg-primary/10 text-primary'>
                  {profile?.abbreviatedName ||
                    getInitials(profile?.firstName || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full'>
                <Upload className='text-white h-8 w-8 drop-shadow-md' />
              </div>
              {isUploading && (
                <div className='absolute inset-0 flex items-center justify-center bg-background/50 rounded-full'>
                  <Loader2 className='h-8 w-8 animate-spin text-primary' />
                </div>
              )}
            </div>
            <div className='flex flex-col gap-2 text-center sm:text-left'>
              <h3 className='font-medium text-lg'>
                {profile?.displayName || 'Your Name'}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Supported formats: Any image file
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </Button>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleAvatarChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Basic Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your personal details and public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>First Name</Label>
                <Input
                  id='firstName'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder='John'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>Last Name</Label>
                <Input
                  id='lastName'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder='Doe'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='displayName'>Display Name</Label>
              <Input
                id='displayName'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='Johnnie'
              />
              <p className='text-xs text-muted-foreground'>
                This is the name that will be visible to other users.
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='bio'>Bio</Label>
              <Textarea
                id='bio'
                value={bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setBio(e.target.value)
                }
                placeholder='Tell us a little bit about yourself...'
                className='min-h-[100px]'
              />
              <p className='text-xs text-muted-foreground'>
                The Undercommons is built on relationships. Help other people
                get to know you.
              </p>
            </div>
            <div className='flex justify-end pt-2'>
              <Button
                onClick={handleSaveBasicInfo}
                disabled={isSaving || !hasBasicInfoChanges}
              >
                {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Save Basic Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trade Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Preferences</CardTitle>
            <CardDescription>
              Let others know what you have to give and what you need.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-8'>
            {/* Offering */}
            <div className='space-y-4'>
              <Label className='text-base font-semibold'>
                What would you like to trade? (Offering)
              </Label>
              <div className='flex flex-col gap-4'>
                {/* Selected Panel */}
                <div
                  className={cn(
                    'min-h-[60px] p-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 transition-colors',
                    offering.length > 0 &&
                      'border-solid border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800',
                  )}
                >
                  {offering.length === 0 ? (
                    <p className='text-sm text-neutral-500 italic'>
                      No categories selected yet.
                    </p>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      <AnimatePresence mode='popLayout'>
                        {offering.map((category) => (
                          <motion.button
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            key={`selected-offer-${category}`}
                            onClick={() =>
                              toggleCategory(category, offering, setOffering)
                            }
                            className='group flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive text-sm font-medium transition-colors border border-primary/20 hover:border-destructive/20'
                          >
                            {category}
                            <IconX className='h-3.5 w-3.5' />
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Available Options */}
                <div className='flex flex-wrap gap-2'>
                  {TRADE_CATEGORIES.filter((c) => !offering.includes(c)).map(
                    (category) => (
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={`avail-offer-${category}`}
                        onClick={() =>
                          toggleCategory(category, offering, setOffering)
                        }
                        className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm font-medium transition-colors border border-transparent'
                      >
                        <IconPlus className='h-3.5 w-3.5' />
                        {category}
                      </motion.button>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Seeking */}
            <div className='space-y-4'>
              <Label className='text-base font-semibold'>
                In exchange for (Seeking)
              </Label>
              <div className='flex flex-col gap-4'>
                {/* Selected Panel */}
                <div
                  className={cn(
                    'min-h-[60px] p-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 transition-colors',
                    seeking.length > 0 &&
                      'border-solid border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800',
                  )}
                >
                  {seeking.length === 0 ? (
                    <p className='text-sm text-neutral-500 italic'>
                      No categories selected yet.
                    </p>
                  ) : (
                    <div className='flex flex-wrap gap-2'>
                      <AnimatePresence mode='popLayout'>
                        {seeking.map((category) => (
                          <motion.button
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            key={`selected-seek-${category}`}
                            onClick={() =>
                              toggleCategory(category, seeking, setSeeking)
                            }
                            className='group flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive text-sm font-medium transition-colors border border-primary/20 hover:border-destructive/20'
                          >
                            {category}
                            <IconX className='h-3.5 w-3.5' />
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Available Options */}
                <div className='flex flex-wrap gap-2'>
                  {TRADE_CATEGORIES.filter((c) => !seeking.includes(c)).map(
                    (category) => (
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={`avail-seek-${category}`}
                        onClick={() =>
                          toggleCategory(category, seeking, setSeeking)
                        }
                        className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm font-medium transition-colors border border-transparent'
                      >
                        <IconPlus className='h-3.5 w-3.5' />
                        {category}
                      </motion.button>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className='flex justify-end pt-4'>
              <Button
                onClick={handleSavePreferences}
                disabled={isSaving || !hasPreferencesChanges}
              >
                {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
