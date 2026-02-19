import { cn } from "@/lib/utils";

interface PatternPlaceholderProps {
  className?: string;
}

/**
 * Background pattern layer (placeholder).
 * Keep this purely presentational so it can be reused across pages/sections.
 */
const PatternPlaceholder = ({ className }: PatternPlaceholderProps) => {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      {/* Subtle dot grid */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-[0.6] dark:opacity-[0.4]"
      >
        <defs>
          <pattern
            id="dot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.25" className="fill-border dark:fill-muted-foreground/40" />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="25%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="fade-mask">
            <rect width="100%" height="100%" fill="url(#fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#dot-grid)"
          mask="url(#fade-mask)"
        />
      </svg>

      {/* Soft glow blobs */}
      <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-24 right-[-8rem] h-72 w-72 rounded-full bg-secondary/35 blur-3xl" />
    </div>
  );
};

export { PatternPlaceholder };
