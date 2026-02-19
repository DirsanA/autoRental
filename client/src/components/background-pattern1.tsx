import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

import { PatternPlaceholder } from "@/components/pattern-placeholder";

interface BackgroundPattern1Props {
  className?: string;
  children?: ReactNode;
}

const BackgroundPattern1 = ({
  className,
  children,
}: BackgroundPattern1Props) => {
  return (
    <section
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-background via-secondary/40 to-background",
        className,
      )}
    >
      <PatternPlaceholder />
      <div className="relative z-10">{children}</div>
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 10%, var(--background) 40%, var(--primary) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-56 bg-gradient-to-t from-black/15 via-black/0 dark:from-black/40" />
    </section>
  );
};

export { BackgroundPattern1 };
