import { ShoppingBag, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import OrderStatusDropdown from '@/components/admin/OrderStatusDropdown'

export const metadata: Metadata = { title: 'Orders | Admin' }

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  
  // Fetch orders and their items count
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
  }

  const formattedOrders = orders?.map(order => ({
    id: order.id,
    recipient_name: order.recipient_name || 'Guest',
    total_amount: order.total_amount,
    status: order.status,
    created_at: new Date(order.created_at).toLocaleDateString(),
    items: order.order_items[0].count,
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
          <ShoppingBag size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal">Orders</h1>
          <p className="text-brand-gray font-[Inter,sans-serif] text-sm">{formattedOrders.length} total orders</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Orders table">
            <thead>
              <tr className="bg-brand-offwhite">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-gray">
              {formattedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-offwhite/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-[Outfit,sans-serif] font-semibold text-sm text-brand-emerald">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 font-[Inter,sans-serif] text-sm text-brand-charcoal font-medium">
                    {order.recipient_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-gray font-[Inter,sans-serif]">
                    {order.items} item{order.items !== 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 font-[Outfit,sans-serif] font-semibold text-sm text-brand-charcoal">
                    {formatNaira(order.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusDropdown orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-gray font-[Inter,sans-serif] flex items-center gap-1.5">
                    <Clock size={13} />
                    {order.created_at}
                  </td>
                </tr>
              ))}
              {formattedOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-gray font-[Inter,sans-serif]">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
