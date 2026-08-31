import { notFound } from 'next/navigation'
import ProductGrid from '@/components/ui/ProductGrid'
import FilterSortBar from '@/components/ui/FilterSortBar'
import { getCategoryBySlug, getProductsWithFilter } from '@/lib/api'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }
  return {
    title: `${category.name} | MarksonGlobal Stores`,
    description: `Shop ${category.name} at MarksonGlobal Stores. Quality products at great prices.`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sParams = await searchParams
  
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const products = await getProductsWithFilter({
    categoryId: category.id,
    sort: typeof sParams.sort === 'string' ? sParams.sort : undefined,
    inStockOnly: sParams.inStock === 'true',
  })

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-brand-emerald to-brand-emerald-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-4xl mb-3">
            {slug === 'electronics' ? '📱' : '🛒'}
          </div>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-white mb-2">
            {category.name}
          </h1>
          <p className="text-white/70 font-body">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <FilterSortBar totalCount={products.length} />
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-20 text-brand-gray">
            No products match your current filters.
          </div>
        )}
      </div>
    </div>
  )
}
