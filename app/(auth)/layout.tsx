import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='flex min-h-screen flex-col items-center justify-center p-4 gap-4'>
        <Logo />
        <div className='w-full'>{children}</div>
      </div>
    </>
  );
}
