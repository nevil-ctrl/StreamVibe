import Hero from '@/components/sections/Hero';
import CategoriesSection from '@/components/sections/CategoriesSection';
import DevicesSection from '@/components/sections/DevicesSection';
import FAQSection from '@/components/sections/FAQSection';
import PricingSection from '@/components/sections/PricingSection';

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container mx-auto">
        <CategoriesSection />
        <DevicesSection />
        <FAQSection />
        <PricingSection />
      </div>
    </>
  );
}
