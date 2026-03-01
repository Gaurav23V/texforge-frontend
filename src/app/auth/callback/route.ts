import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

function getBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
  
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  const requestUrl = new URL(request.url)
  return requestUrl.origin
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const baseUrl = getBaseUrl(request)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const nextPath = next && next.startsWith("/") ? next : "/dashboard"

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", baseUrl))
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors when setting cookies from Server Components
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", baseUrl))
  }

  return NextResponse.redirect(new URL(nextPath, baseUrl))
}
