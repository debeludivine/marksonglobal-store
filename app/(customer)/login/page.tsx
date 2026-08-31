'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/customer-auth-actions'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    // Must run on browser client so PKCE code_verifier is stored in localStorage
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    
    if (result.success) {
      router.push('/profile')
      router.refresh()
    } else {
      setError(result.error || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-brand-offwhite px-4 py-12">
      <div className="card max-w-md w-full p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn size={24} />
          </div>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal mb-2">Welcome Back</h1>
          <p className="text-brand-gray text-sm font-[Inter,sans-serif]">Sign in to your MarksonGlobal account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-[Inter,sans-serif]">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={googleLoading || loading}
          className="w-full btn-outline py-2.5 flex items-center justify-center gap-3 mb-6 disabled:opacity-50"
        >
          {googleLoading ? 'Redirecting...' : (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-brand-light-gray flex-1"></div>
          <span className="text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">Or sign in with email</span>
          <div className="h-px bg-brand-light-gray flex-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="you@example.com"
              className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald transition-colors"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal uppercase tracking-wide">Password</label>
              <Link href="#" className="text-xs text-brand-emerald hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••"
              className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-brand-gray font-[Inter,sans-serif]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-emerald font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
