import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, Zap, ShoppingBag, Cpu } from 'lucide-react'
import HeroBanner from '@/components/ui/HeroBanner'
import ProductGrid from '@/components/ui/ProductGrid'
import ProductGridSkeleton from '@/components/ui/ProductGridSkeleton'
import { getDeals, getProducts, getCategoryBySlug } from '@/lib/api'

async function DealsSection() {
  const deals = await getDeals()
  return <ProductGrid products={deals} />
}

async function CategorySection({ slug }: { slug: string }) {
  const cat = await getCategoryBySlug(slug)
  const products = cat ? await getProducts(cat.id) : []
  return <ProductGrid products={products} />
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <HeroBanner />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find exactly what you need</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Groceries Category Card */}
          <Link
            href="/category/groceries"
            id="cat-groceries-card"
            className="group relative overflow-hidden rounded-2xl p-5 sm:p-8 bg-gradient-to-br from-brand-emerald to-brand-emerald-light hover:from-brand-emerald-light hover:to-brand-emerald transition-all duration-300 shadow-emerald hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none pointer-events-none select-none">
              🥗
            </div>
            <ShoppingBag size={28} className="text-brand-gold mb-3" />
            <h3 className="font-[Outfit,sans-serif] font-bold text-xl sm:text-2xl text-white mb-1.5">
              Groceries & Provisions
            </h3>
            <p className="text-white/70 text-xs sm:text-sm font-[Inter,sans-serif] mb-4">
              Rice, noodles, milk, oil, seasonings & all your daily essentials
            </p>
            <div className="inline-flex items-center gap-2 text-brand-gold font-[Outfit,sans-serif] font-semibold text-sm group-hover:gap-3 transition-all">
              Shop Now <ArrowRight size={16} />
            </div>
          </Link>

          {/* Electronics Category Card */}
          <Link
            href="/category/electronics"
            id="cat-electronics-card"
            className="group relative overflow-hidden rounded-2xl p-5 sm:p-8 bg-gradient-to-br from-brand-charcoal to-gray-800 hover:from-gray-800 hover:to-brand-charcoal transition-all duration-300 shadow-card-hover hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none pointer-events-none select-none">
              📱
            </div>
            <Cpu size={28} className="text-brand-gold mb-3" />
            <h3 className="font-[Outfit,sans-serif] font-bold text-xl sm:text-2xl text-white mb-1.5">
              Electronics
            </h3>
            <p className="text-white/70 text-xs sm:text-sm font-[Inter,sans-serif] mb-4">
              Phones, TVs, speakers, power banks & the latest gadgets
            </p>
            <div className="inline-flex items-center gap-2 text-brand-gold font-[Outfit,sans-serif] font-semibold text-sm group-hover:gap-3 transition-all">
              Shop Now <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </section>

      {/* Today's Deals */}
      <section className="bg-gradient-to-r from-brand-emerald/5 to-brand-gold/5 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} className="text-brand-gold" fill="currentColor" />
                <h2 className="section-title">Today&apos;s Hot Deals</h2>
              </div>
              <p className="section-subtitle">Limited time offers — grab them before they&apos;re gone!</p>
            </div>
            <Link
              href="/deals"
              className="hidden sm:flex items-center gap-1.5 text-brand-emerald font-[Outfit,sans-serif] font-semibold text-sm hover:gap-3 transition-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <DealsSection />
          </Suspense>
        </div>
      </section>

      {/* Electronics Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div>
            <h2 className="section-title">Electronics</h2>
            <p className="section-subtitle">Latest gadgets & technology</p>
          </div>
          <Link
            href="/category/electronics"
            className="hidden sm:flex items-center gap-1.5 text-brand-emerald font-[Outfit,sans-serif] font-semibold text-sm hover:gap-3 transition-all"
          >
            See All <ArrowRight size={16} />
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <CategorySection slug="electronics" />
        </Suspense>
      </section>

      {/* Groceries Showcase */}
      <section className="bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <div>
              <h2 className="section-title">Groceries & Provisions</h2>
              <p className="section-subtitle">Fresh, quality everyday essentials</p>
            </div>
            <Link
              href="/category/groceries"
              className="hidden sm:flex items-center gap-1.5 text-brand-emerald font-[Outfit,sans-serif] font-semibold text-sm hover:gap-3 transition-all"
            >
              See All <ArrowRight size={16} />
            </Link>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <CategorySection slug="groceries" />
          </Suspense>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-brand-emerald py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-8 text-center">
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: 'Nationwide shipping' },
              { icon: '✅', title: '100% Authentic', desc: 'Quality guaranteed' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Safe & encrypted' },
              { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <div className="text-3xl">{item.icon}</div>
                <h4 className="font-[Outfit,sans-serif] font-bold text-white text-sm">{item.title}</h4>
                <p className="text-white/60 text-xs font-[Inter,sans-serif]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
