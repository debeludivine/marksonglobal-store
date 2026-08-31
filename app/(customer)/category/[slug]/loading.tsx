import { Search } from 'lucide-react'

export default function CategoryOrSearchLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-brand-emerald to-brand-emerald-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 w-32 bg-white/20 rounded mb-4" />
          <div className="h-10 w-64 bg-white/20 rounded mb-3" />
          <div className="h-4 w-40 bg-white/20 rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Bar Skeleton */}
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="h-10 w-32 bg-brand-light-gray/20 rounded-xl" />
          <div className="h-10 w-48 bg-brand-light-gray/20 rounded-xl" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="bg-brand-light-gray/20 aspect-square rounded-2xl mb-4 w-full" />
              <div className="h-3 w-1/3 bg-brand-light-gray/20 rounded mb-2" />
              <div className="h-4 w-3/4 bg-brand-light-gray/20 rounded mb-3" />
              <div className="h-5 w-1/2 bg-brand-light-gray/20 rounded mb-4" />
              <div className="h-10 w-full bg-brand-light-gray/20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
