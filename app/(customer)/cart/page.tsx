'use client'

import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, subtotal, totalItems } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-7xl mb-6">🛒</div>
        <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal mb-3">Your cart is empty</h1>
        <p className="text-brand-gray font-[Inter,sans-serif] mb-8 max-w-sm">
          Add some products to your cart and they&apos;ll appear here.
        </p>
        <Link href="/" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={18} />
          Continue Shopping
        </Link>
      </div>
    )
  }

  const SHIPPING_FEE = subtotal() >= 50000 ? 0 : 2500

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl md:text-3xl text-brand-charcoal">
            My Cart
            <span className="text-brand-gray font-normal text-lg ml-2">({totalItems()} items)</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-red-500 text-sm font-[Outfit,sans-serif] font-semibold hover:text-red-600 flex items-center gap-1.5 transition-colors"
            id="clear-cart-button"
          >
            <Trash2 size={15} />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const price = product.discount_price ?? product.price
              return (
                <div
                  key={product.id}
                  className="card p-5 flex items-start gap-4 animate-fade-in"
                >
                  {/* Product image placeholder */}
                  <div className="bg-brand-offwhite rounded-xl w-20 h-20 flex items-center justify-center text-3xl flex-shrink-0">
                    {product.category_id === 'cat-electronics' ? '📦' : '🛒'}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-brand-gray font-[Inter,sans-serif] uppercase tracking-wide mb-1">
                      {product.category_id === 'cat-electronics' ? 'Electronics' : 'Groceries'}
                    </p>
                    <h3 className="font-[Outfit,sans-serif] font-semibold text-brand-charcoal text-sm leading-snug mb-3 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="price-tag">{formatNaira(price)}</span>
                      {product.discount_price && (
                        <span className="price-original">{formatNaira(product.price)}</span>
                      )}
                    </div>
                  </div>

                  {/* Qty + Remove */}
                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-red-400 hover:text-red-500 transition-colors"
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center border border-brand-light-gray rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-brand-offwhite transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 h-8 flex items-center justify-center text-sm font-[Outfit,sans-serif] font-bold border-x border-brand-light-gray">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQty(product.id, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-brand-offwhite transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-brand-gray font-[Inter,sans-serif]">
                      = {formatNaira(price * quantity)}
                    </p>
                  </div>
                </div>
              )
            })}

            <Link
              href="/"
              className="flex items-center gap-2 text-brand-emerald font-[Outfit,sans-serif] font-semibold text-sm hover:gap-3 transition-all pt-2"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-28">
              <h2 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm font-[Inter,sans-serif]">
                  <span className="text-brand-gray">Subtotal ({totalItems()} items)</span>
                  <span className="font-semibold text-brand-charcoal">{formatNaira(subtotal())}</span>
                </div>
                <div className="flex justify-between text-sm font-[Inter,sans-serif]">
                  <span className="text-brand-gray">Shipping</span>
                  <span className={`font-semibold ${SHIPPING_FEE === 0 ? 'text-green-600' : 'text-brand-charcoal'}`}>
                    {SHIPPING_FEE === 0 ? 'FREE' : formatNaira(SHIPPING_FEE)}
                  </span>
                </div>
                {SHIPPING_FEE > 0 && (
                  <p className="text-xs text-brand-gray font-[Inter,sans-serif]">
                    Add {formatNaira(50000 - subtotal())} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-brand-light-gray pt-4 mb-6">
                <div className="flex justify-between font-[Outfit,sans-serif] font-bold text-lg">
                  <span>Total</span>
                  <span className="text-brand-emerald">{formatNaira(subtotal() + SHIPPING_FEE)}</span>
                </div>
              </div>

              <button
                id="proceed-to-checkout"
                className="w-full btn-primary flex items-center justify-center gap-2 text-base"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>
              <p className="text-center text-xs text-brand-gray font-[Inter,sans-serif] mt-3">
                🔒 Secure & encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
