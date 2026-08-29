'use client'

import { useState } from 'react'
import { Tag, Plus, Pencil, Trash2, ShoppingBag, Cpu } from 'lucide-react'
import { MOCK_PRODUCTS } from '@/lib/seed-data'

const defaultCategories = [
  { id: 'cat-groceries', name: 'Groceries & Provisions', slug: 'groceries', icon: '🛒' },
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', icon: '📱' },
]

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(defaultCategories)

  const productCount = (catId: string) => MOCK_PRODUCTS.filter((p) => p.category_id === catId).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
            <Tag size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal">Categories</h1>
            <p className="text-brand-gray font-[Inter,sans-serif] text-sm">{categories.length} categories</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {categories.map((cat) => (
          <div key={cat.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{cat.icon}</div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-brand-emerald/10 text-brand-emerald transition-colors" aria-label={`Edit ${cat.name}`}>
                  <Pencil size={15} />
                </button>
              </div>
            </div>
            <h3 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal mb-1">{cat.name}</h3>
            <p className="text-brand-gray text-sm font-[Inter,sans-serif] mb-4">Slug: <code className="bg-brand-offwhite px-1.5 py-0.5 rounded text-xs">{cat.slug}</code></p>
            <div className="flex items-center gap-2 text-sm font-[Inter,sans-serif] text-brand-gray">
              <ShoppingBag size={15} className="text-brand-emerald" />
              {productCount(cat.id)} products in this category
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 text-center border-2 border-dashed border-brand-light-gray">
        <Tag size={32} className="text-brand-light-gray mx-auto mb-3" />
        <p className="font-[Outfit,sans-serif] font-semibold text-brand-gray mb-1">Need more categories?</p>
        <p className="text-brand-gray text-sm font-[Inter,sans-serif] mb-4">Currently showing Groceries & Electronics as per the store setup.</p>
        <button className="btn-outline text-sm py-2" id="admin-add-category">
          <Plus size={15} className="inline mr-1.5" />
          Request New Category
        </button>
      </div>
    </div>
  )
}
