'use client'

import { useState, useOptimistic, startTransition } from 'react'
import Link from 'next/link'
import { AdaptiveImage } from './AdaptiveImage'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { toggleWishlist } from '@/lib/customer-actions'
import { type Product } from '@/lib/seed-data'

type Props = {
  product: Product
  isWishlisted?: boolean
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function ProductCard({ product, isWishlisted = false }: Props) {
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(isWishlisted)
  const [optimisticWishlist, addOptimisticWishlist] = useOptimistic(
    wishlisted,
    (state, newState: boolean) => newState
  )
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Instantly update the UI before server responds
    startTransition(async () => {
      addOptimisticWishlist(!wishlisted)
      try {
        const result = await toggleWishlist(product.id)
        setWishlisted(result.wishlisted)
      } catch (error) {
        // Rollback state gracefully if network fails
        console.error("Network error toggling wishlist", error)
      }
    })
  }

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null

  const isOutOfStock = product.stock_quantity === 0
  const imageUrl = product.images?.[0] || null

  return (
    <Link
      href={`/product/${product.slug}`}
      id={`product-card-${product.id}`}
      className="card group flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Area */}
      <div className="relative bg-brand-offwhite h-36 sm:h-48 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <AdaptiveImage
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="text-5xl sm:text-6xl select-none">
            {product.category_id === 'cat-electronics' ? '📦' : '🛒'}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_deal && <span className="deal-badge">🔥 Deal</span>}
          {discountPercent && <span className="discount-badge">-{discountPercent}%</span>}
          {isOutOfStock && (
            <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          aria-label={optimisticWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={15}
            className={optimisticWishlist ? 'text-red-500 fill-red-500' : 'text-brand-gray'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-xs text-brand-gray font-[Inter,sans-serif] mb-1.5 uppercase tracking-wide">
          {product.category_id === 'cat-electronics' ? 'Electronics' : 'Groceries'}
        </p>

        <h3 className="font-[Outfit,sans-serif] font-semibold text-brand-charcoal text-xs sm:text-sm leading-snug line-clamp-2 mb-2 sm:mb-3 flex-1">
          {product.name}
        </h3>

        {/* Rating */}
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
            <span className="price-original">{formatNaira(product.price)}</span>
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
