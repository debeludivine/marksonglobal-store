'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Package, X, Save } from 'lucide-react'
import { MOCK_PRODUCTS, type Product } from '@/lib/seed-data'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    sku: '',
    category_id: 'cat-groceries',
    is_deal: false,
  })

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditTarget(null)
    setForm({ name: '', description: '', price: '', discount_price: '', stock_quantity: '', sku: '', category_id: 'cat-groceries', is_deal: false })
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditTarget(p)
    setForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      discount_price: p.discount_price?.toString() ?? '',
      stock_quantity: p.stock_quantity.toString(),
      sku: p.sku,
      category_id: p.category_id,
      is_deal: p.is_deal,
    })
    setShowForm(true)
  }

  const handleSave = () => {
    if (editTarget) {
      setProducts(products.map((p) =>
        p.id === editTarget.id
          ? {
              ...p,
              name: form.name,
              description: form.description,
              price: parseFloat(form.price),
              discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
              stock_quantity: parseInt(form.stock_quantity),
              sku: form.sku,
              category_id: form.category_id,
              is_deal: form.is_deal,
            }
          : p
      ))
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        images: [],
        specifications: null,
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        stock_quantity: parseInt(form.stock_quantity),
        sku: form.sku,
        category_id: form.category_id,
        is_deal: form.is_deal,
      }
      setProducts([newProduct, ...products])
    }
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal mb-1">Products</h1>
          <p className="text-brand-gray font-[Inter,sans-serif] text-sm">{products.length} total products</p>
        </div>
        <button
          onClick={openAdd}
          id="admin-add-product"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex items-center gap-3 bg-brand-offwhite rounded-xl px-4 py-2.5 border border-brand-light-gray focus-within:border-brand-emerald transition-colors">
          <Search size={16} className="text-brand-gray" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm font-[Inter,sans-serif] text-brand-charcoal placeholder-brand-gray outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Admin products table">
            <thead>
              <tr className="bg-brand-offwhite">
                {['Product', 'Category', 'Price', 'Stock', 'Deal', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-gray">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-brand-offwhite/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-offwhite rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        {p.category_id === 'cat-electronics' ? '📦' : '🛒'}
                      </div>
                      <div>
                        <p className="font-[Inter,sans-serif] text-sm font-medium text-brand-charcoal line-clamp-1">{p.name}</p>
                        <p className="text-xs text-brand-gray">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-brand-gray font-[Inter,sans-serif]">
                    {p.category_id === 'cat-electronics' ? 'Electronics' : 'Groceries'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm text-brand-emerald">{formatNaira(p.discount_price ?? p.price)}</p>
                    {p.discount_price && <p className="text-xs text-brand-gray line-through">{formatNaira(p.price)}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.stock_quantity === 0 ? 'bg-red-100 text-red-600'
                      : p.stock_quantity < 20 ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                      {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.is_deal ? <span className="deal-badge">🔥</span> : <span className="text-brand-gray text-sm">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-brand-emerald/10 text-brand-emerald transition-colors"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-brand-light-gray">
              <h2 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal">
                {editTarget ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-brand-offwhite transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'e.g. Peak Full Cream Milk 400g' },
                { label: 'SKU *', key: 'sku', type: 'text', placeholder: 'e.g. GRC-PEAK-400' },
                { label: 'Price (₦) *', key: 'price', type: 'number', placeholder: '0.00' },
                { label: 'Discount Price (₦)', key: 'discount_price', type: 'number', placeholder: 'Leave empty for no discount' },
                { label: 'Stock Quantity *', key: 'stock_quantity', type: 'number', placeholder: '0' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">{label}</label>
                  <input
                    type={type}
                    value={(form as Record<string, string | boolean>)[key] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] text-brand-charcoal outline-none focus:border-brand-emerald transition-colors"
                  />
                </div>
              ))}

              {/* Description */}
              <div>
                <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Product description..."
                  className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] text-brand-charcoal outline-none focus:border-brand-emerald transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">Category *</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] text-brand-charcoal outline-none focus:border-brand-emerald transition-colors bg-white"
                >
                  <option value="cat-groceries">Groceries & Provisions</option>
                  <option value="cat-electronics">Electronics</option>
                </select>
              </div>

              {/* Deal toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_deal: !form.is_deal })}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
                    form.is_deal ? 'bg-brand-gold' : 'bg-brand-light-gray'
                  }`}
                  aria-checked={form.is_deal}
                  role="switch"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    form.is_deal ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
                <span className="text-sm font-[Inter,sans-serif] text-brand-charcoal">Mark as Today&apos;s Deal 🔥</span>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className="flex-1 btn-outline py-2.5">Cancel</button>
              <button onClick={handleSave} id="admin-save-product" className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                <Save size={16} />
                {editTarget ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h2 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal mb-2">Delete Product?</h2>
            <p className="text-brand-gray text-sm font-[Inter,sans-serif] mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-outline py-2.5">Cancel</button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                id="admin-confirm-delete"
                className="flex-1 bg-red-500 text-white font-[Outfit,sans-serif] font-semibold py-2.5 rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
