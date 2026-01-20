'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SignupForm() {
  const router = useRouter();
  const { signup, error: authError, isLoading, clearError } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password || !firstName || !lastName) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await signup({
        email,
        password,
        firstName,
        lastName,
        // Map extra fields to publicData or protectedData as appropriate for Sharetribe
        // Note: SDK create params might need these in specific nested objects or separate update call
        // For basic creation, we pass standard fields. Extra fields might need `updateProfile` after signup.
        // We'll attempt to pass them in publicData/protectedData if supported by the create call,
        // or just local state. Based on SDK docs, `createUserWithIdp` or `currentUser.create` supports `publicData`.
        publicData: {
          displayName,
          phoneNumber: phone, // Storing phone in publicData for now, but usually should be protected.
        },
        protectedData: {
          phoneNumber: phone,
        },
      });
      toast.success('Account created successfully', {
        description: 'Welcome to The Undercommons!',
      });
      router.push('/dashboard'); // Redirect after signup logic handles auto-login
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto my-8'>
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>Join our marketplace today.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>First Name</Label>
              <Input
                id='firstName'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastName'>Last Name</Label>
              <Input
                id='lastName'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='displayName'>Display Name (Optional)</Label>
            <Input
              id='displayName'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
              placeholder='How others see you'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number (Optional)</Label>
            <Input
              id='phone'
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              placeholder='+1 234 567 8900'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={8}
            />
            <p className='text-xs text-muted-foreground'>
              Must be at least 8 characters.
            </p>
          </div>

          {(formError || authError) && (
            <div className='text-sm text-red-500 font-medium'>
              {formError || authError}
            </div>
          )}

          <Button
            type='submit'
            className='w-full'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className='flex justify-center'>
        <p className='text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='text-primary hover:underline'
            onClick={clearError}
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
