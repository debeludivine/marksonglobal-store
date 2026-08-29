import { Package, Zap, ShoppingBag, AlertTriangle } from 'lucide-react'
import { MOCK_PRODUCTS, MOCK_DEALS } from '@/lib/seed-data'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

const outOfStock = MOCK_PRODUCTS.filter((p) => p.stock_quantity === 0)

const statCards = [
  {
    label: 'Total Products',
    value: MOCK_PRODUCTS.length.toString(),
    icon: Package,
    color: 'bg-brand-emerald',
    href: '/admin/dashboard/products',
  },
  {
    label: 'Active Deals',
    value: MOCK_DEALS.length.toString(),
    icon: Zap,
    color: 'bg-brand-gold',
    href: '/admin/dashboard/deals',
  },
  {
    label: 'Total Orders',
    value: '0',
    icon: ShoppingBag,
    color: 'bg-blue-500',
    href: '/admin/dashboard/orders',
  },
  {
    label: 'Out of Stock',
    value: outOfStock.length.toString(),
    icon: AlertTriangle,
    color: 'bg-red-500',
    href: '/admin/dashboard/products',
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal mb-1">Dashboard Overview</h1>
        <p className="text-brand-gray font-[Inter,sans-serif] text-sm">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="card p-6 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-brand-gray font-[Inter,sans-serif] text-xs uppercase tracking-wide">{label}</p>
              <p className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-light-gray">
          <h2 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal">All Products</h2>
          <Link
            href="/admin/dashboard/products"
            className="btn-primary text-xs px-4 py-2"
          >
            Manage Products
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Products table">
            <thead>
              <tr className="bg-brand-offwhite">
                <th className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">Product</th>
                <th className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">Category</th>
                <th className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">Price</th>
                <th className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">Deal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-gray">
              {MOCK_PRODUCTS.map((p) => (
                <tr key={p.id} className="hover:bg-brand-offwhite/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-[Inter,sans-serif] text-sm font-medium text-brand-charcoal line-clamp-1">{p.name}</p>
                    <p className="text-xs text-brand-gray font-[Inter,sans-serif]">{p.sku}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-[Inter,sans-serif] text-brand-gray">
                      {p.category_id === 'cat-electronics' ? 'Electronics' : 'Groceries'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-[Outfit,sans-serif] font-semibold text-sm text-brand-emerald">{formatNaira(p.discount_price ?? p.price)}</p>
                    {p.discount_price && (
                      <p className="text-xs text-brand-gray line-through">{formatNaira(p.price)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      p.stock_quantity === 0
                        ? 'bg-red-100 text-red-600'
                        : p.stock_quantity < 20
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.is_deal ? (
                      <span className="deal-badge">🔥 Deal</span>
                    ) : (
                      <span className="text-xs text-brand-gray">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
