import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/config'

const ADMIN_EMAIL = 'debeludivine@gmail.com'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  if (!code) {
    console.error('[auth/callback] No code in request')
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
  }

  const cookieStore = await cookies()

  // Create a response object that we will mutate so cookies are set on it
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Write session cookies to BOTH the incoming request cookies (so getUser() works)
          // AND the outgoing response (so the browser stores them)
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
  }

  // Session is now set — figure out where to send the user
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email?.toLowerCase() === ADMIN_EMAIL) {
    response.headers.set('Location', `${origin}/admin/dashboard`)
    return NextResponse.redirect(`${origin}/admin/dashboard`, {
      headers: response.headers,
    })
  }

  return response
}
