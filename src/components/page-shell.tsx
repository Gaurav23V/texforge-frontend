import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageShellProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  withGrid?: boolean
}

export function PageShell({
  children,
  className,
  contentClassName,
  withGrid = false,
}: PageShellProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-hero-gradient opacity-80"
      />
      {withGrid ? (
        <div aria-hidden className="subtle-grid pointer-events-none absolute inset-0 -z-10 opacity-35" />
      ) : null}
      <div className={cn("page-shell py-6 md:py-10", contentClassName)}>{children}</div>
    </div>
  )
}
