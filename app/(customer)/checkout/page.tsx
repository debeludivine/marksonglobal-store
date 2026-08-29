'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Truck, Package, MapPin } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { placeOrder } from '@/lib/checkout-actions'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

const STATES = ['Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Enugu', 'Others']
const getShippingFee = (state: string, subtotal: number) => {
  if (subtotal >= 50000) return 0
  if (state === 'Lagos') return 2000
  if (state === 'Abuja') return 3500
  if (state === 'Rivers') return 4000
  return 5000
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, totalItems, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: 'Lagos',
  })

  useEffect(() => {
    setMounted(true)
    if (items.length === 0 && step !== 3) {
      router.replace('/cart')
    }
  }, [items, router, step])

  if (!mounted || (items.length === 0 && step !== 3)) return null

  const cartSubtotal = subtotal()
  const shippingFee = getShippingFee(form.state, cartSubtotal)
  const totalAmount = cartSubtotal + shippingFee

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2) // Move to confirmation
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError('')
    const result = await placeOrder(
      {
        ...form,
        total_amount: totalAmount,
        shipping_fee: shippingFee,
      },
      items
    )

    if (result.success) {
      clearCart()
      setStep(3)
    } else {
      setError(result.error || 'Something went wrong')
    }
    setLoading(false)
  }

  if (step === 3) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12">
        <CheckCircle size={80} className="text-brand-emerald mb-6 animate-pulse" />
        <h1 className="font-[Outfit,sans-serif] font-black text-3xl md:text-4xl text-brand-charcoal mb-4">
          Order Successful!
        </h1>
        <p className="text-brand-gray font-[Inter,sans-serif] mb-8 max-w-md">
          Thank you for shopping with MarksonGlobal Stores. We have received your order and will contact you shortly regarding delivery.
        </p>
        <Link href="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-[Outfit,sans-serif] font-black text-2xl md:text-3xl text-brand-charcoal mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {step === 1 ? (
              <div className="card p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6 border-b border-brand-light-gray pb-4">
                  <MapPin className="text-brand-emerald" />
                  <h2 className="font-[Outfit,sans-serif] font-bold text-xl text-brand-charcoal">Delivery Details</h2>
                </div>
                
                <form onSubmit={handleSubmitDetails} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase">Full Name</label>
                      <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-emerald" placeholder="John Doe" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase">Phone Number</label>
                      <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-emerald" placeholder="08012345678" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase">Address</label>
                      <input required type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-emerald" placeholder="123 Main St" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase">City</label>
                      <input required type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-emerald" placeholder="Ikeja" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase">State</label>
                      <select required value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-emerald bg-white">
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="w-full btn-primary py-3">Continue to Confirmation</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6 border-b border-brand-light-gray pb-4">
                  <CheckCircle className="text-brand-emerald" />
                  <h2 className="font-[Outfit,sans-serif] font-bold text-xl text-brand-charcoal">Confirm Order</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase mb-2">Delivery To</h3>
                    <p className="font-[Inter,sans-serif] text-sm text-brand-charcoal font-medium">{form.name} ({form.phone})</p>
                    <p className="font-[Inter,sans-serif] text-sm text-brand-charcoal">{form.address}, {form.city}, {form.state}</p>
                    <button onClick={() => setStep(1)} className="text-brand-emerald text-xs font-semibold mt-2 hover:underline">Edit Details</button>
                  </div>

                  <div>
                    <h3 className="text-sm font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase mb-2">Payment Method</h3>
                    <div className="p-4 border border-brand-emerald bg-brand-emerald/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className="text-brand-emerald" />
                        <div>
                          <p className="font-semibold text-sm text-brand-charcoal font-[Outfit,sans-serif]">Pay on Delivery</p>
                          <p className="text-xs text-brand-gray font-[Inter,sans-serif]">Pay with cash or transfer when your order arrives</p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full border-4 border-brand-emerald bg-white"></div>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <div className="pt-4">
                    <button onClick={handlePlaceOrder} disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
                      {loading ? 'Processing...' : 'Place Order Now'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="card p-6 sticky top-28">
              <h2 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal mb-5 flex items-center gap-2">
                <Package size={18} /> Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {items.map(({product, quantity}) => (
                  <div key={product.id} className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-[Inter,sans-serif] text-brand-charcoal line-clamp-1">{product.name}</p>
                      <p className="text-xs text-brand-gray">Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-brand-charcoal whitespace-nowrap">
                      {formatNaira((product.discount_price ?? product.price) * quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-light-gray pt-4 space-y-3 mb-5">
                <div className="flex justify-between text-sm font-[Inter,sans-serif]">
                  <span className="text-brand-gray">Subtotal ({totalItems()} items)</span>
                  <span className="font-semibold text-brand-charcoal">{formatNaira(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-[Inter,sans-serif]">
                  <span className="text-brand-gray">Shipping</span>
                  <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-brand-charcoal'}`}>
                    {shippingFee === 0 ? 'FREE' : formatNaira(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-brand-light-gray pt-4">
                <div className="flex justify-between font-[Outfit,sans-serif] font-black text-xl text-brand-charcoal">
                  <span>Total</span>
                  <span className="text-brand-emerald">{formatNaira(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
