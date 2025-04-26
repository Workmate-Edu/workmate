"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function LoadingDots({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex gap-1", className)} {...props}>
      <div className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-pulse" />
      <div className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-pulse [animation-delay:100ms]" />
      <div className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-pulse [animation-delay:200ms]" />
    </div>
  );
}
