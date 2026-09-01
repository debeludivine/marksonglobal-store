import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getWishlistProducts } from '@/lib/api'
import SavedItemsClient from '@/components/saved/SavedItemsClient'

export const metadata: Metadata = {
  title: 'Saved Items | MarksonGlobal Stores',
  description: 'View and manage your saved products and wishlist at MarksonGlobal Stores.',
}

export default async function SavedItemsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let initialProducts: any[] = []
  if (user) {
    initialProducts = await getWishlistProducts(user.id)
  }

  return <SavedItemsClient initialProducts={initialProducts} />
}
