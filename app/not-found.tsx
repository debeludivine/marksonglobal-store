'use client'

import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-brand-offwhite">
      <div className="relative mb-8">
        <div className="text-9xl font-black text-brand-emerald/10 font-[Outfit,sans-serif] select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search size={64} className="text-brand-emerald" />
        </div>
      </div>
      
      <h1 className="font-[Outfit,sans-serif] font-black text-3xl md:text-4xl text-brand-charcoal mb-4">
        Page Not Found
      </h1>
      
      <p className="text-brand-gray font-[Inter,sans-serif] mb-8 max-w-md">
        Oops! We couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link href="/" className="btn-primary flex items-center justify-center gap-2">
          <Home size={18} />
          Back to Home
        </Link>
        <button 
          className="btn-outline flex items-center justify-center gap-2 bg-white"
          onClick={() => {
            if (typeof window !== 'undefined') window.history.back()
          }}
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    </div>
  )
}
