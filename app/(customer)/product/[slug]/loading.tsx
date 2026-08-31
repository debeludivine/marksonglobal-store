export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-brand-offwhite pt-10 pb-20 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Skeleton */}
          <div className="bg-brand-light-gray/20 aspect-square rounded-3xl w-full" />
          
          {/* Details Skeleton */}
          <div className="flex flex-col pt-4 md:pt-10">
            <div className="h-6 w-32 bg-brand-light-gray/20 rounded-lg mb-4" />
            <div className="h-10 w-3/4 bg-brand-light-gray/20 rounded-xl mb-4" />
            <div className="h-8 w-1/4 bg-brand-light-gray/20 rounded-xl mb-8" />
            
            <div className="space-y-3 mb-10">
              <div className="h-4 w-full bg-brand-light-gray/20 rounded" />
              <div className="h-4 w-5/6 bg-brand-light-gray/20 rounded" />
              <div className="h-4 w-4/6 bg-brand-light-gray/20 rounded" />
            </div>
            
            <div className="h-14 w-full md:w-64 bg-brand-light-gray/20 rounded-2xl mb-8" />
            
            <div className="border-t border-brand-light-gray/40 pt-8 space-y-4">
              <div className="h-12 w-full bg-brand-light-gray/20 rounded-xl" />
              <div className="h-12 w-full bg-brand-light-gray/20 rounded-xl" />
              <div className="h-12 w-full bg-brand-light-gray/20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
