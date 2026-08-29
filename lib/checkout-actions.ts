'use server'

import { createAdminClient } from './supabase/server'
import { createClient } from './supabase/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function placeOrder(orderData: any, items: any[], couponCode?: string) {
  const supabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  let discountAmount = 0
  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('active', true)
      .single()
    if (coupon) {
      if (coupon.type === 'percentage') discountAmount = (orderData.total_amount * coupon.value) / 100
      else discountAmount = coupon.value
      // Increment usage
      await supabase.from('coupons').update({ used_count: coupon.used_count + 1 }).eq('id', coupon.id)
    }
  }

  const finalTotal = Math.max(0, orderData.total_amount - discountAmount)
  const orderId = uuidv4()

  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    user_id: user?.id || null,
    status: 'pending',
    total_amount: finalTotal,
    shipping_fee: orderData.shipping_fee,
    payment_reference: null,
    shipping_address: orderData.delivery_method === 'pickup'
      ? 'Store Pickup'
      : `${orderData.address}, ${orderData.city}, ${orderData.state}`,
    recipient_name: orderData.name,
    recipient_phone: orderData.phone,
  })

  if (orderError) {
    console.error('Failed to create order:', orderError)
    return { success: false, error: 'Failed to create order' }
  }

  const orderItems = items.map((item) => ({
    id: uuidv4(),
    order_id: orderId,
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_purchase: item.product.discount_price ?? item.product.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    console.error('Failed to add order items:', itemsError)
    return { success: false, error: 'Failed to add order items' }
  }

  return { success: true, orderId, finalTotal }
}

export async function applyCoupon(code: string, subtotal: number): Promise<{
  valid: boolean
  discount: number
  message: string
}> {
  const supabase = await createClient()
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single()

  if (error || !coupon) return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { valid: false, discount: 0, message: 'This coupon has expired.' }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return { valid: false, discount: 0, message: 'This coupon has reached its usage limit.' }
  if (subtotal < coupon.min_order) return { valid: false, discount: 0, message: `Minimum order of ₦${coupon.min_order.toLocaleString()} required.` }

  const discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value
  return { valid: true, discount, message: `${coupon.type === 'percentage' ? coupon.value + '% off' : '₦' + coupon.value.toLocaleString() + ' off'} applied!` }
}
