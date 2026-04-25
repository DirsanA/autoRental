import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "form-location", label: "Location" },
  { key: "form-company", label: "Company" },
  { key: "form-contact", label: "Contact" },
  { key: "form-professional", label: "Details" },
  { key: "form-review", label: "Review" },
] as const;

export const StepProgress = ({ current }: { current: string }) => {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 min-w-0">
              <div className="flex items-center w-full">
                <div className={cn("h-px flex-1 transition-smooth", i === 0 ? "opacity-0" : done || active ? "bg-primary" : "bg-border")} />
                <div
                  className={cn(
                    "relative h-9 w-9 shrink-0 rounded-full grid place-items-center text-xs font-bold font-display transition-smooth border-2",
                    done && "bg-primary border-primary text-primary-foreground",
                    active && "bg-background border-primary text-primary shadow-glow",
                    !done && !active && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </div>
                <div className={cn("h-px flex-1 transition-smooth", i === STEPS.length - 1 ? "opacity-0" : done ? "bg-primary" : "bg-border")} />
              </div>
              <span className={cn("mt-2 text-[11px] font-medium truncate transition-smooth", active ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
