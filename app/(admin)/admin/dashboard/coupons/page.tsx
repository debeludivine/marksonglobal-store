import { Tag, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { deleteCoupon } from '@/lib/admin-actions'

export const metadata: Metadata = { title: 'Coupons | Admin' }

export default async function AdminCouponsPage() {
  const supabase = await createClient()
  
  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-emerald/10 rounded-xl flex items-center justify-center">
            <Tag size={20} className="text-brand-emerald" />
          </div>
          <div>
            <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal">Coupons</h1>
            <p className="text-brand-gray font-[Inter,sans-serif] text-sm">Manage discount codes.</p>
          </div>
        </div>
        <a href="#new-coupon" className="btn-primary flex items-center gap-2 py-2">
          <Plus size={16} /> Create Coupon
        </a>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Coupons table">
            <thead>
              <tr className="bg-brand-offwhite">
                {['Code', 'Discount', 'Usage', 'Min Order', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-gray">
              {coupons?.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-brand-offwhite/50 transition-colors">
                  <td className="px-6 py-4 font-[Outfit,sans-serif] font-black text-sm text-brand-charcoal tracking-widest">
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4 font-[Inter,sans-serif] text-sm text-brand-emerald font-semibold">
                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₦${coupon.value.toLocaleString()} OFF`}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-gray font-[Inter,sans-serif]">
                    {coupon.used_count} / {coupon.max_uses || '∞'}
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-gray font-[Inter,sans-serif]">
                    {coupon.min_order > 0 ? `₦${coupon.min_order.toLocaleString()}` : 'None'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <form action={async () => {
                      'use server'
                      await deleteCoupon(coupon.id)
                    }}>
                      <button type="submit" className="text-xs text-red-500 hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!coupons || coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-gray font-[Inter,sans-serif]">
                    No coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div id="new-coupon" className="card p-6 mt-8 max-w-xl">
        <h2 className="font-[Outfit,sans-serif] font-bold text-xl text-brand-charcoal mb-4">Create New Coupon</h2>
        <form action={async (formData: FormData) => {
          'use server'
          const { createCoupon } = await import('@/lib/admin-actions')
          await createCoupon(formData)
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1">Coupon Code (e.g. SUMMER20)</label>
              <input required name="code" type="text" className="w-full border rounded-lg px-3 py-2 text-sm uppercase" />
            </div>
            <div>
              <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1">Discount Type</label>
              <select required name="type" className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1">Value</label>
              <input required name="value" type="number" min="1" step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1">Minimum Order (₦)</label>
              <input name="min_order" type="number" min="0" defaultValue="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1">Usage Limit (Optional)</label>
              <input name="max_uses" type="number" min="1" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Leave empty for unlimited" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-2.5">Save Coupon</button>
        </form>
      </div>
    </div>
  )
}
