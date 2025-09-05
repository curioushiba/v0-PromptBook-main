import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gray-300 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }