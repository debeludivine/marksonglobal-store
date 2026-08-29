'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Truck, Package, MapPin, Tag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { placeOrder, applyCoupon } from '@/lib/checkout-actions'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
}

const STATES = ['Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Enugu', 'Others']
const getShippingFee = (state: string, subtotal: number, method: string) => {
  if (method === 'pickup') return 0
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
  const [finalOrderId, setFinalOrderId] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', state: 'Lagos', delivery_method: 'delivery',
  })

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [couponMessage, setCouponMessage] = useState('')

  useEffect(() => {
    setMounted(true)
    if (items.length === 0 && step !== 3) router.replace('/cart')
  }, [items, router, step])

  if (!mounted || (items.length === 0 && step !== 3)) return null

  const cartSubtotal = subtotal()
  const shippingFee = getShippingFee(form.state, cartSubtotal, form.delivery_method)
  const totalAmount = Math.max(0, cartSubtotal + shippingFee - appliedDiscount)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    const result = await applyCoupon(couponCode, cartSubtotal)
    if (result.valid) {
      setAppliedDiscount(result.discount)
      setCouponMessage(result.message)
    } else {
      setAppliedDiscount(0)
      setCouponMessage(result.message)
    }
    setApplyingCoupon(false)
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { v4: uuidv4 } = await import('uuid')
      const { queueMutation } = await import('@/lib/network/localDb')
      
      const idempotencyKey = uuidv4()
      const payload = {
        idempotencyKey,
        amount: cartSubtotal + shippingFee,
        address: form.delivery_method === 'pickup' ? 'Store Pickup' : `${form.address}, ${form.city}, ${form.state}`,
        items: items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price: i.product.discount_price ?? i.product.price
        }))
      }
      
      // Fire and forget local queue for resilient background sync
      await queueMutation('CHECKOUT', payload)
      
      setFinalOrderId(idempotencyKey)
      clearCart()
      setStep(3)
    } catch (err) {
      setError('Could not queue checkout. Check storage.')
    }
    
    setLoading(false)
  }

  if (step === 3) {
    const whatsappMsg = `Hello MarksonGlobal, I just placed an order (ID: #${finalOrderId.slice(0, 8)}). Please confirm.`
    const whatsappUrl = `https://wa.me/2348000000000?text=${encodeURIComponent(whatsappMsg)}`

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12">
        <CheckCircle size={80} className="text-brand-emerald mb-6 animate-pulse" />
        <h1 className="font-[Outfit,sans-serif] font-black text-3xl md:text-4xl text-brand-charcoal mb-4">
          Order Successful!
        </h1>
        <p className="text-brand-gray font-[Inter,sans-serif] mb-8 max-w-md">
          Thank you for shopping with MarksonGlobal Stores. We have received your order and will contact you shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="btn-primary">Continue Shopping</Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-outline border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 flex items-center gap-2">
            Message us on WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-[Outfit,sans-serif] font-black text-2xl md:text-3xl text-brand-charcoal mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 ? (
              <div className="card p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6 border-b border-brand-light-gray pb-4">
                  <MapPin className="text-brand-emerald" />
                  <h2 className="font-[Outfit,sans-serif] font-bold text-xl text-brand-charcoal">Delivery Details</h2>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-colors ${form.delivery_method === 'delivery' ? 'border-brand-emerald bg-brand-emerald/5' : 'border-brand-light-gray hover:border-brand-gray'}`}>
                      <input type="radio" name="method" value="delivery" checked={form.delivery_method === 'delivery'} onChange={(e) => setForm({...form, delivery_method: e.target.value})} className="sr-only" />
                      <Truck size={24} className={form.delivery_method === 'delivery' ? 'text-brand-emerald' : 'text-brand-gray'} />
                      <span className={`font-[Outfit,sans-serif] font-semibold text-sm ${form.delivery_method === 'delivery' ? 'text-brand-emerald' : 'text-brand-gray'}`}>Delivery</span>
                    </label>
                    <label className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-colors ${form.delivery_method === 'pickup' ? 'border-brand-emerald bg-brand-emerald/5' : 'border-brand-light-gray hover:border-brand-gray'}`}>
                      <input type="radio" name="method" value="pickup" checked={form.delivery_method === 'pickup'} onChange={(e) => setForm({...form, delivery_method: e.target.value})} className="sr-only" />
                      <Package size={24} className={form.delivery_method === 'pickup' ? 'text-brand-emerald' : 'text-brand-gray'} />
                      <span className={`font-[Outfit,sans-serif] font-semibold text-sm ${form.delivery_method === 'pickup' ? 'text-brand-emerald' : 'text-brand-gray'}`}>Store Pickup (Free)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase">Full Name</label>
                      <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-emerald" placeholder="John Doe" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase">Phone Number</label>
                      <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-emerald" placeholder="08012345678" />
                    </div>
                    
                    {form.delivery_method === 'delivery' && (
                      <>
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
                      </>
                    )}
                  </div>
                  <div className="pt-2">
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
                    <h3 className="text-sm font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase mb-2">
                      {form.delivery_method === 'pickup' ? 'Store Pickup By' : 'Delivery To'}
                    </h3>
                    <p className="font-[Inter,sans-serif] text-sm text-brand-charcoal font-medium">{form.name} ({form.phone})</p>
                    {form.delivery_method === 'delivery' && (
                      <p className="font-[Inter,sans-serif] text-sm text-brand-charcoal">{form.address}, {form.city}, {form.state}</p>
                    )}
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
                    <button onClick={handlePlaceOrder} disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50 text-lg">
                      {loading ? 'Processing...' : `Place Order • ${formatNaira(totalAmount)}`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
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

              {/* Coupon Section */}
              <div className="border-t border-brand-light-gray py-4">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={appliedDiscount > 0}
                    className="w-full border border-brand-light-gray rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-emerald uppercase disabled:opacity-60"
                  />
                  {appliedDiscount > 0 ? (
                    <button onClick={() => { setAppliedDiscount(0); setCouponCode(''); setCouponMessage('') }} className="px-3 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200">Remove</button>
                  ) : (
                    <button onClick={handleApplyCoupon} disabled={applyingCoupon || !couponCode} className="px-4 bg-brand-charcoal text-white rounded-lg text-sm font-semibold hover:bg-black disabled:opacity-50">
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponMessage && (
                  <p className={`text-xs ${appliedDiscount > 0 ? 'text-green-600' : 'text-red-500'}`}>{couponMessage}</p>
                )}
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
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm font-[Inter,sans-serif] text-brand-emerald">
                    <span className="flex items-center gap-1"><Tag size={12}/> Discount</span>
                    <span className="font-semibold">-{formatNaira(appliedDiscount)}</span>
                  </div>
                )}
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
