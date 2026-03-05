import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  hint?: string
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("surface-elevated", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <span className="rounded-lg border border-border/70 bg-secondary/60 p-2 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  )
}
