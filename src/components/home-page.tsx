import { HeroSection } from "./hero-section";
import { ServicesSection } from "./services-section";
import { HowItWorksSection } from "./how-it-works-section";
import { OutcomesSection } from "./outcomes-section";
import { SecuritySection } from "./security-section";
import { SocialProofSection } from "./social-proof-section";
import { PricingSection } from "./pricing-section";
import { FAQSection } from "./faq-section";

export function HomePage() {
  return (
    <>
      <HeroSection />
      
      <div id="services">
        <ServicesSection />
      </div>
      
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      
      <OutcomesSection />
      
      <div id="security">
        <SecuritySection />
      </div>
      
      <SocialProofSection />
      
      <div id="pricing">
        <PricingSection />
      </div>
      
      <div id="faq">
        <FAQSection />
      </div>
    </>
  );
}
