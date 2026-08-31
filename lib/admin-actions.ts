'use server'

import { createAdminClient } from './supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProduct(formData: FormData) {
  const supabase = await createAdminClient()
  
  let imageUrl = ''
  const image = formData.get('image') as File
  if (image && image.size > 0) {
    const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`
    const { data, error: uploadError } = await supabase.storage.from('product-images').upload(filename, image)
    if (!uploadError && data) {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
      imageUrl = publicUrl
    }
  }

  const name = formData.get('name') as string

  const { error } = await supabase.from('products').insert({
    name,
    description: formData.get('description') as string,
    price: parseFloat(formData.get('price') as string),
    discount_price: formData.get('discount_price') ? parseFloat(formData.get('discount_price') as string) : null,
    stock_quantity: parseInt(formData.get('stock_quantity') as string, 10),
    sku: formData.get('sku') as string,
    category_id: formData.get('category_id') as string,
    is_deal: formData.get('is_deal') === 'true',
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    images: imageUrl ? [imageUrl] : [],
    specifications: formData.get('specifications') ? JSON.parse(formData.get('specifications') as string) : null,
  })

  if (error) {
    console.error('Error adding product:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/dashboard/products')
  revalidatePath('/')
  return { success: true }
}

export async function updateProduct(id: string, formDataOrData: any) {
  const supabase = await createAdminClient()
  
  let updateData: any = {}
  
  // Handle case where it's called with object (from Deals page)
  if (!(formDataOrData instanceof FormData)) {
    updateData = formDataOrData
  } else {
    // Handle FormData
    let imageUrl = ''
    const image = formDataOrData.get('image') as File
    if (image && image.size > 0) {
      const filename = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`
      const { data, error: uploadError } = await supabase.storage.from('product-images').upload(filename, image)
      if (!uploadError && data) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
        imageUrl = publicUrl
      }
    }
    
    updateData = {
      name: formDataOrData.get('name') as string,
      description: formDataOrData.get('description') as string,
      price: parseFloat(formDataOrData.get('price') as string),
      discount_price: formDataOrData.get('discount_price') ? parseFloat(formDataOrData.get('discount_price') as string) : null,
      stock_quantity: parseInt(formDataOrData.get('stock_quantity') as string, 10),
      sku: formDataOrData.get('sku') as string,
      category_id: formDataOrData.get('category_id') as string,
      is_deal: formDataOrData.get('is_deal') === 'true',
      specifications: formDataOrData.get('specifications') ? JSON.parse(formDataOrData.get('specifications') as string) : null,
    }
    if (imageUrl) {
      updateData.images = [imageUrl]
    }
  }
  
  const { error } = await supabase.from('products').update(updateData).eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/dashboard/products')
  revalidatePath('/')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createAdminClient()
  
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/dashboard/products')
  revalidatePath('/')
  return { success: true }
}

export async function batchDeleteProducts(ids: string[]) {
  const supabase = await createAdminClient()
  
  const { error } = await supabase.from('products').delete().in('id', ids)

  if (error) {
    console.error('Error batch deleting products:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/dashboard/products')
  revalidatePath('/')
  return { success: true }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/dashboard/orders')
  revalidatePath('/profile')
  return { success: true }
}

export async function createCoupon(formData: FormData) {
  const supabase = await createAdminClient()
  const code = (formData.get('code') as string).toUpperCase().trim()
  const { error } = await supabase.from('coupons').insert({
    code,
    type: formData.get('type') as string,
    value: parseFloat(formData.get('value') as string),
    min_order: parseFloat((formData.get('min_order') as string) || '0'),
    max_uses: formData.get('max_uses') ? parseInt(formData.get('max_uses') as string, 10) : null,
    expires_at: formData.get('expires_at') || null,
    active: true,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/dashboard/coupons')
  return { success: true }
}

export async function deleteCoupon(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/dashboard/coupons')
  return { success: true }
}
