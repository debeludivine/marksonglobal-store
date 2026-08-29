import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Package, CheckCircle } from 'lucide-react'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/seed-data'
import type { Metadata } from 'next'
import AddToCartButton from '@/components/ui/AddToCartButton'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description,
  }
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug)
  if (!product) notFound()

  const category = MOCK_CATEGORIES.find((c) => c.id === product.category_id)
  const related = MOCK_PRODUCTS.filter(
    (p) => p.category_id === product.category_id && p.id !== product.id
  ).slice(0, 4)

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-brand-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm font-body text-brand-gray">
            <Link href="/" className="hover:text-brand-emerald transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/category/${category?.slug}`} className="hover:text-brand-emerald transition-colors">
              {category?.name}
            </Link>
            <span>/</span>
            <span className="text-brand-charcoal truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-brand-offwhite rounded-2xl h-96 lg:h-auto flex items-center justify-center text-[10rem] shadow-card">
            {product.category_id === 'cat-electronics' ? '📦' : '🛒'}
          </div>

          {/* Details */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              {product.is_deal && <span className="deal-badge">🔥 Hot Deal</span>}
              {discountPercent && <span className="discount-badge">-{discountPercent}% OFF</span>}
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle size={12} /> In Stock ({product.stock_quantity} left)
                </span>
              ) : (
                <span className="text-red-500 text-xs font-semibold">Out of Stock</span>
              )}
            </div>

            <h1 className="font-heading font-black text-2xl md:text-3xl text-brand-charcoal mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-brand-gray font-body leading-relaxed mb-6">{product.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-brand-light-gray">
              <span className="font-heading font-black text-3xl text-brand-emerald">
                {formatNaira(product.discount_price ?? product.price)}
              </span>
              {product.discount_price && (
                <span className="text-brand-gray line-through text-lg font-body">
                  {formatNaira(product.price)}
                </span>
              )}
            </div>

            {/* SKU */}
            <p className="text-xs text-brand-gray font-body mb-6">SKU: {product.sku}</p>

            {/* Add to Cart */}
            <AddToCartButton product={product} />

            {/* Trust Points */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: '🚚', text: 'Fast Nationwide Delivery' },
                { icon: '✅', text: '100% Authentic Products' },
                { icon: '↩️', text: '7-Day Easy Returns' },
                { icon: '🔒', text: 'Secure Checkout' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-brand-gray font-body">
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && (
          <div className="mt-14">
            <h2 className="section-title mb-6">Specifications</h2>
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {Object.entries(product.specifications).map(([key, value], i) => (
                <div
                  key={key}
                  className={`flex items-center px-6 py-4 ${
                    i % 2 === 0 ? 'bg-brand-offwhite' : 'bg-white'
                  }`}
                >
                  <span className="w-40 font-heading font-semibold text-sm text-brand-charcoal capitalize">
                    {key}
                  </span>
                  <span className="text-brand-gray font-body text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="section-title mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="card p-4 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="bg-brand-offwhite rounded-xl h-28 flex items-center justify-center text-4xl mb-3">
                    {p.category_id === 'cat-electronics' ? '📦' : '🛒'}
                  </div>
                  <p className="font-heading font-semibold text-xs text-brand-charcoal line-clamp-2 mb-2">
                    {p.name}
                  </p>
                  <p className="price-tag text-sm">
                    {formatNaira(p.discount_price ?? p.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
