import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Product } from '@/lib/types'
import { toggleWishlist as toggleWishlistAction } from '@/lib/customer-actions'

type WishlistStore = {
  items: Product[]
  itemIds: string[]
  isWishlisted: (productId: string) => boolean
  toggleItem: (product: Product) => Promise<boolean>
  removeItem: (productId: string) => void
  totalCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemIds: [],

      isWishlisted: (productId: string) => {
        return get().itemIds.includes(productId)
      },

      toggleItem: async (product: Product) => {
        const isCurrent = get().itemIds.includes(product.id)
        if (isCurrent) {
          // Remove from wishlist
          set({
            itemIds: get().itemIds.filter((id) => id !== product.id),
            items: get().items.filter((item) => item.id !== product.id),
          })
          try {
            await toggleWishlistAction(product.id)
          } catch (e) {
            // Ignore server sync failure for guests
          }
          return false
        } else {
          // Add to wishlist
          set({
            itemIds: [...get().itemIds, product.id],
            items: [...get().items, product],
          })
          try {
            await toggleWishlistAction(product.id)
          } catch (e) {
            // Ignore server sync failure for guests
          }
          return true
        }
      },

      removeItem: (productId: string) => {
        set({
          itemIds: get().itemIds.filter((id) => id !== productId),
          items: get().items.filter((item) => item.id !== productId),
        })
      },

      totalCount: () => get().items.length,
    }),
    {
      name: 'markson_wishlist_storage',
    }
  )
)
