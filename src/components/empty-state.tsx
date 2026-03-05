import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-elevated flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-center",
        className
      )}
    >
      <span className="rounded-2xl border border-border/70 bg-secondary/50 p-3 text-brand-violet">
        <Icon className="h-7 w-7" />
      </span>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
