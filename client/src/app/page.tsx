import Navbar from "@/components/navbar";
import { LandingHero } from "@/components/marketing/landing-hero";
import { LandingSearch } from "@/components/marketing/laning-search";
import { LandingFeatures } from "@/components/marketing/landing-features";
import { LandingCta } from "@/components/marketing/landing-cta";
import { LandingFooter } from "@/components/marketing/landing-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      <main>
        <section className="pt-2 pb-16 px-6 lg:px-20">
          <LandingHero />
        </section>

        <section className="px-6 lg:px-20 -mt-10 relative z-10">
          <LandingSearch />
        </section>

        <section className="py-20 px-6 lg:px-20 bg-gray-50">
          <LandingFeatures />
        </section>

        <section className="py-24 px-6 lg:px-20 bg-black text-white">
          <LandingCta />
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
