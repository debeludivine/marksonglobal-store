'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlist } from '@/lib/customer-actions'

export default function WishlistButton({ productId }: { productId: string }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const result = await toggleWishlist(productId)
    setWishlisted(result.wishlisted)
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-[Outfit,sans-serif] font-semibold transition-all duration-200 ${
        wishlisted
          ? 'border-red-300 bg-red-50 text-red-500'
          : 'border-brand-light-gray hover:border-red-300 hover:bg-red-50 hover:text-red-500 text-brand-gray'
      }`}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart size={16} className={wishlisted ? 'fill-red-500' : ''} />
      {wishlisted ? 'Saved' : 'Save'}
    </button>
  )
}
