import { SectionContainer } from "@/components/marketing/section-container";

const steps = [
  {
    label: "Step 1",
    title: "Model your fleet & rules",
    description:
      "Define locations, vehicle classes, pricing bands, blackout dates, and add‑ons in a way that matches how your team already operates.",
  },
  {
    label: "Step 2",
    title: "Compose rental flows",
    description:
      "Drop search, selection, and checkout components into your Next.js app, wired to your auth, branding, and data layer.",
  },
  {
    label: "Step 3",
    title: "Launch, learn, iterate",
    description:
      "Ship to production, capture performance and conversion data, then experiment with new flows or offers without rewrites.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <SectionContainer className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3">
          <h2 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
            How it works
          </h2>
          <p className="max-w-2xl text-pretty text-sm text-muted-foreground md:text-base">
            Go from idea to live rental experience in days, not months—without
            sacrificing the details that matter to operations and finance.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <li
              key={step.title}
              className="flex h-full flex-col rounded-2xl border bg-card/70 p-6 shadow-sm backdrop-blur"
            >
              <div className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[0.7rem] text-primary">
                  {step.label.replace("Step ", "")}
                </span>
                <span>{step.label}</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionContainer>
  );
}

