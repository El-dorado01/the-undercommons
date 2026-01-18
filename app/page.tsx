import Hero from '@/components/Hero';
import TopBar from '@/components/layout/TopBar';
import Testimonials from '@/components/Testimonials';
import BarterCategories from '@/components/BarterCategories';
import Footer from '@/components/layout/Footer';
import { GravityStarsBackgroundDemo } from '@/components/background';

export default function Home() {
  return (
    <>
      <main className='min-h-screen w-full max-w-7xl py-16 px-6 bg-background'>
        <GravityStarsBackgroundDemo />
        <TopBar />
        <Hero />
        <BarterCategories />
        <Testimonials />
        <Footer />
      </main>
    </>
  );
}
