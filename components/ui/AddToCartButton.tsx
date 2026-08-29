'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { type Product } from '@/lib/seed-data'

type Props = { product: Product }

export default function AddToCartButton({ product }: Props) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const isOutOfStock = product.stock_quantity === 0

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Qty selector */}
      <div className="flex items-center border-2 border-brand-light-gray rounded-xl overflow-hidden">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="w-10 h-12 flex items-center justify-center text-brand-charcoal hover:bg-brand-offwhite transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="w-12 h-12 flex items-center justify-center font-[Outfit,sans-serif] font-bold text-brand-charcoal border-x-2 border-brand-light-gray">
          {qty}
        </span>
        <button
          onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
          className="w-10 h-12 flex items-center justify-center text-brand-charcoal hover:bg-brand-offwhite transition-colors"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={isOutOfStock}
        id="product-add-to-cart"
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-[Outfit,sans-serif] font-bold text-base transition-all duration-200 ${
          isOutOfStock
            ? 'bg-brand-light-gray text-brand-gray cursor-not-allowed'
            : added
            ? 'bg-green-500 text-white scale-98'
            : 'btn-primary text-base'
        }`}
      >
        <ShoppingCart size={18} />
        {isOutOfStock ? 'Out of Stock' : added ? `✓ Added ${qty} to Cart!` : 'Add to Cart'}
      </button>
    </div>
  )
}
