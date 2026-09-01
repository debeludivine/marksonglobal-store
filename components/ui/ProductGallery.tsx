'use client'

import { useState } from 'react'
import { AdaptiveImage } from './AdaptiveImage'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'

type Props = {
  images: string[]
  productName: string
  categoryId?: string
}

export default function ProductGallery({ images, productName, categoryId }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  const hasImages = images && images.length > 0
  const hasMultiple = hasImages && images.length > 1

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return
    const distance = touchStartX - touchEndX
    const minSwipeDistance = 40
    if (distance > minSwipeDistance) {
      handleNext()
    } else if (distance < -minSwipeDistance) {
      handlePrev()
    }
    setTouchStartX(null)
    setTouchEndX(null)
  }

  if (!hasImages) {
    return (
      <div className="relative bg-brand-offwhite rounded-2xl h-72 sm:h-96 lg:h-[480px] flex items-center justify-center shadow-card overflow-hidden select-none">
        <div className="text-[8rem] sm:text-[10rem] select-none">
          {categoryId === 'cat-electronics' ? '📦' : '🛒'}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Stage */}
      <div 
        className="relative bg-brand-offwhite rounded-2xl h-72 sm:h-96 lg:h-[480px] flex items-center justify-center shadow-card overflow-hidden group select-none"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchMove={hasMultiple ? handleTouchMove : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        {/* Slider Window */}
        <div 
          className="flex w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((src, idx) => (
            <div key={idx} className="relative w-full h-full shrink-0 flex-none p-4 flex items-center justify-center">
              <AdaptiveImage
                src={src}
                alt={`${productName} - Image ${idx + 1}`}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                priority={idx === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {/* Carousel Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-brand-charcoal flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-brand-charcoal flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Jiji-Style Counter Badge */}
        {hasMultiple && (
          <div className="absolute bottom-3.5 right-3.5 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-sm pointer-events-none">
            <Camera size={13} className="text-white/90" />
            <span>{activeIndex + 1}/{images.length}</span>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {hasMultiple && (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 px-1">
          {images.map((src, idx) => {
            const isActive = idx === activeIndex
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all bg-brand-offwhite ${
                  isActive 
                    ? 'border-brand-emerald ring-2 ring-brand-emerald/30 shadow-md scale-95' 
                    : 'border-brand-light-gray/80 hover:border-brand-emerald/50 opacity-70 hover:opacity-100'
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <AdaptiveImage
                  src={src}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
