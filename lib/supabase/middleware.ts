import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseUrl, getSupabaseAnonKey } from './config'

const ADMIN_EMAIL = 'debeludivine@gmail.com'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protect all /admin/dashboard/* routes — must be authenticated AND be the admin
  if (pathname.startsWith('/admin/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    // User is authenticated but not the admin email — send them home
    if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Protect /profile route
  if (!user && pathname.startsWith('/profile')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If logged-in admin visits admin login page, redirect to dashboard
  if (user && pathname === '/admin/login') {
    if (user.email?.toLowerCase() === ADMIN_EMAIL) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
    // Non-admin visiting /admin/login — redirect to home
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // If logged-in user tries to visit customer login/register, redirect to profile
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/profile'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
