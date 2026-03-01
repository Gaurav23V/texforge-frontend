import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const nextPath = next && next.startsWith("/") ? next : "/dashboard"

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("[auth/callback] Code exchange failed:", error.message)
    return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin))
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin))
}
