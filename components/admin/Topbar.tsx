'use client'

import { useState, useEffect } from 'react'
import { Bell, User, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  onMenuOpen: () => void
}

export default function AdminTopbar({ onMenuOpen }: Props) {
  const [pendingOrders, setPendingOrders] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    
    // Initial fetch
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending')
      .then(({ count }) => { if (count !== null) setPendingOrders(count) })

    // Realtime subscription
    const channel = supabase.channel('realtime_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new.status === 'pending') {
          setPendingOrders(prev => prev + 1)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.old.status === 'pending' && payload.new.status !== 'pending') {
          setPendingOrders(prev => Math.max(0, prev - 1))
        } else if (payload.old.status !== 'pending' && payload.new.status === 'pending') {
          setPendingOrders(prev => prev + 1)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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
          {pendingOrders > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white">
              {pendingOrders}
            </span>
          )}
        </button>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-emerald flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      </div>
    </header>
  )
}
