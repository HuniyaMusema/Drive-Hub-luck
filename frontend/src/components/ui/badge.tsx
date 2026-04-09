import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-[#4CBFBF] text-white",
        secondary:   "border-slate-200 bg-slate-100 text-slate-600",
        destructive: "border-transparent bg-red-500 text-white",
        outline:     "border-slate-200 text-slate-600",
        success:     "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning:     "border-amber-200 bg-amber-50 text-amber-700",
        info:        "border-blue-200 bg-blue-50 text-blue-700",
        teal:        "border-[#4CBFBF]/30 bg-[#4CBFBF]/10 text-[#2a9090]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
