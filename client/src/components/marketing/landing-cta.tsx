import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/marketing/section-container";

export function LandingCta() {
  return (
    <SectionContainer className="pt-10 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border bg-card/70 px-6 py-10 shadow-sm backdrop-blur sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <h3 className="text-pretty text-xl font-semibold tracking-tight md:text-2xl">
                Ready to ship bookings next?
              </h3>
              <p className="max-w-2xl text-pretty text-sm text-muted-foreground md:text-base">
                This layout makes it easy to add routes like{" "}
                <span className="font-medium text-foreground">
                  /pricing
                </span>{" "}
                and{" "}
                <span className="font-medium text-foreground">
                  /dashboard
                </span>{" "}
                later without rewriting the homepage.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="#">Get started</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="#top">Back to top</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

