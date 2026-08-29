'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/customer-auth-actions'
import { LogIn, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
