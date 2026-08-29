import { ShoppingBag, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Orders | Admin' }

// MOCK ORDERS — Replace with Supabase query: supabase.from('orders').select('*').order('created_at', { ascending: false })
const MOCK_ORDERS = [
  { id: 'ORD-001', recipient_name: 'Amaka Johnson', total_amount: 45500, status: 'delivered', created_at: '2026-08-25', items: 3 },
  { id: 'ORD-002', recipient_name: 'Tunde Okafor', total_amount: 18000, status: 'shipped', created_at: '2026-08-27', items: 1 },
  { id: 'ORD-003', recipient_name: 'Ngozi Chukwu', total_amount: 72000, status: 'processing', created_at: '2026-08-28', items: 5 },
  { id: 'ORD-004', recipient_name: 'Emeka Nwosu', total_amount: 3500, status: 'pending', created_at: '2026-08-29', items: 1 },
  { id: 'ORD-005', recipient_name: 'Fatima Abubakar', total_amount: 155000, status: 'paid', created_at: '2026-08-29', items: 2 },
]

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

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
          <ShoppingBag size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal">Orders</h1>
          <p className="text-brand-gray font-[Inter,sans-serif] text-sm">{MOCK_ORDERS.length} total orders</p>
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
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-brand-offwhite/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-[Outfit,sans-serif] font-semibold text-sm text-brand-emerald">
                    #{order.id}
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
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-gray font-[Inter,sans-serif] flex items-center gap-1.5">
                    <Clock size={13} />
                    {order.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-brand-gray font-[Inter,sans-serif]">
        💡 Real-time orders will appear here once connected to Supabase and a payment provider.
      </p>
    </div>
  )
}
