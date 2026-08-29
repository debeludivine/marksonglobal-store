'use client'

import { useState } from 'react'
import { Star, Send } from 'lucide-react'
import { submitReview } from '@/lib/customer-actions'

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user_id: string
}

type Props = {
  productId: string
  reviews: Review[]
  userId?: string
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span className={i <= (hovered || value) ? 'text-brand-gold' : 'text-brand-light-gray'}>★</span>
        </button>
      ))}
    </div>
  )
}

export default function ReviewSection({ productId, reviews: initialReviews, userId }: Props) {
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setMessage('Please select a star rating.'); return }
    setSubmitting(true)
    const result = await submitReview(productId, rating, comment)
    if (result.success) {
      setMessage('✅ Review submitted! Thank you.')
      setReviews([{ id: Date.now().toString(), rating, comment, created_at: new Date().toISOString(), user_id: userId! }, ...reviews])
      setRating(0)
      setComment('')
    } else {
      setMessage(result.error || 'Something went wrong.')
    }
    setSubmitting(false)
  }

  return (
    <div className="mt-10 sm:mt-14">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="section-title">Customer Reviews</h2>
        {avgRating > 0 && (
          <div className="flex items-center gap-2 bg-brand-gold/10 px-3 py-1 rounded-full">
            <span className="text-brand-gold font-[Outfit,sans-serif] font-black text-lg">{avgRating.toFixed(1)}</span>
            <span className="text-brand-gold text-sm">★</span>
            <span className="text-brand-gray text-xs font-[Inter,sans-serif]">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      {userId ? (
        <div className="card p-5 sm:p-6 mb-6">
          <h3 className="font-[Outfit,sans-serif] font-bold text-base text-brand-charcoal mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <StarRating value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={3}
              className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald resize-none"
            />
            {message && <p className="text-sm font-[Inter,sans-serif] text-brand-emerald">{message}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              <Send size={15} />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-5 mb-6 text-center border-dashed">
          <p className="text-brand-gray font-[Inter,sans-serif] text-sm">
            <a href="/login" className="text-brand-emerald font-semibold hover:underline">Sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-4 sm:p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-emerald/10 flex items-center justify-center font-[Outfit,sans-serif] font-bold text-brand-emerald text-sm">
                    {review.user_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${i <= review.rating ? 'text-brand-gold' : 'text-brand-light-gray'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-xs text-brand-gray font-[Inter,sans-serif]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-sm text-brand-charcoal font-[Inter,sans-serif] leading-relaxed">{review.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-brand-gray font-[Inter,sans-serif] text-sm">
          No reviews yet. Be the first to review this product!
        </div>
      )}
    </div>
  )
}
