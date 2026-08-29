'use server'

import { createAdminClient } from './supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function placeOrder(orderData: any, items: any[]) {
  const supabase = await createAdminClient()
  
  // Try to get user
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Insert Order
  const orderId = uuidv4()
  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    user_id: user?.id || null, // Associate if logged in
    status: 'pending',
    total_amount: orderData.total_amount,
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

  // 2. Insert Order Items
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

  return { success: true, orderId }
}
