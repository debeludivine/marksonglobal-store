'use client'

import { useState, useOptimistic, startTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlist } from '@/lib/customer-actions'

export default function WishlistButton({ productId }: { productId: string }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [optimisticWishlist, addOptimisticWishlist] = useOptimistic(
    wishlisted,
    (state, newState: boolean) => newState
  )

  const handleToggle = () => {
    startTransition(async () => {
      addOptimisticWishlist(!wishlisted)
      try {
        const result = await toggleWishlist(productId)
        setWishlisted(result.wishlisted)
      } catch (error) {
        console.error("Network error toggling wishlist", error)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-[Outfit,sans-serif] font-semibold transition-all duration-200 ${
        optimisticWishlist
          ? 'border-red-300 bg-red-50 text-red-500'
          : 'border-brand-light-gray hover:border-red-300 hover:bg-red-50 hover:text-red-500 text-brand-gray'
      }`}
      aria-label={optimisticWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart size={16} className={optimisticWishlist ? 'fill-red-500' : ''} />
      {optimisticWishlist ? 'Saved' : 'Save'}
    </button>
  )
}
