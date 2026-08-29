import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Package, Clock, User, LogOut } from 'lucide-react'
import type { Metadata } from 'next'
import { logout } from '@/lib/customer-auth-actions'

export const metadata: Metadata = {
  title: 'My Profile | MarksonGlobal Stores',
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch orders for this user
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const formattedOrders = orders?.map(order => ({
    id: order.id,
    total_amount: order.total_amount,
    status: order.status,
    created_at: new Date(order.created_at).toLocaleDateString(),
    items: order.order_items[0].count,
  })) || []

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl md:text-3xl text-brand-charcoal">
            My Profile
          </h1>
          <form action={logout}>
            <button className="btn-outline flex items-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="w-16 h-16 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center mb-4">
                <User size={32} />
              </div>
              <h2 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal line-clamp-1 mb-1">
                {user.user_metadata?.full_name || 'Customer'}
              </h2>
              <p className="text-brand-gray text-sm font-[Inter,sans-serif] mb-6 line-clamp-1">
                {user.email}
              </p>
              
              <div className="border-t border-brand-light-gray pt-6">
                <h3 className="text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal uppercase tracking-wide mb-4">
                  Account Summary
                </h3>
                <div className="space-y-3 text-sm font-[Inter,sans-serif]">
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Total Orders</span>
                    <span className="font-semibold text-brand-charcoal">{formattedOrders.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="font-[Outfit,sans-serif] font-bold text-xl text-brand-charcoal flex items-center gap-2">
              <Package size={20} className="text-brand-emerald" />
              Order History
            </h2>

            {formattedOrders.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-brand-offwhite border-b border-brand-light-gray">
                        {['Order ID', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                          <th key={h} className="text-left px-6 py-4 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-light-gray">
                      {formattedOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-brand-offwhite/50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4 font-[Outfit,sans-serif] font-semibold text-sm text-brand-charcoal group-hover:text-brand-emerald transition-colors">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-sm text-brand-gray font-[Inter,sans-serif] flex items-center gap-1.5">
                            <Clock size={13} />
                            {order.created_at}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Package size={48} className="text-brand-light-gray mx-auto mb-4" />
                <h3 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal mb-2">No orders yet</h3>
                <p className="text-brand-gray font-[Inter,sans-serif] mb-6">Looks like you haven&apos;t placed any orders with us yet.</p>
                <a href="/" className="btn-primary inline-flex">
                  Start Shopping
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
