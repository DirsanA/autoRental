import React from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionContainer({
  children,
  className,
}: SectionContainerProps) {
  return (
    <section
      className={cn(
        "w-full px-6 lg:px-20 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </section>
  );
}
