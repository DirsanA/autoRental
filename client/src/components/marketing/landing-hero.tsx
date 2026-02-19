import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionContainer } from "@/components/marketing/section-container";

export function LandingHero() {
  return (
    <SectionContainer className="pt-32 sm:pt-36 lg:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6">
          <Badge variant="secondary" className="w-fit">
            AutoRental
          </Badge>
          <div className="space-y-4">
            <h1 className="text-pretty text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              Ship rental workflows your customers love.
            </h1>
            <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
              Design, launch, and optimize end‑to‑end auto rental journeys—from
              discovery to drop‑off—on a single, developer‑friendly platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="rounded-full">
              <Link href="#">Get started</Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="#features">View product</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground">2x faster</div>
              <div>from idea to live rental flow</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Global‑ready</div>
              <div>multi‑location fleets and currencies</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Secure</div>
              <div>PCI‑ready workflows out of the box</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border bg-card/70 p-6 shadow-sm backdrop-blur">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="h-7 w-28 rounded-full bg-muted" />
                <div className="h-7 w-16 rounded-full bg-muted" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-28 rounded-2xl bg-muted" />
                <div className="h-28 rounded-2xl bg-muted" />
                <div className="h-28 rounded-2xl bg-muted sm:col-span-2" />
              </div>
              <div className="h-10 w-40 rounded-full bg-primary/30" />
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-secondary/20 blur-2xl" />
        </div>
      </div>
    </SectionContainer>
  );
}
