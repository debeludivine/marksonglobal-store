'use client'

import { useState } from 'react'
import type { Product, Category } from '@/lib/types'
import { Zap } from 'lucide-react'
import { updateProduct } from '@/lib/admin-actions'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function DealsClient({ initialProducts, categories }: { initialProducts: Product[], categories: Category[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const toggleDeal = async (product: Product) => {
    setLoadingId(product.id)
    await updateProduct(product.id, { is_deal: !product.is_deal })
    setLoadingId(null)
  }

  const activeDeals = initialProducts.filter((p) => p.is_deal).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center">
          <Zap size={20} className="text-brand-charcoal" fill="currentColor" />
        </div>
        <div>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal">Today&apos;s Deals</h1>
          <p className="text-brand-gray font-[Inter,sans-serif] text-sm">{activeDeals} active deals</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-brand-gold/10 border-b border-brand-gold/20">
          <p className="text-sm font-[Inter,sans-serif] text-brand-charcoal">
            Toggle the switch to add or remove a product from <strong>Today&apos;s Deals</strong> on the storefront.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Deals management table">
            <thead>
              <tr className="bg-brand-offwhite">
                {['Product', 'Category', 'Regular Price', 'Discount Price', 'Active Deal'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-gray">
              {initialProducts.map((p) => {
                const cat = categories.find(c => c.id === p.category_id)
                return (
                  <tr key={p.id} className="hover:bg-brand-offwhite/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{cat?.slug === 'electronics' ? '📦' : '🛒'}</span>
                        <p className="font-[Inter,sans-serif] text-sm font-medium text-brand-charcoal line-clamp-1">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-gray font-[Inter,sans-serif]">
                      {cat?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm font-[Outfit,sans-serif] font-semibold text-brand-charcoal">
                      {formatNaira(p.price)}
                    </td>
                    <td className="px-6 py-4">
                      {p.discount_price ? (
                        <span className="text-sm font-[Outfit,sans-serif] font-semibold text-brand-emerald">
                          {formatNaira(p.discount_price)}
                        </span>
                      ) : (
                        <span className="text-xs text-brand-gray">No discount set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleDeal(p)}
                        disabled={loadingId === p.id}
                        id={`deal-toggle-${p.id}`}
                        className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 disabled:opacity-50 ${
                          p.is_deal ? 'bg-brand-gold' : 'bg-brand-light-gray'
                        }`}
                        aria-checked={p.is_deal}
                        role="switch"
                        aria-label={`Toggle deal for ${p.name}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                          p.is_deal ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
