export type Category = {
  id: string
  name: string
  slug: string
  icon_url: string | null
  parent_id?: string | null
  created_at?: string
}

export type Product = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: number
  discount_price: number | null
  is_deal: boolean
  stock_quantity: number
  sku: string
  images: string[]
  specifications: Record<string, string> | null
  created_at?: string
  categories?: Category | null
}

export type Order = {
  id: string
  user_id: string | null
  status: string
  total_amount: number
  shipping_fee: number
  payment_reference: string | null
  shipping_address: string
  recipient_name: string
  recipient_phone: string
  created_at?: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
}
