import Hero from '@/components/Hero';
import VideoSection from '@/components/VideoSection';
import FeaturedListings from '@/components/FeaturedListings';
import TopBar from '@/components/layout/TopBar';
import Testimonials from '@/components/Testimonials';
import BarterCategories from '@/components/BarterCategories';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className='relative min-h-screen w-full'>
      <main className='relative w-full max-w-7xl mx-auto py-16 px-6'>
        <TopBar />
        <Hero />
        <FeaturedListings />
        <BarterCategories />
        {/* <Testimonials /> */}
        <VideoSection />
        <Footer />
      </main>
    </div>
  );
}
