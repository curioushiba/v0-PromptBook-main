import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-black uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-gray-100",
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300",
        destructive:
          "bg-red-200 text-red-800 border-red-800 shadow-[2px_2px_0px_0px_rgba(153,27,27,1)]",
        success:
          "bg-green-200 text-green-800 border-green-800 shadow-[2px_2px_0px_0px_rgba(22,101,52,1)]",
        warning:
          "bg-yellow-200 text-yellow-800 border-yellow-800 shadow-[2px_2px_0px_0px_rgba(133,77,14,1)]",
        info:
          "bg-blue-200 text-blue-800 border-blue-800 shadow-[2px_2px_0px_0px_rgba(30,64,175,1)]",
        purple:
          "bg-purple-200 text-purple-800 border-purple-800 shadow-[2px_2px_0px_0px_rgba(88,28,135,1)]",
        outline:
          "bg-transparent text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }