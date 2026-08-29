'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/logo.jpg"
              alt="MarksonGlobal Stores"
              width={140}
              height={56}
              className="h-14 w-auto object-contain mb-4 brightness-0 invert"
            />
            <div className="flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/30 rounded-full px-4 py-1.5">
              <Lock size={12} className="text-brand-gold" />
              <span className="text-brand-gold text-xs font-[Outfit,sans-serif] font-bold uppercase tracking-widest">
                Admin Access
              </span>
            </div>
          </div>

          <h1 className="font-[Outfit,sans-serif] font-bold text-xl text-white text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-white/60 text-sm font-[Inter,sans-serif] text-center mb-8">
            Sign in to access the control room
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-xs font-[Outfit,sans-serif] font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@marksonglobal.com"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-gold focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-xs font-[Outfit,sans-serif] font-semibold text-white/70 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl pl-10 pr-10 py-3 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-gold focus:bg-white/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 animate-fade-in">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-xs font-[Inter,sans-serif]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              id="admin-login-button"
              className="w-full btn-gold py-3.5 text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-brand-charcoal/30 border-t-brand-charcoal rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={16} />
                  Sign In to Control Room
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs font-[Inter,sans-serif] mt-6">
          MarksonGlobal Stores — Admin Portal
        </p>
      </div>
    </div>
  )
}
