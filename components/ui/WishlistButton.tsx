'use client'

import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { type Product } from '@/lib/types'

export default function WishlistButton({ product, productId }: { product?: Product; productId?: string }) {
  const pId = product?.id || productId || ''
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(pId))
  const toggleItem = useWishlistStore((s) => s.toggleItem)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product) {
      await toggleItem(product)
    } else if (productId) {
      await toggleItem({ id: productId } as Product)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-[Outfit,sans-serif] font-semibold transition-all duration-200 cursor-pointer ${
        isWishlisted
          ? 'border-red-300 bg-red-50 text-red-500 shadow-xs'
          : 'border-brand-light-gray hover:border-red-300 hover:bg-red-50 hover:text-red-500 text-brand-gray'
      }`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
      {isWishlisted ? 'Saved' : 'Save to wishlist'}
    </button>
  )
}
