import { Package, Zap, ShoppingBag, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MOCK_PRODUCTS } from '@/lib/seed-data'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default async function AdminDashboardPage() {
  const supabase = await createAdminClient()
  
  // Fetch real data
  const { data: products } = await supabase.from('products').select('*')
  const { data: deals } = await supabase.from('products').select('id').eq('is_deal', true)
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })

  const totalProducts = products?.length || 0
  const totalDeals = deals?.length || 0
  const totalOrders = orders?.length || 0
  
  const revenue = orders
    ?.filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

  const lowStock = products?.filter(p => p.stock_quantity < 5 && p.stock_quantity > 0) || []
  const outOfStock = products?.filter(p => p.stock_quantity === 0) || []
  const recentOrders = orders?.slice(0, 5) || []

  const statCards = [
    { label: 'Total Revenue', value: formatNaira(revenue), icon: TrendingUp, color: 'bg-brand-emerald', href: '/admin/dashboard/orders' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, color: 'bg-blue-500', href: '/admin/dashboard/orders' },
    { label: 'Total Products', value: totalProducts.toString(), icon: Package, color: 'bg-purple-500', href: '/admin/dashboard/products' },
    { label: 'Out of Stock', value: outOfStock.length.toString(), icon: AlertTriangle, color: 'bg-red-500', href: '/admin/dashboard/products' },
  ]

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      <div>
        <h1 className="font-[Outfit,sans-serif] font-black text-xl sm:text-2xl text-brand-charcoal mb-1">Dashboard Overview</h1>
        <p className="text-brand-gray font-[Inter,sans-serif] text-xs sm:text-sm">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:-translate-y-0.5 transition-all duration-200 group">
            <div className={`${color} w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-brand-gray font-[Inter,sans-serif] text-[10px] sm:text-xs uppercase tracking-wide">{label}</p>
              <p className="font-[Outfit,sans-serif] font-black text-lg sm:text-2xl text-brand-charcoal">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-brand-light-gray">
            <h2 className="font-[Outfit,sans-serif] font-bold text-base sm:text-lg text-brand-charcoal">Recent Orders</h2>
            <Link href="/admin/dashboard/orders" className="btn-outline text-xs px-3 py-1.5 sm:px-4 sm:py-2">View All</Link>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between border-b border-brand-light-gray last:border-0 pb-4 last:pb-0">
                <div>
                  <p className="font-[Outfit,sans-serif] font-semibold text-sm text-brand-charcoal">#{order.id.slice(0,8)} - {order.recipient_name}</p>
                  <p className="text-xs text-brand-gray font-[Inter,sans-serif] flex items-center gap-1 mt-1">
                    <Clock size={12}/> {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-brand-charcoal">{formatNaira(order.total_amount)}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) : <p className="text-sm text-brand-gray">No orders yet.</p>}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-1 card overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-brand-light-gray">
            <h2 className="font-[Outfit,sans-serif] font-bold text-base sm:text-lg text-brand-charcoal">Inventory Alerts</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {outOfStock.length > 0 && outOfStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-red-500 font-medium">Out of Stock</p>
                </div>
              </div>
            ))}
            {lowStock.length > 0 && lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-yellow-600 font-medium">Only {p.stock_quantity} left</p>
                </div>
              </div>
            ))}
            {outOfStock.length === 0 && lowStock.length === 0 && (
              <p className="text-sm text-brand-gray">Inventory levels are healthy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
