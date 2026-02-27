"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FieldProps = React.HTMLAttributes<HTMLDivElement>;

export function Field({ className, ...props }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props} />
  );
}

type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <label
      className={cn("text-sm font-medium text-gray-700", className)}
      {...props}
    />
  );
}
