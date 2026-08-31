'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, Package, X, Save, PowerOff, Image as ImageIcon, CheckCircle, Smartphone, Milk, CheckSquare, Square } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import type { Product } from '@/lib/types'
import { addProduct, updateProduct, deleteProduct, batchDeleteProducts } from '@/lib/admin-actions'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
}

// AI-Ready Category Templates
const CATEGORY_TEMPLATES: Record<string, string[]> = {
  'electronics': ['Brand', 'Model', 'Color', 'RAM', 'Storage', 'Warranty', 'Condition'],
  'groceries': ['Brand', 'Weight/Volume', 'Expiry Date', 'Dietary Info', 'Packaging Type'],
  'fashion': ['Brand', 'Size', 'Color', 'Material', 'Gender'],
  'default': ['Brand', 'Manufacturer']
}

export default function ProductsClient({ initialProducts, categories }: { initialProducts: Product[], categories: any[] }) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Quick Action States
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState('')

  // Batch Select States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Dynamic Specs Builder
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>([])

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    sku: '',
    category_id: categories.length > 0 ? categories[0].id : '',
    is_deal: false,
    imageFile: null as File | null,
    imagePreview: '',
  })

  const filtered = initialProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map(p => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const openAdd = () => {
    setEditTarget(null)
    setSaveError(null)
    setForm({ name: '', description: '', price: '', discount_price: '', stock_quantity: '', sku: '', category_id: categories.length > 0 ? categories[0].id : '', is_deal: false, imageFile: null, imagePreview: '' })
    setSpecs([])
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditTarget(p)
    setSaveError(null)
    setForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      discount_price: p.discount_price?.toString() ?? '',
      stock_quantity: p.stock_quantity.toString(),
      sku: p.sku || '',
      category_id: p.category_id,
      is_deal: p.is_deal,
      imageFile: null,
      imagePreview: p.images?.[0] || '',
    })
    
    // Parse JSONB specifications into the builder array
    if (p.specifications) {
      const parsedSpecs = Object.entries(p.specifications).map(([key, value]) => ({ key, value: String(value) }))
      setSpecs(parsedSpecs)
    } else {
      setSpecs([])
    }
    
    setShowForm(true)
  }

  const applyCategoryTemplate = () => {
    const cat = categories.find(c => c.id === form.category_id)
    const templateKeys = cat ? (CATEGORY_TEMPLATES[cat.slug] || CATEGORY_TEMPLATES['default']) : CATEGORY_TEMPLATES['default']
    
    // Only add keys that don't already exist in the builder
    const existingKeys = specs.map(s => s.key)
    const newSpecs = templateKeys.filter(k => !existingKeys.includes(k)).map(k => ({ key: k, value: '' }))
    
    setSpecs([...specs, ...newSpecs])
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setSaveError(null)
      
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('price', form.price)
      if (form.discount_price) formData.append('discount_price', form.discount_price)
      formData.append('stock_quantity', form.stock_quantity)
      formData.append('sku', form.sku)
      formData.append('category_id', form.category_id)
      formData.append('is_deal', form.is_deal.toString())
      
      // Construct Specs JSON
      const validSpecs = specs.filter(s => s.key.trim() && s.value.trim())
      if (validSpecs.length > 0) {
        const specsObj = validSpecs.reduce((acc, curr) => ({ ...acc, [curr.key.trim()]: curr.value.trim() }), {})
        formData.append('specifications', JSON.stringify(specsObj))
      }
      
      // Image Compression (Mobile First Optimization)
      if (form.imageFile) {
        const options = {
          maxSizeMB: 0.3, // Target 300KB
          maxWidthOrHeight: 1024,
          useWebWorker: true
        }
        try {
          const compressedFile = await imageCompression(form.imageFile, options)
          formData.append('image', compressedFile)
        } catch (error) {
          console.error("Compression error, uploading original", error)
          formData.append('image', form.imageFile)
        }
      }
      
      let result;
      if (editTarget) {
        result = await updateProduct(editTarget.id, formData)
      } else {
        result = await addProduct(formData)
      }
      
      if (result && !result.success) {
        setSaveError(result.error || 'Failed to save product.')
        setIsLoading(false)
        return
      }
      
      setIsLoading(false)
      setShowForm(false)
    } catch (err: any) {
      console.error(err)
      setSaveError(err.message || 'An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    await deleteProduct(id)
    setIsLoading(false)
    setDeleteTarget(null)
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; })
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    setIsLoading(true)
    await batchDeleteProducts(Array.from(selectedIds))
    setIsLoading(false)
    setSelectedIds(new Set())
  }

  const handleQuickPriceUpdate = async (p: Product) => {
    if (!tempPrice || isNaN(Number(tempPrice))) {
      setEditingPriceId(null)
      return
    }
    const newPrice = parseFloat(tempPrice)
    if (newPrice === p.price) {
      setEditingPriceId(null)
      return
    }
    
    setIsLoading(true)
    await updateProduct(p.id, { ...p, price: newPrice })
    setEditingPriceId(null)
    setIsLoading(false)
  }

  const handleToggleStock = async (p: Product) => {
    setIsLoading(true)
    const newStock = p.stock_quantity === 0 ? 10 : 0 // Resets to 10 if restocking quickly
    await updateProduct(p.id, { ...p, stock_quantity: newStock })
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal mb-1">Products Catalog</h1>
          <p className="text-brand-gray font-[Inter,sans-serif] text-sm">{initialProducts.length} items • Mobile Optimized Admin</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBatchDelete}
              disabled={isLoading}
              className="btn-outline border-red-200 text-red-600 hover:bg-red-50 py-2.5 px-4 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete ({selectedIds.size})
            </button>
          )}
          <button
            onClick={openAdd}
            className="btn-primary flex items-center gap-2 py-2.5 px-4 flex-1 sm:flex-none justify-center"
          >
            <Plus size={18} />
            New Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex items-center gap-3 bg-brand-offwhite rounded-xl px-4 py-2.5 border border-brand-light-gray focus-within:border-brand-emerald transition-colors">
          <Search size={16} className="text-brand-gray" />
          <input
            type="text"
            placeholder="Search catalog by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm font-[Inter,sans-serif] text-brand-charcoal placeholder-brand-gray outline-none w-full"
          />
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden lg:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Admin products table">
            <thead>
              <tr className="bg-brand-offwhite border-b border-brand-light-gray">
                <th className="px-4 py-3 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-brand-gray hover:text-brand-charcoal">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare size={18} className="text-brand-emerald"/> : <Square size={18}/>}
                  </button>
                </th>
                {['Product', 'Category', 'Price (Quick Edit)', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-[Outfit,sans-serif] font-semibold text-brand-gray uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light-gray">
              {filtered.map((p) => {
                const cat = categories.find(c => c.id === p.category_id)
                const isSelected = selectedIds.has(p.id)
                return (
                  <tr key={p.id} className={`transition-colors group ${isSelected ? 'bg-brand-emerald/5' : 'hover:bg-brand-offwhite/50'}`}>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => toggleSelect(p.id)} className="text-brand-gray hover:text-brand-charcoal">
                        {isSelected ? <CheckSquare size={18} className="text-brand-emerald"/> : <Square size={18}/>}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-brand-offwhite flex-shrink-0 border border-brand-light-gray" />
                        ) : (
                          <div className="w-10 h-10 bg-brand-offwhite rounded-lg flex items-center justify-center text-xl flex-shrink-0">📦</div>
                        )}
                        <div>
                          <p className="font-[Inter,sans-serif] text-sm font-medium text-brand-charcoal line-clamp-1">{p.name}</p>
                          <p className="text-xs text-brand-gray flex gap-2 items-center">
                            {p.sku} {p.is_deal && <span className="text-orange-500 font-bold text-[10px] uppercase bg-orange-100 px-1.5 rounded">Deal</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-brand-gray font-[Inter,sans-serif]">
                      {cat?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4">
                      {editingPriceId === p.id ? (
                        <input
                          autoFocus
                          type="number"
                          value={tempPrice}
                          onChange={e => setTempPrice(e.target.value)}
                          onBlur={() => handleQuickPriceUpdate(p)}
                          onKeyDown={e => e.key === 'Enter' && handleQuickPriceUpdate(p)}
                          className="w-24 px-2 py-1 border border-brand-emerald rounded outline-none text-sm font-semibold"
                        />
                      ) : (
                        <button onClick={() => { setEditingPriceId(p.id); setTempPrice(p.price.toString()) }} className="font-semibold text-sm text-brand-emerald hover:underline p-1 -ml-1 rounded transition-colors group-hover:bg-brand-emerald/10 cursor-text text-left">
                          {formatNaira(p.price)}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          p.stock_quantity === 0 ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : p.stock_quantity < 20 ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        }`}
                        title="Click to toggle In/Out of Stock"
                      >
                        {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} in stock`}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-brand-emerald/10 text-brand-emerald transition-colors" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" aria-label="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Visible only on small screens) */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((p) => {
          const cat = categories.find(c => c.id === p.category_id)
          const isSelected = selectedIds.has(p.id)
          return (
            <div key={p.id} className={`card p-4 flex flex-col gap-3 transition-colors ${isSelected ? 'border-brand-emerald bg-brand-emerald/5' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleSelect(p.id)} className="mt-1 text-brand-gray hover:text-brand-charcoal">
                    {isSelected ? <CheckSquare size={18} className="text-brand-emerald"/> : <Square size={18}/>}
                  </button>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-brand-offwhite border border-brand-light-gray" />
                  ) : (
                    <div className="w-12 h-12 bg-brand-offwhite rounded-lg flex items-center justify-center text-2xl">📦</div>
                  )}
                  <div>
                    <p className="font-[Inter,sans-serif] text-sm font-semibold text-brand-charcoal line-clamp-2 leading-snug">{p.name}</p>
                    <p className="text-xs text-brand-gray mt-0.5">{cat?.name || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-y border-brand-light-gray py-2 mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-brand-gray tracking-wider">Price</span>
                  {editingPriceId === p.id ? (
                    <input
                      autoFocus
                      type="number"
                      value={tempPrice}
                      onChange={e => setTempPrice(e.target.value)}
                      onBlur={() => handleQuickPriceUpdate(p)}
                      className="w-20 px-1 py-0.5 border border-brand-emerald rounded outline-none text-sm font-semibold mt-0.5"
                    />
                  ) : (
                    <button onClick={() => { setEditingPriceId(p.id); setTempPrice(p.price.toString()) }} className="font-semibold text-sm text-brand-emerald text-left">
                      {formatNaira(p.price)}
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-brand-gray tracking-wider">Stock</span>
                  <button
                    onClick={() => handleToggleStock(p)}
                    className={`text-[10px] font-bold px-2 py-0.5 mt-0.5 rounded-md border ${
                      p.stock_quantity === 0 ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                  >
                    {p.stock_quantity === 0 ? 'OUT OF STOCK' : p.stock_quantity}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-brand-gray uppercase font-bold">{p.sku}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-brand-offwhite text-brand-emerald" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(p.id)} className="p-2 rounded-lg bg-red-50 text-red-500" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add / Edit Form Modal (Mobile Fullscreen, Desktop Centered) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col animate-slide-up sm:animate-fade-in">
            {/* Header Sticky */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-brand-light-gray flex-shrink-0 bg-white sm:rounded-t-2xl rounded-t-3xl z-10 sticky top-0">
              <div>
                <h2 className="font-[Outfit,sans-serif] font-black text-xl text-brand-charcoal">
                  {editTarget ? 'Edit Product' : 'Create Product'}
                </h2>
                <p className="text-xs text-brand-gray font-[Inter,sans-serif]">Deep Cataloging Engine</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 bg-brand-offwhite rounded-full hover:bg-brand-light-gray transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-brand-light-gray rounded-2xl p-4 flex flex-col items-center justify-center text-center relative hover:bg-brand-offwhite transition-colors">
                {(form as any).imagePreview ? (
                  <div className="relative w-32 h-32">
                    <img src={(form as any).imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-sm" />
                    <button type="button" onClick={() => setForm({...form, imageFile: null, imagePreview: ''} as any)} className="absolute -top-2 -right-2 bg-white text-red-500 p-1 rounded-full shadow border border-brand-light-gray">
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="text-brand-gray mb-2" size={32} />
                    <p className="text-sm font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1">Upload Product Image</p>
                    <p className="text-xs text-brand-gray font-[Inter,sans-serif] mb-3 max-w-[200px]">Images are automatically compressed to save data.</p>
                  </>
                )}
                
                {!((form as any).imagePreview) && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = URL.createObjectURL(file)
                        setForm({ ...form, imageFile: file, imagePreview: url } as any)
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                )}
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Peak Full Cream Milk 400g" className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald" />
                </div>
                
                <div>
                  <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">Price (₦) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald" />
                </div>
                <div>
                  <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">Discount Price (₦)</label>
                  <input type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} placeholder="Optional" className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald" />
                </div>
                
                <div>
                  <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">Category *</label>
                  <select value={form.category_id} onChange={(e) => { setForm({ ...form, category_id: e.target.value }); setSpecs([]); }} className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald bg-white">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">Stock *</label>
                    <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">SKU *</label>
                    <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="MG-001" className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald uppercase" />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Provide a detailed description..." className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald resize-none" />
                </div>
              </div>

              {/* Dynamic Specifications Builder */}
              <div className="bg-brand-offwhite rounded-2xl p-4 border border-brand-light-gray">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-[Outfit,sans-serif] font-bold text-sm text-brand-charcoal flex items-center gap-2">
                      <Package size={14} /> Product Specifications (AI Ready)
                    </h3>
                    <p className="text-[10px] text-brand-gray font-[Inter,sans-serif] uppercase tracking-wider mt-0.5">Flexible Key-Value Attributes</p>
                  </div>
                  <button type="button" onClick={applyCategoryTemplate} className="text-xs bg-white border border-brand-light-gray px-3 py-1.5 rounded-lg font-semibold text-brand-charcoal hover:border-brand-emerald transition-colors">
                    Load Template
                  </button>
                </div>
                
                <div className="space-y-2">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Key (e.g. RAM)" 
                        value={spec.key} 
                        onChange={(e) => { const n = [...specs]; n[idx].key = e.target.value; setSpecs(n); }}
                        className="flex-1 border border-brand-light-gray rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-emerald font-semibold" 
                      />
                      <input 
                        type="text" 
                        placeholder="Value (e.g. 8GB)" 
                        value={spec.value} 
                        onChange={(e) => { const n = [...specs]; n[idx].value = e.target.value; setSpecs(n); }}
                        className="flex-[2] border border-brand-light-gray rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-emerald" 
                      />
                      <button type="button" onClick={() => setSpecs(specs.filter((_, i) => i !== idx))} className="text-brand-gray hover:text-red-500 p-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])} className="w-full mt-2 border border-dashed border-brand-light-gray py-2 rounded-lg text-xs font-semibold text-brand-emerald hover:bg-brand-emerald/5 flex items-center justify-center gap-1">
                    <Plus size={14} /> Add Custom Attribute
                  </button>
                </div>
              </div>

            </div>

            {/* Sticky Footer */}
            <div className="p-4 sm:p-6 border-t border-brand-light-gray flex-shrink-0 bg-white">
              {saveError && (
                <div className="mb-4 bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
                  {saveError}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} disabled={isLoading} className="flex-1 btn-outline py-3.5">Cancel</button>
                <button onClick={handleSave} disabled={isLoading} className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 text-base">
                  <Save size={18} />
                  {isLoading ? 'Saving...' : (editTarget ? 'Save Changes' : 'Publish Product')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 animate-fade-in text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="font-[Outfit,sans-serif] font-black text-xl text-brand-charcoal mb-2">Delete Product?</h2>
            <p className="text-brand-gray text-sm font-[Inter,sans-serif] mb-8">This action cannot be undone and will immediately remove the product from the storefront.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={isLoading}
                className="w-full bg-red-500 text-white font-[Outfit,sans-serif] font-bold text-lg py-3.5 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete it'}
              </button>
              <button onClick={() => setDeleteTarget(null)} disabled={isLoading} className="w-full bg-brand-offwhite text-brand-charcoal font-[Outfit,sans-serif] font-bold py-3.5 rounded-xl hover:bg-brand-light-gray transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
