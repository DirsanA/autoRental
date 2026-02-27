import { SectionContainer } from "@/components/marketing/section-container";

const stats = [
  { label: "Daily drop‑offs", value: "12,000+" },
  { label: "Active locations", value: "450+" },
  { label: "Global partners", value: "1,200+" },
  { label: "Fleet uptime", value: "99.9%" },
] as const;

export function LandingStats() {
  return (
    <SectionContainer className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="space-y-2 text-center md:text-left"
            >
              <div className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border bg-card/50 p-8 shadow-sm backdrop-blur md:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Built for scale, hardened for production.
              </h2>
              <p className="max-w-md text-pretty text-sm text-muted-foreground md:text-base">
                AutoRental handles the complex logic of multi-region fleet
                management so you can focus on the customer experience. Our
                infrastructure is designed to handle peak demand without
                breaking a sweat.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 rounded-2xl bg-muted/50" />
              <div className="h-24 rounded-2xl bg-muted/30" />
              <div className="h-24 rounded-2xl bg-muted/40 sm:col-span-2" />
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
