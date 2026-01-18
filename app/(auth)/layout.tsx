import { GravityStarsBackgroundDemo } from '@/components/background';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GravityStarsBackgroundDemo />
      <div className='flex min-h-screen items-center justify-center p-4'>
        {children}
      </div>
    </>
  );
}
