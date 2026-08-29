import { getProducts, getCategories } from '@/lib/api'
import ProductsClient from '@/components/admin/ProductsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products | Admin Dashboard',
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  return <ProductsClient initialProducts={products} categories={categories} />
}
