'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdaptiveImage } from './AdaptiveImage'
import { ShoppingCart, Star, Heart, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { type Product } from '@/lib/types'

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

export default function ProductCard({ product }: Props) {
  const [added, setAdded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id))
  const toggleItem = useWishlistStore((s) => s.toggleItem)
  const addItem = useCartStore((s) => s.addItem)

  const images = (product.images && product.images.length > 0) ? product.images : []
  const hasMultipleImages = images.length > 1

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(idx)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const distance = touchStartX - touchEndX
    const minSwipeDistance = 35
    if (distance > minSwipeDistance) {
      setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    } else if (distance < -minSwipeDistance) {
      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }
    setTouchStartX(null)
    setTouchEndX(null)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleItem(product)
  }

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null

  const isOutOfStock = product.stock_quantity === 0

  return (
    <Link
      href={`/product/${product.slug}`}
      id={`product-card-${product.id}`}
      className="card group flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300 bg-white border border-brand-light-gray rounded-2xl shadow-xs hover:shadow-card-hover"
    >
      {/* Swipeable Image Carousel Area */}
      <div 
        className="relative bg-brand-offwhite h-36 sm:h-48 overflow-hidden select-none"
        onTouchStart={hasMultipleImages ? handleTouchStart : undefined}
        onTouchMove={hasMultipleImages ? handleTouchMove : undefined}
        onTouchEnd={hasMultipleImages ? handleTouchEnd : undefined}
      >
        {images.length > 0 ? (
          <div 
            className="flex w-full h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.map((img, idx) => (
              <div key={idx} className="relative w-full h-full shrink-0 flex-none bg-brand-offwhite">
                <AdaptiveImage
                  src={img}
                  alt={`${product.name} - ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl select-none">
            {product.category_id === 'cat-electronics' ? '📦' : '🛒'}
          </div>
        )}

        {/* Carousel Navigation Arrows (Desktop hover) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md backdrop-blur-xs hover:scale-105"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md backdrop-blur-xs hover:scale-105"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Jiji-Style Image Counter Badge */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 right-2 bg-black/65 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 pointer-events-none shadow-sm">
            <Camera size={10} className="text-white/90" />
            <span>{currentImageIndex + 1}/{images.length}</span>
          </div>
        )}

        {/* Mini Pagination Dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-auto">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(e, idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex 
                    ? 'w-3.5 bg-white shadow-sm' 
                    : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
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
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-transform z-20 cursor-pointer"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            className={`transition-colors ${
              isWishlisted ? 'text-red-500 fill-red-500' : 'text-brand-gray hover:text-red-400'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-xs text-brand-gray font-[Inter,sans-serif] mb-1.5 uppercase tracking-wide font-medium">
          {product.categories?.name || 'Catalog'}
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

