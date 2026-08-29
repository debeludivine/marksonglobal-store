import { Bell, User } from 'lucide-react'

export default function AdminTopbar() {
  return (
    <header className="bg-white border-b border-brand-light-gray px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <p className="text-xs text-brand-gray font-[Inter,sans-serif] uppercase tracking-widest mb-0.5">
          MarksonGlobal Admin
        </p>
        <p className="font-[Outfit,sans-serif] font-semibold text-brand-charcoal text-sm">
          Good day, Store Owner 👋
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-brand-offwhite transition-colors" aria-label="Notifications">
          <Bell size={18} className="text-brand-gray" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-brand-emerald flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
      </div>
    </header>
  )
}
