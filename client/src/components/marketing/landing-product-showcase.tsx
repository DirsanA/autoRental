import { SplitSection } from "@/components/marketing/split-section";

export function LandingProductShowcase() {
  return (
    <SplitSection
      id="product"
      eyebrow="Product"
      title="A control center for every rental journey."
      description="Give customers a clear path from search to keys‑in‑hand, while your team gets real‑time visibility into every booking, vehicle, and location."
      align="left"
    >
      <div className="relative rounded-3xl border bg-card/70 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="h-7 w-32 rounded-full bg-muted" />
          <div className="h-7 w-20 rounded-full bg-muted" />
        </div>

        <div className="grid gap-3 md:grid-cols-[1.4fr,1fr]">
          <div className="space-y-3 rounded-2xl bg-muted/60 p-4">
            <div className="h-5 w-24 rounded-full bg-card/80" />
            <div className="h-8 w-40 rounded-full bg-card/70" />
            <div className="h-10 w-full rounded-xl bg-card/60" />
            <div className="h-10 w-full rounded-xl bg-card/40" />
          </div>

          <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
            <div className="h-4 w-28 rounded-full bg-card/80" />
            <div className="h-4 w-32 rounded-full bg-card/60" />
            <div className="h-16 w-full rounded-xl bg-card/40" />
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="space-y-2 rounded-2xl border bg-background/60 p-3">
            <div className="h-4 w-20 rounded-full bg-muted" />
            <div className="h-4 w-16 rounded-full bg-muted" />
          </div>
          <div className="space-y-2 rounded-2xl border bg-background/60 p-3">
            <div className="h-4 w-24 rounded-full bg-muted" />
            <div className="h-4 w-16 rounded-full bg-muted" />
          </div>
          <div className="space-y-2 rounded-2xl border bg-background/60 p-3">
            <div className="h-4 w-28 rounded-full bg-muted" />
            <div className="h-4 w-20 rounded-full bg-muted" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-8 -bottom-10 -z-10 h-24 rounded-[2rem] bg-gradient-to-b from-primary/20 via-primary/10 to-transparent blur-2xl" />
      </div>
    </SplitSection>
  );
}

