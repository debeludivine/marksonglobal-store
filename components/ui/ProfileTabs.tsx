'use client'

import { useState, useEffect } from 'react'
import { Package, Heart, Clock, Truck } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { useWishlistStore } from '@/store/wishlistStore'
import { type Product } from '@/lib/types'

type Order = {
  id: string
  total_amount: number
  status: string
  created_at: string
  items: number
  shipping_address: string
  recipient_name: string
}

type Props = {
  orders: Order[]
  wishlistProducts: Product[]
  formatNaira: (amount: number) => string
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function ProfileTabs({ orders, wishlistProducts, formatNaira }: Props) {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist'>('orders')
  const [mounted, setMounted] = useState(false)
  const storeItems = useWishlistStore((s) => s.items)

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayWishlist = mounted && storeItems.length > 0 ? storeItems : wishlistProducts

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-brand-light-gray mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-3 font-[Outfit,sans-serif] font-semibold text-sm transition-colors relative ${
            activeTab === 'orders' ? 'text-brand-emerald' : 'text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          <Package size={18} />
          Orders ({orders.length})
          {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-emerald" />}
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 pb-3 font-[Outfit,sans-serif] font-semibold text-sm transition-colors relative ${
            activeTab === 'wishlist' ? 'text-brand-emerald' : 'text-brand-gray hover:text-brand-charcoal'
          }`}
        >
          <Heart size={18} />
          Wishlist ({displayWishlist.length})
          {activeTab === 'wishlist' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-emerald" />}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="card p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-brand-light-gray">
                    <div>
                      <p className="text-xs text-brand-gray font-mono">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-brand-gray flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {order.created_at}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                      <span className="font-[Outfit,sans-serif] font-bold text-brand-charcoal text-base">
                        {formatNaira(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-brand-gray gap-2">
                    <p>{order.items} item{order.items !== 1 ? 's' : ''}</p>
                    <div className="text-xs text-brand-gray flex items-center gap-1.5">
                      <Truck size={13} className="text-brand-emerald" />
                      <span>{order.recipient_name}</span>
                      <span>•</span>
                      <span className="text-xs truncate max-w-[200px]">{order.shipping_address}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card p-12 text-center border-dashed">
                <Package size={48} className="text-brand-light-gray mx-auto mb-4" />
                <h3 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal mb-2">No orders yet</h3>
                <p className="text-brand-gray font-[Inter,sans-serif] text-sm mb-6">Looks like you haven&apos;t placed any orders with us yet.</p>
                <a href="/" className="btn-primary inline-flex text-sm">Start Shopping</a>
              </div>
            )}
          </div>
        ) : (
          <div>
            {displayWishlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {displayWishlist.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center border-dashed">
                <Heart size={48} className="text-brand-light-gray mx-auto mb-4" />
                <h3 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal mb-2">Your wishlist is empty</h3>
                <p className="text-brand-gray font-[Inter,sans-serif] text-sm mb-6">Save items you like and they will show up here.</p>
                <a href="/" className="btn-primary inline-flex text-sm">Explore Products</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
