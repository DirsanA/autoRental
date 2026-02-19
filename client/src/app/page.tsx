import Navbar from "@/components/navbar";
import { BackgroundPattern1 } from "@/components/background-pattern1";
import { LandingHero } from "@/components/marketing/landing-hero";
import { LandingSocialProof } from "@/components/marketing/landing-social-proof";
import { LandingFeatures } from "@/components/marketing/landing-features";
import { LandingProductShowcase } from "@/components/marketing/landing-product-showcase";
import { LandingDeveloperShowcase } from "@/components/marketing/landing-developer-showcase";
import { LandingHowItWorks } from "@/components/marketing/landing-how-it-works";
import { LandingTestimonials } from "@/components/marketing/landing-testimonials";
import { LandingStats } from "@/components/marketing/landing-stats";
import { LandingIntegrations } from "@/components/marketing/landing-integrations";
import { LandingFaq } from "@/components/marketing/landing-faq";
import { LandingCta } from "@/components/marketing/landing-cta";
import { LandingFooter } from "@/components/marketing/landing-footer";

export default function HomePage() {
  return (
    <div>
      {" "}
      <a id="top" className="sr-only" />
      <Navbar />
      <main>
        <LandingHero />
        <LandingSocialProof />
        <LandingFeatures />

        <div className="bg-muted/30">
          <LandingProductShowcase />
        </div>

        <LandingDeveloperShowcase />

        <div className="bg-card/50 border-y">
          <LandingHowItWorks />
        </div>

        <div className="bg-muted/50 border-b">
          <LandingTestimonials />
        </div>

        <LandingStats />

        <div className="bg-muted/30 border-y">
          <LandingIntegrations />
        </div>

        <LandingFaq />

        <div className="bg-card/50 border-t">
          <LandingCta />
        </div>

        <LandingFooter />
      </main>
    </div>
  );
}
