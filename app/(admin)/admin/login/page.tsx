'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { login, signInWithGoogle } from '@/lib/customer-auth-actions'
import { LogIn, ArrowRight, Lock, Mail, Eye, EyeOff, AlertCircle, ChevronDown, ShieldCheck, Star } from 'lucide-react'

const ADMIN_EMAIL = 'debeludivine@gmail.com'

export default function UnifiedLoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const result = await signInWithGoogle(window.location.origin)
    if (result.success && result.url) {
      window.location.href = result.url
    } else {
      setError(result.error || 'Failed to initiate Google login')
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

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAdminLoading(true)
    setError('')

    if (adminEmail.toLowerCase() !== ADMIN_EMAIL) {
      setError('This account does not have admin privileges.')
      setAdminLoading(false)
      return
    }

    const formData = new FormData()
    formData.set('email', adminEmail)
    formData.set('password', adminPassword)
    const result = await login(formData)

    if (result.success) {
      router.push('/admin/dashboard')
      router.refresh()
    } else {
      setError(result.error || 'Admin login failed')
      setAdminLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex items-center justify-center px-4 py-12">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-emerald/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo.jpg"
              alt="MarksonGlobal Stores"
              width={140}
              height={56}
              className="h-12 w-auto object-contain mx-auto mb-4"
            />
          </Link>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal mb-1">Welcome Back</h1>
          <p className="text-brand-gray text-sm font-[Inter,sans-serif]">Sign in to your MarksonGlobal account</p>
        </div>

        {/* Main Sign-In Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-brand-light-gray p-8 animate-fade-in">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm mb-6 font-[Inter,sans-serif]">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Google Auth — Recommended */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-[10px] font-[Outfit,sans-serif] font-bold text-brand-emerald uppercase tracking-widest bg-brand-emerald/10 px-2.5 py-1 rounded-full">
                <Star size={10} className="fill-brand-emerald" />
                Recommended
              </span>
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              id="google-signin-btn"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-brand-light-gray rounded-2xl font-[Outfit,sans-serif] font-semibold text-brand-charcoal text-sm hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all duration-200 disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-brand-gray/30 border-t-brand-emerald rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px bg-brand-light-gray flex-1" />
            <span className="text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">Or with email</span>
            <div className="h-px bg-brand-light-gray flex-1" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="w-full border border-brand-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal uppercase tracking-wide">
                  Password
                </label>
                <Link href="#" className="text-xs text-brand-emerald hover:underline">Forgot password?</Link>
              </div>
              <input
                id="password"
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
              id="signin-btn"
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-brand-gray font-[Inter,sans-serif]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-emerald font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>

        {/* Admin Access Section */}
        <div className="bg-white rounded-3xl border border-brand-light-gray shadow-sm overflow-hidden">
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            id="admin-panel-toggle"
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-brand-offwhite transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-charcoal/10 flex items-center justify-center">
                <ShieldCheck size={16} className="text-brand-charcoal" />
              </div>
              <div className="text-left">
                <p className="font-[Outfit,sans-serif] font-bold text-sm text-brand-charcoal">Admin Access</p>
                <p className="text-xs text-brand-gray font-[Inter,sans-serif]">Sign in to the Control Room</p>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-brand-gray transition-transform duration-300 ${showAdminPanel ? 'rotate-180' : ''}`}
            />
          </button>

          {showAdminPanel && (
            <div className="px-6 pb-6 pt-2 border-t border-brand-light-gray animate-fade-in">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" />
                    <input
                      id="admin-email"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      placeholder="admin@marksonglobal.com"
                      className="w-full border border-brand-light-gray rounded-xl pl-10 pr-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-charcoal transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password-field" className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray" />
                    <input
                      id="admin-password-field"
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full border border-brand-light-gray rounded-xl pl-10 pr-10 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-charcoal transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray hover:text-brand-charcoal transition-colors"
                    >
                      {showAdminPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  id="admin-login-button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-charcoal hover:bg-black text-white rounded-xl font-[Outfit,sans-serif] font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {adminLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock size={14} />
                      Sign In to Control Room
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-brand-gray font-[Inter,sans-serif] pt-2">
          © 2025 MarksonGlobal Stores. All rights reserved.
        </p>
      </div>
    </div>
  )
}
