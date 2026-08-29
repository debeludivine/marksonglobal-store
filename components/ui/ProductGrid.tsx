import ProductCard from './ProductCard'
import { type Product } from '@/lib/seed-data'

type Props = {
  products: Product[]
  emptyMessage?: string
}

export default function ProductGrid({ products, emptyMessage = 'No products found.' }: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📦</div>
        <p className="text-brand-gray font-[Inter,sans-serif]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
