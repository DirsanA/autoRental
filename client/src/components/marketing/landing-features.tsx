import { SectionContainer } from "@/components/marketing/section-container";

const features = [
  {
    title: "Booking flows, not boilerplate",
    description:
      "Compose search, selection, and checkout steps from reusable building blocks instead of rebuilding every journey from scratch.",
  },
  {
    title: "Fleet‑aware by design",
    description:
      "Model locations, vehicle classes, pricing rules, and blackout dates in a way that maps to how rental teams already think.",
  },
  {
    title: "Built for your stack",
    description:
      "Use typed APIs and webhooks that drop into modern Next.js apps, without fighting your existing auth or data layer.",
  },
  {
    title: "Experiment safely",
    description:
      "Test new flows, discounts, and add‑ons behind feature flags before rolling them out across your fleet.",
  },
  {
    title: "Operational visibility",
    description:
      "Give ops teams a single pane for utilization, revenue, and in‑progress rentals without bolted‑on dashboards.",
  },
  {
    title: "Ready to scale",
    description:
      "Start with a single city and grow to global coverage without rewriting flows or navigation.",
  },
] as const;

export function LandingFeatures() {
  return (
    <SectionContainer id="features" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-3">
          <h2 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
            Everything you need to ship serious rental products
          </h2>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            Opinionated enough to move fast, flexible enough to model real‑world
            fleets, inventory, and pricing without painting you into a corner.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex h-full flex-col justify-between rounded-2xl border bg-card/70 p-6 shadow-sm backdrop-blur"
            >
              <div className="space-y-2">
                <h3 className="text-base font-medium">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

