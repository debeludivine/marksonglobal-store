'use server'

import { createClient } from './supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(productId: string): Promise<{ wishlisted: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { wishlisted: false }

  // Check if already wishlisted
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase.from('wishlists').delete().eq('id', existing.id)
    revalidatePath('/profile')
    return { wishlisted: false }
  } else {
    await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId })
    revalidatePath('/profile')
    return { wishlisted: true }
  }
}

export async function submitReview(productId: string, rating: number, comment: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not logged in' }

  const { error } = await supabase.from('reviews').upsert({
    user_id: user.id,
    product_id: productId,
    rating,
    comment,
  }, { onConflict: 'user_id,product_id' })

  if (error) return { success: false, error: error.message }
  revalidatePath(`/product`)
  return { success: true }
}
