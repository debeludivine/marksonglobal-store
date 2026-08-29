import { notFound } from 'next/navigation'
import ProductGrid from '@/components/ui/ProductGrid'
import { getCategoryBySlug, getProducts } from '@/lib/api'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
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

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) notFound()

  const products = await getProducts(category.id)

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
        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-brand-light-gray">
          <p className="text-sm text-brand-gray font-body">
            Showing <span className="font-semibold text-brand-charcoal">{products.length}</span> products
          </p>
          <select
            className="text-sm border border-brand-light-gray rounded-lg px-3 py-2 font-body bg-white text-brand-charcoal outline-none focus:border-brand-emerald transition-colors"
            aria-label="Sort products"
          >
            <option>Sort: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Deals First</option>
          </select>
        </div>

        <ProductGrid products={products} />
      </div>
    </div>
  )
}
