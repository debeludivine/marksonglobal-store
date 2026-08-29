'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag, Zap } from 'lucide-react'

export default function HeroBanner() {
  return (
    <section className="relative min-h-[75vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center overflow-hidden hero-gradient">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-brand-gold/10 blur-2xl" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Copy */}
          <div className="animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/30 text-brand-gold rounded-full px-3 py-1 text-xs font-[Outfit,sans-serif] font-bold uppercase tracking-wider mb-4">
              <Zap size={12} fill="currentColor" />
              Nigeria&apos;s Premium Digital Supermarket
            </div>

            <h1 className="font-[Outfit,sans-serif] font-black text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-4 sm:mb-6">
              Everything You{' '}
              <span className="text-gradient-gold">Need.</span>
              <br />
              Delivered to{' '}
              <span className="text-white/80">Your Door.</span>
            </h1>

            <p className="text-white/70 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md font-[Inter,sans-serif]">
              Shop premium groceries, fresh provisions, and the latest electronics —
              all in one place. Quality guaranteed, prices you&apos;ll love.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/category/groceries"
                id="hero-shop-groceries"
                className="btn-gold flex items-center justify-center gap-2 group"
              >
                <ShoppingBag size={18} />
                Shop Groceries
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/category/electronics"
                id="hero-shop-electronics"
                className="btn-outline border-white text-white hover:bg-white hover:text-brand-emerald flex items-center justify-center gap-2 group"
              >
                Shop Electronics
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 sm:gap-8 mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10">
              {[
                { value: '500+', label: 'Products' },
                { value: '24hrs', label: 'Delivery' },
                { value: '100%', label: 'Authentic' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-[Outfit,sans-serif] font-black text-xl sm:text-2xl text-brand-gold">{stat.value}</div>
                  <div className="text-white/50 text-xs font-[Inter,sans-serif] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Visual Cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4 animate-slide-up">
            {/* Groceries Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
              <div className="text-4xl mb-3">🥗</div>
              <h3 className="font-[Outfit,sans-serif] font-bold text-white text-lg mb-1">Groceries</h3>
              <p className="text-white/60 text-sm font-[Inter,sans-serif]">Peak Milk, Indomie, Rice & more</p>
              <div className="mt-4 text-brand-gold text-sm font-[Outfit,sans-serif] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Browse <ArrowRight size={14} />
              </div>
            </div>

            {/* Electronics Card */}
            <div className="bg-brand-gold/10 backdrop-blur-sm border border-brand-gold/30 rounded-2xl p-6 hover:bg-brand-gold/15 transition-all duration-300 group cursor-pointer mt-6">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-[Outfit,sans-serif] font-bold text-white text-lg mb-1">Electronics</h3>
              <p className="text-white/60 text-sm font-[Inter,sans-serif]">Phones, Speakers, Power Banks</p>
              <div className="mt-4 text-brand-gold text-sm font-[Outfit,sans-serif] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Browse <ArrowRight size={14} />
              </div>
            </div>

            {/* Deals Card */}
            <div className="col-span-2 bg-white/10 backdrop-blur-sm border border-brand-gold/20 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/15 transition-all duration-300">
              <div className="bg-brand-gold rounded-xl p-3 flex-shrink-0">
                <Zap size={20} className="text-brand-charcoal" fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-brand-gold font-[Outfit,sans-serif] font-bold text-sm">Today&apos;s Hot Deals</p>
                <p className="text-white/60 text-xs font-[Inter,sans-serif] mt-0.5">Limited time offers — up to 30% off</p>
              </div>
              <Link href="/deals" className="text-brand-gold text-sm font-[Outfit,sans-serif] font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L1440 80L1440 40C1440 40 1080 0 720 0C360 0 0 40 0 40L0 80Z" fill="#F8F9FA" />
        </svg>
      </div>
    </section>
  )
}
