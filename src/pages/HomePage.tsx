
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import OverviewSection from '@/components/OverviewSection';
import AboutSection from '@/components/AboutSection';
import VisionSection from '@/components/VisionSection';
import FAQSection from '@/components/FAQSection';

import CommunitiesList from '@/components/CommunitiesList';

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <HeroSection />
      <OverviewSection />
      <AboutSection />
      <VisionSection />
      <FAQSection />
      {/* <div className="container mx-auto px-24 py-10">
        <h2 className="text-2xl font-bold mb-6">Featured Communities</h2>
        <CommunitiesList showJoinButton={false} />
      </div> */}
    </div>
  );
}
