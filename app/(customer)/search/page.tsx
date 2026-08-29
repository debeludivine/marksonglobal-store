import { searchProducts } from '@/lib/api'
import ProductGrid from '@/components/ui/ProductGrid'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Results | MarksonGlobal Stores',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''

  const results = q ? await searchProducts(q) : []

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-emerald to-brand-emerald-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2 text-white/80">
            <Search size={24} />
            <span className="font-[Inter,sans-serif] text-sm uppercase tracking-wider font-semibold">Search Results</span>
          </div>
          <h1 className="font-[Outfit,sans-serif] font-black text-3xl md:text-4xl text-white mb-2">
            &quot;{q}&quot;
          </h1>
          <p className="text-white/70 font-[Inter,sans-serif]">
            {results.length} product{results.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-brand-light-gray mt-4">
            <Search size={48} className="text-brand-light-gray mx-auto mb-4" />
            <h2 className="font-[Outfit,sans-serif] font-bold text-xl text-brand-charcoal mb-2">
              No products found
            </h2>
            <p className="text-brand-gray font-[Inter,sans-serif] max-w-md mx-auto">
              We couldn&apos;t find any products matching &quot;{q}&quot;. Try checking your spelling or use more general terms.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
