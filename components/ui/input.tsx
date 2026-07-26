import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-surface-border bg-subtle px-3 py-2 text-sm text-copy-primary shadow-sm outline-none transition-colors placeholder:text-copy-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
