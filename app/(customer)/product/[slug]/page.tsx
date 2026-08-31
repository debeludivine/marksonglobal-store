import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AdaptiveImage } from '@/components/ui/AdaptiveImage'
import { CheckCircle } from 'lucide-react'
import { getProductBySlug, getCategories, getProducts, getProductReviews } from '@/lib/api'
import { cleanPlainText } from '@/lib/ai-catalog'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import AddToCartButton from '@/components/ui/AddToCartButton'
import ReviewSection from '@/components/ui/ReviewSection'
import WishlistButton from '@/components/ui/WishlistButton'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found' }
  return { title: product.name, description: cleanPlainText(product.description) }
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [categories, allProducts, reviews] = await Promise.all([
    getCategories(),
    getProducts(product.category_id),
    getProductReviews(product.id),
  ])

  const category = categories.find((c) => c.id === product.category_id)
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4)

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const imageUrl = product.images?.[0] || null

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-brand-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-body text-brand-gray">
            <Link href="/" className="hover:text-brand-emerald transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/category/${category?.slug}`} className="hover:text-brand-emerald transition-colors">{category?.name}</Link>
            <span>/</span>
            <span className="text-brand-charcoal truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Image */}
          <div className="relative bg-brand-offwhite rounded-2xl h-72 sm:h-96 lg:h-auto flex items-center justify-center shadow-card overflow-hidden">
            {imageUrl ? (
              <AdaptiveImage src={imageUrl} alt={product.name} fill className="object-contain p-4" priority={true} />
            ) : (
              <div className="text-[8rem] sm:text-[10rem] select-none">
                {product.category_id === 'cat-electronics' ? '📦' : '🛒'}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start gap-2 mb-4">
              <div className="flex flex-wrap items-center gap-2 flex-1">
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
              <WishlistButton productId={product.id} />
            </div>

            <h1 className="font-heading font-black text-xl sm:text-2xl md:text-3xl text-brand-charcoal mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Avg Rating display */}
            {avgRating && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-sm ${i <= Math.round(Number(avgRating)) ? 'text-brand-gold' : 'text-brand-light-gray'}`}>★</span>
                  ))}
                </div>
                <span className="text-sm text-brand-gray font-body">{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            <p className="text-brand-gray font-body leading-relaxed mb-5 text-sm sm:text-base whitespace-pre-line">
              {cleanPlainText(product.description)}
            </p>

            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-brand-light-gray">
              <span className="font-heading font-black text-2xl sm:text-3xl text-brand-emerald">
                {formatNaira(product.discount_price ?? product.price)}
              </span>
              {product.discount_price && (
                <span className="text-brand-gray line-through text-base sm:text-lg font-body">
                  {formatNaira(product.price)}
                </span>
              )}
            </div>

            <p className="text-xs text-brand-gray font-body mb-5">SKU: {product.sku}</p>
            <AddToCartButton product={product} />

            <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { icon: '🚚', text: 'Fast Nationwide Delivery' },
                { icon: '✅', text: '100% Authentic Products' },
                { icon: '↩️', text: '7-Day Easy Returns' },
                { icon: '🔒', text: 'Secure Checkout' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-brand-gray font-body">
                  <span>{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && (
          <div className="mt-10 sm:mt-14">
            <h2 className="section-title mb-4 sm:mb-6">Specifications</h2>
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {Object.entries(product.specifications).map(([key, value], i) => (
                <div key={key} className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 ${i % 2 === 0 ? 'bg-brand-offwhite' : 'bg-white'}`}>
                  <span className="w-32 sm:w-40 font-heading font-semibold text-sm text-brand-charcoal capitalize">{key}</span>
                  <span className="text-brand-gray font-body text-sm">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection productId={product.id} reviews={reviews} userId={user?.id} />

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10 sm:mt-14">
            <h2 className="section-title mb-4 sm:mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="card p-3 sm:p-4 hover:-translate-y-1 transition-all duration-300">
                  <div className="relative bg-brand-offwhite rounded-xl h-24 sm:h-28 flex items-center justify-center mb-2 sm:mb-3 overflow-hidden">
                    {p.images?.[0] ? (
                      <AdaptiveImage src={p.images[0]} alt={p.name} fill className="object-contain p-2" />
                    ) : (
                      <div className="text-4xl">{p.category_id === 'cat-electronics' ? '📦' : '🛒'}</div>
                    )}
                  </div>
                  <p className="font-heading font-semibold text-xs text-brand-charcoal line-clamp-2 mb-1.5">{p.name}</p>
                  <p className="price-tag text-sm">{formatNaira(p.discount_price ?? p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
