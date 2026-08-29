import { createClient } from '@/lib/supabase/server'
import { Product, Category } from './types'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  return data as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single()
  if (error) {
    return null
  }
  return data as Category
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })
  
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }
  
  const { data, error } = await query
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single()
  if (error) {
    return null
  }
  return data as Product
}

export async function getDeals(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').eq('is_deal', true).order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching deals:', error)
    return []
  }
  return data as Product[]
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').ilike('name', `%${query}%`).order('created_at', { ascending: false })
  if (error) {
    console.error('Error searching products:', error)
    return []
  }
  return data as Product[]
}
