import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  description?: string
  badge?: string
  actions?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  badge,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-center md:justify-between", className)}>
      <div className="space-y-1">
        {badge ? <span className="status-pill status-pill-info">{badge}</span> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
