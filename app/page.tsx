import Hero from '@/components/sections/Hero';
import CategoriesFetcher from '@/components/sections/CategoriesFetcher';
import DevicesSection from '@/components/sections/DevicesSection';
import FAQSection from '@/components/sections/FAQSection';
import PricingSection from '@/components/sections/PricingSection';

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container">
        <CategoriesFetcher />
        <DevicesSection />
        <FAQSection />
        <PricingSection />
      </div>
    </>
  );
}
