import ProductGrid from '@/components/ui/ProductGrid'
import { MOCK_DEALS } from '@/lib/seed-data'
import { Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Today's Deals",
  description: 'Shop the best deals on groceries and electronics at MarksonGlobal Stores.',
}

export default function DealsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-gold/20 to-brand-emerald/10 py-12 border-b border-brand-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap size={32} className="text-brand-gold" fill="currentColor" />
            <h1 className="font-[Outfit,sans-serif] font-black text-3xl md:text-4xl text-brand-charcoal">
              Today&apos;s Hot Deals
            </h1>
          </div>
          <p className="text-brand-gray font-[Inter,sans-serif] text-lg">
            {MOCK_DEALS.length} exclusive deals — limited time only!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProductGrid products={MOCK_DEALS} />
      </div>
    </div>
  )
}
