import { SectionContainer } from "@/components/marketing/section-container";

const logos = [
  "Northwind Rentals",
  "Fleetbase",
  "UrbanDrive",
  "Highway Labs",
  "Atlas Mobility",
] as const;

export function LandingSocialProof() {
  return (
    <SectionContainer className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Trusted by modern rental teams shipping production workloads.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {logos.map((name) => (
            <div
              key={name}
              className="flex items-center justify-center rounded-xl border bg-card/70 px-4 py-3 text-center text-xs font-medium text-muted-foreground sm:text-sm"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
