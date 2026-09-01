'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ShoppingBag, ArrowRight, Trash2, ShoppingCart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import ProductCard from '@/components/ui/ProductCard'
import { type Product } from '@/lib/types'

export default function SavedItemsClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const [mounted, setMounted] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest')
  
  const savedItems = useWishlistStore((s) => s.items)
  const itemIds = useWishlistStore((s) => s.itemIds)
  const removeItem = useWishlistStore((s) => s.removeItem)
  const addCartItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    setMounted(true)
  }, [])

  // If server had initialProducts (from logged in DB) and store is empty, sync them
  const productsToDisplay = savedItems.length > 0 
    ? savedItems 
    : (initialProducts.length > 0 && itemIds.length === 0 ? initialProducts : [])

  const sortedProducts = [...productsToDisplay].sort((a, b) => {
    const priceA = a.discount_price ?? a.price
    const priceB = b.discount_price ?? b.price
    if (sortBy === 'price-asc') return priceA - priceB
    if (sortBy === 'price-desc') return priceB - priceA
    return 0
  })

  const handleAddAllToCart = () => {
    for (const p of productsToDisplay) {
      if (p.stock_quantity > 0) {
        addCartItem(p)
      }
    }
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved items?')) {
      for (const p of productsToDisplay) {
        removeItem(p.id)
      }
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-[60vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-48 bg-brand-light-gray/40 rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-brand-light-gray/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite/50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm font-[Inter,sans-serif] text-brand-gray mb-4">
          <Link href="/" className="hover:text-brand-emerald transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-charcoal font-medium">Saved Items</span>
        </nav>

        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-brand-light-gray">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-xs">
                <Heart size={22} className="fill-red-500" />
              </div>
              <div>
                <h1 className="font-[Outfit,sans-serif] font-black text-2xl sm:text-3xl text-brand-charcoal">
                  Saved Items
                </h1>
                <p className="text-xs sm:text-sm text-brand-gray font-[Inter,sans-serif]">
                  {productsToDisplay.length} {productsToDisplay.length === 1 ? 'item' : 'items'} saved for later
                </p>
              </div>
            </div>
          </div>

          {productsToDisplay.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Sort selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-brand-light-gray rounded-xl px-3 py-2 text-xs sm:text-sm font-[Inter,sans-serif] text-brand-charcoal outline-none shadow-xs"
              >
                <option value="newest">Recently Saved</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              {/* Add all to cart */}
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-emerald text-white hover:bg-brand-emerald-light transition-all text-xs sm:text-sm font-[Outfit,sans-serif] font-semibold shadow-emerald cursor-pointer"
              >
                <ShoppingCart size={15} />
                <span>Add All to Cart</span>
              </button>

              {/* Clear all */}
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-light-gray bg-white text-brand-gray hover:text-red-500 hover:border-red-200 transition-colors text-xs sm:text-sm font-[Inter,sans-serif] cursor-pointer"
                title="Clear all saved items"
              >
                <Trash2 size={15} />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-brand-light-gray shadow-xs max-w-lg mx-auto my-8">
            <div className="w-20 h-20 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Heart size={36} className="text-red-400 stroke-1" />
            </div>
            <h2 className="font-[Outfit,sans-serif] font-black text-xl sm:text-2xl text-brand-charcoal mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-brand-gray font-[Inter,sans-serif] text-sm sm:text-base leading-relaxed mb-6 max-w-xs mx-auto">
              Explore our collection of top-tier electronics and groceries. Tap the heart on any product to save it here!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-emerald text-white hover:bg-brand-emerald-light font-[Outfit,sans-serif] font-semibold text-sm sm:text-base shadow-emerald transition-all hover:-translate-y-0.5"
            >
              <ShoppingBag size={18} />
              <span>Start Exploring</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
