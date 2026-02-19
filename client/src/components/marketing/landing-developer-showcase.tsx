import { SplitSection } from "@/components/marketing/split-section";

export function LandingDeveloperShowcase() {
  return (
    <SplitSection
      id="developers"
      eyebrow="For Developers"
      title="Code-first fleet management."
      description="Ship complex rental logic without the complex code. Use our SDKs and webhooks to build bespoke experiences on top of our hardened infrastructure."
      align="right"
    >
      <div className="relative overflow-hidden rounded-3xl border bg-[#0d0d0d] p-0 shadow-2xl">
        {/* Mock Editor Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
            rental-flow.ts
          </div>
        </div>

        {/* Mock Code Content */}
        <div className="p-6 font-mono text-[13px] leading-relaxed">
          <div className="flex gap-4">
            <span className="text-white/20 select-none">1</span>
            <span className="text-blue-400">import</span>
            <span className="text-white">{` { `}</span>
            <span className="text-amber-200">createRentalFlow</span>
            <span className="text-white">{` } `}</span>
            <span className="text-blue-400">from</span>
            <span className="text-emerald-400">
              &quot;@autorental/sdk&quot;
            </span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">2</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">3</span>
            <span className="text-blue-400">const</span>
            <span className="text-white"> flow = </span>
            <span className="text-amber-200">createRentalFlow</span>
            <span className="text-white">({`{`}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">4</span>
            <span className="text-white"> locationId: </span>
            <span className="text-emerald-400">&quot;city-center-01&quot;</span>
            <span className="text-white">,</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">5</span>
            <span className="text-white"> vehicles: [</span>
            <span className="text-emerald-400">&quot;suv&quot;</span>
            <span className="text-white">, </span>
            <span className="text-emerald-400">&quot;sedan&quot;</span>
            <span className="text-white">],</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">6</span>
            <span className="text-white"> rules: {`{`} </span>
            <span className="text-amber-200">dynamicPricing</span>
            <span className="text-white">: </span>
            <span className="text-blue-400">true</span>
            <span className="text-white"> {`}`}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">7</span>
            <span className="text-white">{`})`}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">8</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">9</span>
            <span className="text-white">flow.</span>
            <span className="text-amber-200">onCheckout</span>
            <span className="text-white">((session) =&gt; {`{`}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">10</span>
            <span className="text-white"> </span>
            <span className="text-slate-400">{"// Automatic fleet sync"}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-white/20 select-none">11</span>
            <span className="text-white">{`})`}</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
      </div>
    </SplitSection>
  );
}
