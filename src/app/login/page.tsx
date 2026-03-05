"use client"

import { createClient } from "@/lib/supabase/client"
import { PageShell } from "@/components/page-shell"
import { LoginAccent } from "@/components/visual-effects/login-accent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, useReducedMotion } from "framer-motion"
import { FileText, Share2, Sparkles, Zap } from "lucide-react"

const productHighlights = [
  {
    icon: Zap,
    title: "Fast compile loop",
    description: "Compile from your current buffer and preview updates immediately.",
  },
  {
    icon: Share2,
    title: "Instant sharing",
    description: "Publish read-only links for polished PDF outputs in one click.",
  },
  {
    icon: FileText,
    title: "Project-first workflow",
    description: "Keep LaTeX drafts, versions, and previews connected in one workspace.",
  },
]

export default function LoginPage() {
  const reduceMotion = useReducedMotion()

  const handleGoogleLogin = async () => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <PageShell withGrid contentClassName="flex min-h-screen items-center py-10 md:py-14">
      <LoginAccent />
      <div className="grid w-full items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <motion.section
          className="space-y-8"
          initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.45, ease: "easeOut" }}
        >
          <div className="space-y-4">
            <span className="status-pill status-pill-info">
              <Sparkles className="h-3.5 w-3.5" />
              Premium LaTeX workflow
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Write faster.
              <br />
              <span className="hero-text-gradient">Compile smarter.</span>
            </h1>
            <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              TexForge gives you an IDE-grade writing flow with rich PDF previews and one-click
              sharing for collaborators.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {productHighlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="surface-glass rounded-2xl p-4">
                <span className="mb-2 inline-flex rounded-lg border border-border/60 bg-secondary/60 p-2 text-brand-violet">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <Card className="surface-glass border-border/70">
          <CardHeader className="space-y-3 text-center">
            <span className="mx-auto inline-flex rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              Welcome to TexForge
            </span>
            <CardTitle className="text-3xl font-semibold">Sign in</CardTitle>
            <CardDescription className="text-sm">
              Continue with your Google account to access your projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGoogleLogin} className="w-full" size="lg" variant="brand">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
