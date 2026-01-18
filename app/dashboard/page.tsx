'use client';

import { useAuth } from '@/components/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className='container mx-auto p-8'>
      <Card className='max-w-2xl mx-auto'>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Welcome to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='bg-muted p-4 rounded-lg'>
            <h3 className='font-semibold mb-2'>User Information</h3>
            <pre className='text-xs overflow-auto'>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className='flex justify-end'>
            <Button
              variant='destructive'
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
