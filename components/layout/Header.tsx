'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Search, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Groceries & Provisions', href: '/category/groceries' },
    { label: 'Electronics', href: '/category/electronics' },
    { label: "Today's Deals", href: '/deals', highlight: true },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white shadow-sm'
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-brand-emerald text-white text-xs text-center py-2 px-4 font-[Inter,sans-serif]">
        🚚 Free delivery on orders over ₦50,000 &nbsp;|&nbsp; 📞 Call us: 0800-MARKSON
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.jpg"
              alt="MarksonGlobal Stores"
              width={140}
              height={56}
              className="h-10 md:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-[Outfit,sans-serif] font-medium transition-all duration-200 ${
                  link.highlight
                    ? 'text-brand-gold font-bold hover:bg-brand-gold/10'
                    : 'text-brand-charcoal hover:text-brand-emerald hover:bg-brand-emerald/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search + Cart */}
          <div className="flex items-center gap-2">
            {/* Search Bar — Desktop */}
            <div className="hidden md:flex items-center bg-brand-offwhite border border-brand-light-gray rounded-xl px-3 py-2 gap-2 w-64 lg:w-80 focus-within:border-brand-emerald transition-colors">
              <Search size={16} className="text-brand-gray flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent text-sm outline-none w-full text-brand-charcoal placeholder-brand-gray font-[Inter,sans-serif]"
                aria-label="Search products"
              />
            </div>

            {/* Search icon — Mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-brand-offwhite transition-colors"
              aria-label="Toggle search"
            >
              <Search size={20} className="text-brand-charcoal" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              id="cart-button"
              className="relative p-2.5 rounded-xl bg-brand-emerald text-white hover:bg-brand-emerald-light transition-all duration-200 shadow-emerald hover:-translate-y-0.5"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={20} />
              {totalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-brand-charcoal text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 animate-fade-in">
                  {totalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-brand-offwhite transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X size={22} className="text-brand-charcoal" />
              ) : (
                <Menu size={22} className="text-brand-charcoal" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden pb-3 animate-slide-up">
            <div className="flex items-center bg-brand-offwhite border border-brand-light-gray rounded-xl px-3 py-2.5 gap-2">
              <Search size={16} className="text-brand-gray" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent text-sm outline-none w-full text-brand-charcoal placeholder-brand-gray font-[Inter,sans-serif]"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-brand-light-gray animate-slide-up">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-[Outfit,sans-serif] font-medium transition-all duration-200 ${
                  link.highlight
                    ? 'text-brand-gold font-bold'
                    : 'text-brand-charcoal hover:text-brand-emerald hover:bg-brand-offwhite'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
