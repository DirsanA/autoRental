import React from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Reusable section wrapper component that ensures consistent
 * max-width, horizontal padding, and vertical spacing.
 */
export function SectionContainer({ 
  children, 
  className, 
  id 
}: SectionContainerProps) {
  return (
    <section 
      id={id}
      className={cn(
        'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24',
        className
      )}
    >
      {children}
    </section>
  );
}
