import { Loader2 } from 'lucide-react'

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-brand-offwhite">
      <Loader2 size={40} className="text-brand-emerald animate-spin mb-4" />
      <h2 className="font-[Outfit,sans-serif] font-bold text-xl text-brand-charcoal animate-pulse">
        Loading MarksonGlobal...
      </h2>
      <p className="text-brand-gray text-sm font-[Inter,sans-serif] mt-2 max-w-xs text-center">
        Please wait while we fetch the latest deals and products for you.
      </p>
    </div>
  )
}
