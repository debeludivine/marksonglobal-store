'use client'

import { Bell, User, Menu } from 'lucide-react'

type Props = {
  onMenuOpen: () => void
}

export default function AdminTopbar({ onMenuOpen }: Props) {
  return (
    <header className="bg-white border-b border-brand-light-gray px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-brand-offwhite transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-brand-charcoal" />
        </button>
        <div>
          <p className="text-[10px] sm:text-xs text-brand-gray font-[Inter,sans-serif] uppercase tracking-widest mb-0.5">
            MarksonGlobal Admin
          </p>
          <p className="font-[Outfit,sans-serif] font-semibold text-brand-charcoal text-xs sm:text-sm">
            Good day, Store Owner 👋
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative p-2 rounded-lg hover:bg-brand-offwhite transition-colors" aria-label="Notifications">
          <Bell size={18} className="text-brand-gray" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-gold rounded-full" />
        </button>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-emerald flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      </div>
    </header>
  )
}
