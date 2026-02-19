import { SectionContainer } from "@/components/marketing/section-container";

const integrations = [
  { name: "Stripe", category: "Payments" },
  { name: "Auth0", category: "Identity" },
  { name: "Twilio", category: "Comms" },
  { name: "Slack", category: "Ops" },
  { name: "Google Maps", category: "Fleet" },
  { name: "Vercel", category: "Hosting" },
  { name: "Zapier", category: "Automate" },
  { name: "Postmark", category: "Email" },
] as const;

export function LandingIntegrations() {
  return (
    <SectionContainer className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <h2 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
              Plays well with your stack
            </h2>
            <p className="max-w-xl text-pretty text-sm text-muted-foreground md:text-base">
              Connect AutoRental to the tools your team already uses. Our
              first-class integrations make it easy to sync business critical
              data across your workflow.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {integrations.map((int) => (
            <div
              key={int.name}
              className="group flex flex-col justify-between rounded-2xl border bg-card/50 p-6 transition-all hover:bg-card hover:shadow-sm"
            >
              <div className="mb-4 h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">
                {int.name.slice(0, 1)}
              </div>
              <div>
                <div className="text-sm font-semibold">{int.name}</div>
                <div className="text-xs text-muted-foreground">
                  {int.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
