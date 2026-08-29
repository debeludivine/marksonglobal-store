import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Share2, Globe, MessageCircle } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-charcoal text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Image
              src="/logo.jpg"
              alt="MarksonGlobal Stores"
              width={140}
              height={56}
              className="h-12 w-auto object-contain mb-4 brightness-0 invert"
            />
            <p className="text-white/60 text-sm leading-relaxed font-[Inter,sans-serif]">
              Nigeria&apos;s premium digital supermarket — delivering quality groceries and
              electronics straight to your door.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-charcoal transition-all duration-200">
                <Share2 size={16} />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-charcoal transition-all duration-200">
                <Globe size={16} />
              </a>
              <a href="#" aria-label="WhatsApp" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-charcoal transition-all duration-200">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-[Outfit,sans-serif] font-bold text-base mb-5 text-brand-gold">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Groceries & Provisions', href: '/category/groceries' },
                { label: 'Electronics', href: '/category/electronics' },
                { label: "Today's Deals", href: '/deals' },
                { label: 'My Cart', href: '/cart' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 text-sm hover:text-brand-gold transition-colors duration-200 font-[Inter,sans-serif]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-[Outfit,sans-serif] font-bold text-base mb-5 text-brand-gold">Customer Service</h3>
            <ul className="space-y-3">
              {[
                'How to Order',
                'Delivery Information',
                'Returns & Refunds',
                'Privacy Policy',
                'Terms & Conditions',
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/60 text-sm hover:text-brand-gold transition-colors duration-200 font-[Inter,sans-serif]"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-[Outfit,sans-serif] font-bold text-base mb-5 text-brand-gold">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm font-[Inter,sans-serif] leading-relaxed">
                  MarksonGlobal Plaza, Lagos, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand-gold flex-shrink-0" />
                <span className="text-white/60 text-sm font-[Inter,sans-serif]">0800-MARKSON</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-brand-gold flex-shrink-0" />
                <span className="text-white/60 text-sm font-[Inter,sans-serif]">hello@marksonglobal.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs font-[Inter,sans-serif]">
            &copy; {year} MarksonGlobal Stores. All rights reserved.
          </p>
          <p className="text-white/40 text-xs font-[Inter,sans-serif]">
            Built with ❤️ for Nigeria
          </p>
        </div>
      </div>
    </footer>
  )
}
