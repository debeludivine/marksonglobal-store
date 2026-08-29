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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/dashboard/products', icon: Package },
  { label: 'Categories', href: '/admin/dashboard/categories', icon: Tag },
  { label: "Today's Deals", href: '/admin/dashboard/deals', icon: Zap },
  { label: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingBag },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 bg-brand-emerald flex-shrink-0 flex flex-col min-h-screen sticky top-0">
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <Image
          src="/logo.jpg"
          alt="MarksonGlobal"
          width={120}
          height={48}
          className="h-10 w-auto object-contain brightness-0 invert mb-3"
        />
        <div className="flex items-center gap-1.5 bg-brand-gold/20 border border-brand-gold/30 rounded-full px-3 py-1 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          <span className="text-brand-gold text-[10px] font-[Outfit,sans-serif] font-bold uppercase tracking-widest">
            Control Room
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
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
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
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
  )
}
