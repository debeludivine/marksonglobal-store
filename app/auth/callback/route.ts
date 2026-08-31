import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/config'

const ADMIN_EMAIL = 'debeludivine@gmail.com'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check who just signed in and route accordingly
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email?.toLowerCase() === ADMIN_EMAIL) {
        return NextResponse.redirect(`${origin}/admin/dashboard`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`)
}
