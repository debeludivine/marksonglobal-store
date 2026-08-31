import { createClient } from '@/lib/supabase/server'
import { Product, Category } from './types'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) { console.error('Error fetching categories:', error); return [] }
  return data as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (error) return null
  return data as Category
}

export async function getCategoryDescendantIds(categoryId: string): Promise<string[]> {
  const categories = await getCategories()
  const result = new Set<string>([categoryId])
  let added = true
  while (added) {
    added = false
    for (const cat of categories) {
      if (cat.parent_id && result.has(cat.parent_id) && !result.has(cat.id)) {
        result.add(cat.id)
        added = true
      }
    }
  }
  return Array.from(result)
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false })
  if (categoryId) {
    const categoryIds = await getCategoryDescendantIds(categoryId)
    if (categoryIds.length === 1) {
      query = query.eq('category_id', categoryIds[0])
    } else {
      query = query.in('category_id', categoryIds)
    }
  }
  const { data, error } = await query
  if (error) { console.error('Error fetching products:', error); return [] }
  return data as Product[]
}

export async function getProductsWithFilter(options: {
  categoryId?: string
  sort?: string
  inStockOnly?: boolean
  minPrice?: number
  maxPrice?: number
}): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('*, categories(*)')
  if (options.categoryId) {
    const categoryIds = await getCategoryDescendantIds(options.categoryId)
    if (categoryIds.length === 1) {
      query = query.eq('category_id', categoryIds[0])
    } else {
      query = query.in('category_id', categoryIds)
    }
  }
  if (options.inStockOnly) query = query.gt('stock_quantity', 0)
  if (options.minPrice) query = query.gte('price', options.minPrice)
  if (options.maxPrice) query = query.lte('price', options.maxPrice)
  if (options.sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (options.sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })
  const { data, error } = await query
  if (error) { console.error('Error fetching filtered products:', error); return [] }
  return data as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*, categories(*)').eq('slug', slug).single()
  if (error) return null
  return data as Product
}

export async function getDeals(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*, categories(*)').eq('is_deal', true).order('created_at', { ascending: false })
  if (error) { console.error('Error fetching deals:', error); return [] }
  return data as Product[]
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = await createClient()
  const cleanQ = query.trim()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .or(`name.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%,sku.ilike.%${cleanQ}%`)
    .order('created_at', { ascending: false })
  if (error) { console.error('Error searching products:', error); return [] }
  return data as Product[]
}

export async function getProductReviews(productId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, user_id')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return data || []
}

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('wishlists').select('product_id').eq('user_id', userId)
  return data?.map((w: any) => w.product_id) || []
}

export async function getWishlistProducts(userId: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data: wishlistItems } = await supabase.from('wishlists').select('product_id').eq('user_id', userId)
  if (!wishlistItems || wishlistItems.length === 0) return []
  const ids = wishlistItems.map((w: any) => w.product_id)
  const { data } = await supabase.from('products').select('*').in('id', ids)
  return (data as Product[]) || []
}
