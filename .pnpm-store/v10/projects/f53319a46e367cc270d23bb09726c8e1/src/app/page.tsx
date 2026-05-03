import Navbar from "@/components/navbar";
import { LandingHero } from "@/components/marketing/landing-hero";
import { LandingSearch } from "@/components/marketing/laning-search";
import { LandingFeatures } from "@/components/marketing/landing-features";
import { LandingFooter } from "@/components/marketing/landing-footer";


export default function HomePage() {

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      <Navbar />

      <main>
        <section className="pt-2 pb-16 px-6 lg:px-20">
          <LandingHero />
        </section>

        <section className="px-6 lg:px-20 -mt-10 relative z-10">
          <LandingSearch />
        </section>

        <section id="cars-section" className="py-20 px-6 lg:px-20 dark:bg-gray-900 bg-gray-50">
          <LandingFeatures />
        </section>

       
      </main>
      <LandingFooter />
    </div>
  );
}
