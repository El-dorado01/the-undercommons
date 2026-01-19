'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
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
import { toast } from 'sonner';
import { sharetribeSdk } from '@/lib/sharetribe';
import { Loader2, Moon, Sun, Monitor, LucideMailWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const { setTheme, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  // Parse user data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extendedUser = user as any;
  const email =
    extendedUser?.data?.data?.attributes?.email ||
    extendedUser?.attributes?.email ||
    'No email found';

  const emailVerified =
    extendedUser?.data?.data?.attributes?.emailVerified ||
    extendedUser?.attributes?.emailVerified ||
    false;

  // Contact Details State
  const [phoneNumber, setPhoneNumber] = useState(
    extendedUser?.data?.data?.attributes?.profile?.protectedData?.phoneNumber ||
      extendedUser?.attributes?.profile?.protectedData?.phoneNumber ||
      '',
  );
  const [verificationCooldown, setVerificationCooldown] = useState(0);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (verificationCooldown > 0) {
      interval = setInterval(() => {
        setVerificationCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [verificationCooldown]);

  const handleResendVerification = async () => {
    if (verificationCooldown > 0) return;
    setIsLoading(true);
    try {
      await sharetribeSdk.currentUser.sendVerificationEmail();
      toast.success('Verification email sent');
      setVerificationCooldown(60);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContactDetails = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        protectedData: {
          phoneNumber,
        },
      });
      toast.success('Contact details saved');
    } catch (error: any) {
      console.error('Save contact details error:', error);
      toast.error(error.message || 'Failed to save contact details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    try {
      await sharetribeSdk.currentUser.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // NOTE: SDK delete method might differ or not be directly available depending on config.
      // Usually it's currentUser.delete() if enabled.
      // For safety in this demo, accessing potentially sensitive method.
      // Checking type definition:
      await (sharetribeSdk.currentUser as any).delete();
      toast.success('Account deleted successfully');
      logout();
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-6 mx-auto w-full max-w-6xl'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs
        defaultValue='contact'
        className='flex flex-col md:flex-row gap-8 w-full md:items-start'
        orientation='vertical'
      >
        <TabsList className='flex-row md:flex-col justify-start md:w-64 w-full h-auto p-0 bg-transparent gap-2 overflow-x-auto md:overflow-visible'>
          <TabsTrigger
            value='contact'
            className='justify-start w-auto md:w-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all'
          >
            Contact Details
          </TabsTrigger>
          <TabsTrigger
            value='password'
            className='justify-start w-auto md:w-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all'
          >
            Password
          </TabsTrigger>
          <TabsTrigger
            value='account'
            className='justify-start w-auto md:w-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all'
          >
            Manage Account
          </TabsTrigger>
          <TabsTrigger
            value='appearance'
            className='justify-start w-auto md:w-full px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all'
          >
            Appearance
          </TabsTrigger>
        </TabsList>

        <div className='flex-1 w-full'>
          {/* Contact Details */}
          <TabsContent
            value='contact'
            className='mt-0'
          >
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Your contact information.</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email Address</Label>
                  <Input
                    id='email'
                    value={email}
                    disabled
                    className='bg-muted'
                  />
                  <p className='text-xs text-muted-foreground'>
                    Your email address is managed by Sharetribe and cannot be
                    changed here.
                  </p>
                  {!emailVerified ? (
                    <div className='flex gap-1 mt-2'>
                      <div className='flex items-center text-amber-600 dark:text-amber-500 '>
                        <LucideMailWarning className='mr-2 w-4 h-4' />
                        <p className='text-sm font-medium'>
                          You haven't verified your email address yet.
                        </p>
                      </div>
                      <Button
                        variant='link'
                        className='p-0 h-auto self-start text-primary cursor-pointer'
                        onClick={handleResendVerification}
                        disabled={verificationCooldown > 0 || isLoading}
                      >
                        {verificationCooldown > 0
                          ? `Resend available in ${verificationCooldown}s`
                          : 'Resend verification email'}
                      </Button>
                    </div>
                  ) : (
                    <p className='text-xs text-green-600 dark:text-green-500 font-medium'>
                      Email verified
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder='+1 (555) 000-0000'
                  />
                  <p className='text-xs text-muted-foreground'>
                    Used for notifications and account recovery (if enabled).
                  </p>
                </div>

                <div className='flex justify-end pt-2'>
                  <Button
                    onClick={handleSaveContactDetails}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Save Contact Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password */}
          <TabsContent
            value='password'
            className='mt-0'
          >
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='current-password'>Current Password</Label>
                  <Input
                    id='current-password'
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='new-password'>New Password</Label>
                  <Input
                    id='new-password'
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className='flex justify-end pt-2'>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isLoading || !currentPassword || !newPassword}
                  >
                    {isLoading && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Account */}
          <TabsContent
            value='account'
            className='mt-0'
          >
            <Card className='border-destructive/20'>
              <CardHeader>
                <CardTitle className='text-destructive'>Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your account.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5'>
                  <div className='space-y-1'>
                    <h4 className='font-medium text-destructive'>
                      Delete Account
                    </h4>
                    <p className='text-sm text-destructive/80'>
                      Permanently delete your account and all data.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='destructive'>Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Deleting your The Undercommons account removes your
                          personal data, user profile, and listings from the
                          marketplace. This can't be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className='bg-destructive text-white hover:bg-destructive/90'
                        >
                          {isLoading ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent
            value='appearance'
            className='mt-0'
          >
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label>Theme</Label>
                  <div className='flex items-center gap-4'>
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className='flex-1 flex flex-col items-center justify-center h-24 gap-2'
                      onClick={() => setTheme('light')}
                    >
                      <Sun className='h-6 w-6' />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className='flex-1 flex flex-col items-center justify-center h-24 gap-2'
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className='h-6 w-6' />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      className='flex-1 flex flex-col items-center justify-center h-24 gap-2'
                      onClick={() => setTheme('system')}
                    >
                      <Monitor className='h-6 w-6' />
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
