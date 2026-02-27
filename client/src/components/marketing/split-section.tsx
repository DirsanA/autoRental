import { SectionContainer } from "@/components/marketing/section-container";
import type { ReactNode } from "react";

interface SplitSectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description: string;
  align?: "left" | "right";
  children: ReactNode;
}

/**
 * Split layout used for product showcase–style sections.
 * Text column + content column, alternating alignment.
 */
export function SplitSection({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: SplitSectionProps) {
  const textFirst = align === "left";

  return (
    <SectionContainer
      id={id}
      className="py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className={textFirst ? "" : "lg:order-2"}>
          <div className="space-y-3">
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-pretty text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h2>
            <p className="max-w-xl text-pretty text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          </div>
        </div>

        <div className={textFirst ? "" : "lg:order-1"}>{children}</div>
      </div>
    </SectionContainer>
  );
}

