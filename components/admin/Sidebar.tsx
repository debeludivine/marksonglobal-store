'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tag,
  Zap,
  ShoppingBag,
  LogOut,
  Store,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/dashboard/products', icon: Package },
  { label: 'Categories', href: '/admin/dashboard/categories', icon: Tag },
  { label: "Today's Deals", href: '/admin/dashboard/deals', icon: Zap },
  { label: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingBag },
  { label: 'Coupons', href: '/admin/dashboard/coupons', icon: Tag },
]

type Props = {
  open: boolean
  onClose: () => void
}

export default function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-full z-50 w-64 bg-brand-emerald flex-shrink-0 flex flex-col min-h-screen transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <Image
              src="/logo.jpg"
              alt="MarksonGlobal"
              width={100}
              height={40}
              className="h-8 sm:h-10 w-auto object-contain brightness-0 invert mb-2 sm:mb-3"
            />
            <div className="flex items-center gap-1.5 bg-brand-gold/20 border border-brand-gold/30 rounded-full px-3 py-1 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-brand-gold text-[10px] font-[Outfit,sans-serif] font-bold uppercase tracking-widest">
                Control Room
              </span>
            </div>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-white/60 hover:text-white"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === '/admin/dashboard'
                ? pathname === '/admin/dashboard'
                : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                id={`admin-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`admin-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 sm:p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            onClick={onClose}
            className="admin-nav-link"
          >
            <Store size={18} />
            View Storefront
          </Link>
          <button
            onClick={handleLogout}
            id="admin-logout"
            className="admin-nav-link w-full text-red-300 hover:text-red-200 hover:bg-red-500/20"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
