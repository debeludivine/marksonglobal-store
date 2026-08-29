'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Eye, Star } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { type Product } from '@/lib/seed-data'

type Props = {
  product: Product
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function ProductCard({ product }: Props) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null

  const isOutOfStock = product.stock_quantity === 0

  return (
    <Link
      href={`/product/${product.slug}`}
      id={`product-card-${product.id}`}
      className="card group flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Area */}
      <div className="relative bg-brand-offwhite h-36 sm:h-48 flex items-center justify-center overflow-hidden">
        {/* Placeholder visual */}
        <div className="text-5xl sm:text-6xl select-none">
          {product.category_id === 'cat-electronics' ? '📦' : '🛒'}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_deal && (
            <span className="deal-badge">🔥 Deal</span>
          )}
          {discountPercent && (
            <span className="discount-badge">-{discountPercent}%</span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-brand-emerald/0 group-hover:bg-brand-emerald/5 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal shadow-card">
            <Eye size={14} />
            Quick View
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Category */}
        <p className="text-xs text-brand-gray font-[Inter,sans-serif] mb-1.5 uppercase tracking-wide">
          {product.category_id === 'cat-electronics' ? 'Electronics' : 'Groceries'}
        </p>

        {/* Name */}
        <h3 className="font-[Outfit,sans-serif] font-semibold text-brand-charcoal text-xs sm:text-sm leading-snug line-clamp-2 mb-2 sm:mb-3 flex-1">
          {product.name}
        </h3>

        {/* Rating (static for now) */}
        <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={11}
              className={i <= 4 ? 'text-brand-gold fill-brand-gold' : 'text-brand-light-gray fill-brand-light-gray'}
            />
          ))}
          <span className="text-xs text-brand-gray ml-1">(4.0)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <span className="price-tag text-base sm:text-lg">
            {formatNaira(product.discount_price ?? product.price)}
          </span>
          {product.discount_price && (
            <span className="price-original">
              {formatNaira(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          id={`add-to-cart-${product.id}`}
          className={`w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-[Outfit,sans-serif] font-semibold transition-all duration-200 ${
            isOutOfStock
              ? 'bg-brand-light-gray text-brand-gray cursor-not-allowed'
              : added
              ? 'bg-green-500 text-white scale-95'
              : 'bg-brand-emerald text-white hover:bg-brand-emerald-light active:scale-95 shadow-emerald hover:shadow-lg'
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart size={15} />
          {isOutOfStock ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  )
}
