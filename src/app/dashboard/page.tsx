import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageShell } from "@/components/page-shell"
import { SectionHeader } from "@/components/section-header"
import { StatCard } from "@/components/stat-card"
import { DashboardAccent } from "@/components/visual-effects/dashboard-accent"
import { ProjectList } from "@/components/project-list"
import { Button } from "@/components/ui/button"
import { Activity, Clock3, LogOut, Sparkles } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <PageShell withGrid contentClassName="space-y-6 md:space-y-8">
      <DashboardAccent />
      <header className="surface-glass flex flex-col gap-4 rounded-2xl p-4 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">TexForge</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </form>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <StatCard
          title="Workspace status"
          value="Ready"
          hint="Compiler and sharing tools available"
          icon={Sparkles}
        />
        <StatCard
          title="Publishing mode"
          value="Private"
          hint="Share links remain view-only"
          icon={Activity}
        />
        <StatCard
          title="Session cadence"
          value="Live autosave"
          hint="Changes persist while you type"
          icon={Clock3}
        />
      </section>

      <main className="surface-glass rounded-2xl p-4 md:p-6">
        <SectionHeader
          badge="Projects"
          title="Your writing workspace"
          description="Create, open, and manage LaTeX projects with quick compile access."
        />
        <ProjectList />
      </main>
    </PageShell>
  )
}
