import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/customer-auth-actions'
import { getWishlistProducts } from '@/lib/api'
import type { Metadata } from 'next'
import ProfileTabs from '@/components/ui/ProfileTabs'

export const metadata: Metadata = {
  title: 'My Profile | MarksonGlobal Stores',
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const wishlistProducts = await getWishlistProducts(user.id)

  const formattedOrders = orders?.map(order => ({
    id: order.id,
    total_amount: order.total_amount,
    status: order.status,
    created_at: new Date(order.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }),
    items: order.order_items[0]?.count ?? 0,
    shipping_address: order.shipping_address,
    recipient_name: order.recipient_name,
  })) || []

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="font-[Outfit,sans-serif] font-black text-xl sm:text-3xl text-brand-charcoal">My Profile</h1>
          <form action={logout}>
            <button className="btn-outline flex items-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
              Sign Out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* User Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 sm:p-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-emerald/10 text-brand-emerald rounded-full flex items-center justify-center mb-4 text-2xl font-[Outfit,sans-serif] font-black">
                {(user.user_metadata?.full_name || user.email || 'C')[0].toUpperCase()}
              </div>
              <h2 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal line-clamp-1 mb-1">
                {user.user_metadata?.full_name || 'Customer'}
              </h2>
              <p className="text-brand-gray text-sm font-[Inter,sans-serif] mb-5 truncate">{user.email}</p>
              <div className="border-t border-brand-light-gray pt-4 space-y-2 text-sm font-[Inter,sans-serif]">
                <div className="flex justify-between">
                  <span className="text-brand-gray">Total Orders</span>
                  <span className="font-semibold text-brand-charcoal">{formattedOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Wishlist Items</span>
                  <span className="font-semibold text-brand-charcoal">{wishlistProducts.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="lg:col-span-3">
            <ProfileTabs orders={formattedOrders} wishlistProducts={wishlistProducts} formatNaira={formatNaira} />
          </div>
        </div>
      </div>
    </div>
  )
}
