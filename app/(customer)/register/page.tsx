'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/customer-auth-actions'
import { UserPlus, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    
    if (formData.get('password') !== formData.get('confirm_password')) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const result = await register(formData)
    
    if (result.success) {
      router.push('/profile')
      router.refresh()
    } else {
      setError(result.error || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-brand-offwhite px-4 py-12">
      <div className="card max-w-md w-full p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-emerald/10 text-brand-emerald rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus size={24} />
          </div>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal mb-2">Create Account</h1>
          <p className="text-brand-gray text-sm font-[Inter,sans-serif]">Join MarksonGlobal Stores today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-[Inter,sans-serif]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">Full Name</label>
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="John Doe"
              className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

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
            <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••"
              minLength={6}
              className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">Confirm Password</label>
            <input 
              type="password" 
              name="confirm_password" 
              required 
              placeholder="••••••••"
              minLength={6}
              className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-brand-gray font-[Inter,sans-serif]">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-emerald font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
