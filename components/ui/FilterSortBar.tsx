'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function FilterSortBar({ totalCount }: { totalCount: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sort') || 'newest'
  const inStockOnly = searchParams.get('inStock') === 'true'

  const handleUpdate = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-brand-light-gray">
      <p className="text-sm text-brand-gray font-[Inter,sans-serif]">
        Showing <span className="font-semibold text-brand-charcoal">{totalCount}</span> products
      </p>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={inStockOnly}
            onChange={(e) => handleUpdate('inStock', e.target.checked ? 'true' : null)}
            className="rounded border-gray-300 text-brand-emerald focus:ring-brand-emerald"
          />
          <span className="text-sm text-brand-charcoal font-[Inter,sans-serif]">In Stock Only</span>
        </label>

        <select
          value={currentSort}
          onChange={(e) => handleUpdate('sort', e.target.value)}
          className="text-sm border border-brand-light-gray rounded-lg px-3 py-2 font-[Inter,sans-serif] bg-white text-brand-charcoal outline-none focus:border-brand-emerald transition-colors"
          aria-label="Sort products"
        >
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}
