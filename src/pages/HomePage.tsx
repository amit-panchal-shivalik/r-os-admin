
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import OverviewSection from '@/components/OverviewSection';
import AboutSection from '@/components/AboutSection';
import VisionSection from '@/components/VisionSection';
import FAQSection from '@/components/FAQSection';

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <HeroSection />
      <OverviewSection />
      <AboutSection />
      <VisionSection />
      <FAQSection />
    </div>
  );
}
