export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl overflow-hidden h-72 flex flex-col">
          <div className="h-36 sm:h-48 bg-gray-200"></div>
          <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
            <div className="h-5 w-20 bg-gray-200 rounded mt-auto"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
