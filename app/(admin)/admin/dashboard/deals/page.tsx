import { getProducts, getCategories } from '@/lib/api'
import DealsClient from '@/components/admin/DealsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Deals | Admin Dashboard',
}

export default async function AdminDealsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  return <DealsClient initialProducts={products} categories={categories} />
}
