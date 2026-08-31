'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Search, Package, X, Save, CheckSquare, Square, Folder, ChevronRight, Home, Image as ImageIcon, FolderPlus, AlertTriangle, Sparkles, Loader2, Zap } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import type { Product } from '@/lib/types'
import { addProduct, updateProduct, deleteProduct, batchDeleteProducts, createCategory, deleteCategoryWithOptions, generateProductDetailsAction } from '@/lib/admin-actions'

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
}

function formatBytes(bytes: number, decimals = 0) {
  if (!bytes || bytes === 0) return '0 KB'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const CATEGORY_TEMPLATES: Record<string, string[]> = {
  'electronics': ['Brand', 'Model', 'Color', 'RAM', 'Storage', 'Warranty', 'Condition'],
  'groceries': ['Brand', 'Weight/Volume', 'Expiry Date', 'Dietary Info', 'Packaging Type'],
  'fashion': ['Brand', 'Size', 'Color', 'Material', 'Gender'],
  'default': ['Brand', 'Manufacturer']
}

export default function ProductsClient({ initialProducts, categories }: { initialProducts: Product[], categories: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<any | null>(null)
  const [deleteMode, setDeleteMode] = useState<'cascade' | 'relocate'>('relocate')
  const [relocateTargetId, setRelocateTargetId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Quick Action States
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState('')

  // Batch Select States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Dynamic Specs Builder
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>([])

  // Drill-down Folder UX State
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  
  // Breadcrumb Generator
  const breadcrumbs = useMemo(() => {
    const crumbs = []
    let curr = categories.find(c => c.id === currentFolder)
    while (curr) {
      crumbs.unshift(curr)
      curr = categories.find(c => c.id === curr?.parent_id)
    }
    return crumbs
  }, [currentFolder, categories])

  // Drill-down filtering
  const visibleCategories = categories.filter(c => currentFolder ? c.parent_id === currentFolder : !c.parent_id)
  
  // Only show products if we are inside a folder (or if searching)
  const displayProducts = initialProducts.filter((p) => {
    if (search) {
      return p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    }
    return p.category_id === currentFolder
  })

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    sku: '',
    category_id: currentFolder || (categories.length > 0 ? categories[0].id : ''),
    is_deal: false,
  })

  // Multi-image state & Compression tracking
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageMeta, setImageMeta] = useState<{ size: number, originalSize: number }[]>([])
  const [isCompressingImages, setIsCompressingImages] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  // Category Form state
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    parent_id: '',
  })
  
  // Cascading Form Categories
  const rootCategories = categories.filter(c => !c.parent_id)
  const [formRootCategory, setFormRootCategory] = useState<string>('')
  
  // When form opens, we try to pre-fill the root and sub categories based on current folder or edit target
  const prepareFormCategory = (targetCatId: string) => {
    const targetCat = categories.find(c => c.id === targetCatId)
    if (targetCat?.parent_id) {
      setFormRootCategory(targetCat.parent_id)
    } else {
      setFormRootCategory(targetCat?.id || '')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === displayProducts.length && displayProducts.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(displayProducts.map(p => p.id)))
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
    const defaultCat = currentFolder || (categories.length > 0 ? categories[0].id : '')
    setForm({ name: '', description: '', price: '', discount_price: '', stock_quantity: '', sku: '', category_id: defaultCat, is_deal: false })
    prepareFormCategory(defaultCat)
    setSpecs([])
    setImageFiles([])
    setImagePreviews([])
    setImageMeta([])
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
    })
    prepareFormCategory(p.category_id)
    // Pre-load existing images as previews (no File objects — they're remote URLs)
    setImageFiles([])
    setImagePreviews(p.images || [])
    setImageMeta((p.images || []).map(() => ({ size: 0, originalSize: 0 })))
    
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
    
    const existingKeys = specs.map(s => s.key)
    const newSpecs = templateKeys.filter(k => !existingKeys.includes(k)).map(k => ({ key: k, value: '' }))
    
    setSpecs([...specs, ...newSpecs])
  }

  const handleImageFilesChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const MAX = 6
    const existing = imagePreviews.length
    const allowedCount = MAX - existing
    if (allowedCount <= 0) {
      alert('Maximum 6 images allowed.')
      return
    }
    
    const toAdd = Array.from(files).slice(0, allowedCount)
    setIsCompressingImages(true)

    const compressionOptions = {
      maxSizeMB: 0.35, // Compress to max 350KB
      maxWidthOrHeight: 1200, // Max dimension 1200px for sharp high-DPI displays
      useWebWorker: true,
      fileType: 'image/webp', // Auto-convert to high-efficiency WebP format
      initialQuality: 0.85,
    }

    try {
      for (const file of toAdd) {
        const originalSize = file.size
        let compressedFile: File
        try {
          const compressedBlob = await imageCompression(file, compressionOptions)
          // Create File object with .webp extension for consistent headers
          const webpName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
          compressedFile = new File([compressedBlob], webpName, { type: 'image/webp' })
        } catch (compressionErr) {
          console.warn('Compression fallback to original image', compressionErr)
          compressedFile = file
        }

        const previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(compressedFile)
        })

        setImageFiles(prev => [...prev, compressedFile])
        setImagePreviews(prev => [...prev, previewUrl])
        setImageMeta(prev => [...prev, { size: compressedFile.size, originalSize }])
      }
    } catch (err) {
      console.error('Image compression error:', err)
    } finally {
      setIsCompressingImages(false)
    }
  }

  const removeImage = (idx: number) => {
    const existingRemoteCount = editTarget ? (editTarget.images || []).filter(url => imagePreviews.includes(url)).length : 0
    const isRemote = idx < existingRemoteCount

    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
    setImageMeta(prev => prev.filter((_, i) => i !== idx))

    if (!isRemote) {
      const localFileIndex = idx - existingRemoteCount
      setImageFiles(prev => prev.filter((_, i) => i !== localFileIndex))
    }
  }

  const handleAIGenerate = async () => {
    if (!form.name.trim()) {
      alert("Please enter a product name first!")
      return
    }
    
    setIsGeneratingAI(true)
    const result = await generateProductDetailsAction(form.name)
    setIsGeneratingAI(false)
    
    if (result.success && result.data) {
      const data = result.data
      
      const newSpecs = Array.isArray(data.specifications) 
        ? data.specifications 
        : Object.entries(data.specifications || {}).map(([key, value]) => ({ key, value: String(value) }))
      setSpecs(newSpecs)
      
      setForm(prev => ({
        ...prev,
        description: data.description || prev.description,
        category_id: data.categoryId || prev.category_id
      }))
      
      if (data.categoryId) {
        prepareFormCategory(data.categoryId)
      }
      router.refresh()
    } else {
      alert(`AI Error: ${result.error}`)
    }
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
      
      const validSpecs = specs.filter(s => s.key.trim() && s.value.trim())
      if (validSpecs.length > 0) {
        const specsObj = validSpecs.reduce((acc, curr) => ({ ...acc, [curr.key.trim()]: curr.value.trim() }), {})
        formData.append('specifications', JSON.stringify(specsObj))
      }
      
      // Append all pre-compressed image files (already compressed to WebP on selection)
      for (const file of imageFiles) {
        formData.append('images', file)
      }

      // Pass existing remote URLs for edit mode so server can merge them
      const existingRemoteUrls = editTarget 
        ? imagePreviews.filter(p => p.startsWith('http'))
        : []
      if (existingRemoteUrls.length > 0) {
        formData.append('existing_images', JSON.stringify(existingRemoteUrls))
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
    const newStock = p.stock_quantity === 0 ? 10 : 0
    await updateProduct(p.id, { ...p, stock_quantity: newStock })
    setIsLoading(false)
  }

  const handleSaveCategory = async () => {
    try {
      setIsLoading(true)
      setSaveError(null)
      
      const formData = new FormData()
      formData.append('name', categoryForm.name)
      if (categoryForm.parent_id) {
        formData.append('parent_id', categoryForm.parent_id)
      }
      
      const result = await createCategory(formData)
      if (result && !result.success) {
        setSaveError(result.error || 'Failed to create category.')
      } else {
        setShowCategoryForm(false)
        setCategoryForm({ name: '', parent_id: '' })
      }
    } catch (err: any) {
      console.error(err)
      setSaveError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (deleteMode === 'relocate' && !relocateTargetId) {
      alert("Please select a target folder to move contents to.")
      return
    }
    
    setIsLoading(true)
    const result = await deleteCategoryWithOptions(id, deleteMode, relocateTargetId)
    setIsLoading(false)
    if (result && !result.success) {
      alert(`Error deleting category: ${result.error}`)
    } else {
      setDeleteCategoryTarget(null)
      // If we are currently inside the deleted folder, we should go back home
      if (currentFolder === id) {
        setCurrentFolder(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[Outfit,sans-serif] font-black text-2xl text-brand-charcoal mb-1">Catalog Explorer</h1>
          <p className="text-brand-gray font-[Inter,sans-serif] text-sm">Deep Taxonomy System</p>
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
            onClick={() => {
              setSaveError(null)
              setCategoryForm({ name: '', parent_id: currentFolder || '' })
              setShowCategoryForm(true)
            }}
            className="btn-outline flex items-center gap-2 py-2.5 px-4 flex-1 sm:flex-none justify-center border-brand-emerald text-brand-emerald hover:bg-brand-emerald/10"
          >
            <FolderPlus size={18} />
            New Category
          </button>
          <button
            onClick={openAdd}
            className="btn-primary flex items-center gap-2 py-2.5 px-4 flex-1 sm:flex-none justify-center"
          >
            <Plus size={18} />
            New Product
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-4">
        <div className="flex items-center gap-3 bg-brand-offwhite rounded-xl px-4 py-2.5 border border-brand-light-gray focus-within:border-brand-emerald transition-colors">
          <Search size={16} className="text-brand-gray" />
          <input
            type="text"
            placeholder="Search entire catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm font-[Inter,sans-serif] text-brand-charcoal placeholder-brand-gray outline-none w-full"
          />
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {!search && (
        <div className="flex items-center gap-2 text-sm font-[Outfit,sans-serif] font-semibold text-brand-gray overflow-x-auto pb-2 scrollbar-hide whitespace-nowrap">
          <button 
            onClick={() => setCurrentFolder(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${!currentFolder ? 'bg-brand-emerald/10 text-brand-emerald' : 'hover:bg-brand-offwhite'}`}
          >
            <Home size={15} /> Catalog Home
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-brand-light-gray flex-shrink-0" />
              <button
                onClick={() => setCurrentFolder(crumb.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${idx === breadcrumbs.length - 1 ? 'bg-brand-emerald/10 text-brand-emerald' : 'hover:bg-brand-offwhite'}`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Folders Grid */}
      {!search && visibleCategories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {visibleCategories.map(cat => (
            <div
              key={cat.id}
              className="relative card p-4 flex flex-col items-center justify-center hover:border-brand-emerald hover:shadow-md transition-all group aspect-square text-center bg-gradient-to-b from-white to-brand-offwhite/30"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteCategoryTarget(cat) }}
                className="absolute top-2 right-2 p-1.5 rounded-lg text-brand-gray/50 hover:text-red-500 hover:bg-red-50 transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100 z-10"
                title="Delete Folder"
              >
                <Trash2 size={15} />
              </button>
              
              <button onClick={() => setCurrentFolder(cat.id)} className="flex flex-col items-center w-full h-full justify-center gap-3">
                <div className="w-14 h-14 bg-brand-emerald/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-emerald/10 transition-transform">
                  <Folder className="text-brand-emerald" size={28} strokeWidth={2.5} />
                </div>
                <span className="font-[Outfit,sans-serif] font-bold text-sm text-brand-charcoal line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Products Display (Table/Cards) */}
      {(search || currentFolder) && displayProducts.length > 0 && (
        <div className="mt-8">
          <h3 className="font-[Outfit,sans-serif] font-bold text-brand-gray mb-4 uppercase tracking-wider text-xs">
            {search ? 'Search Results' : 'Products in Folder'}
          </h3>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" aria-label="Admin products table">
                <thead>
                  <tr className="bg-brand-offwhite border-b border-brand-light-gray">
                    <th className="px-4 py-3 w-10 text-center">
                      <button onClick={toggleSelectAll} className="text-brand-gray hover:text-brand-charcoal">
                        {selectedIds.size === displayProducts.length && displayProducts.length > 0 ? <CheckSquare size={18} className="text-brand-emerald"/> : <Square size={18}/>}
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
                  {displayProducts.map((p) => {
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

          {/* Mobile Card View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayProducts.map((p) => {
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
        </div>
      )}

      {/* Add / Edit Form Modal */}
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
              {/* Core Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cascading Category Selectors */}
                <div className="sm:col-span-2 p-4 bg-brand-offwhite rounded-xl border border-brand-light-gray mb-2">
                  <h3 className="text-xs font-[Outfit,sans-serif] font-bold text-brand-charcoal uppercase tracking-wider mb-3">Product Placement</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-[Inter,sans-serif] font-semibold text-brand-gray mb-1 uppercase">Root Category</label>
                      <select 
                        value={formRootCategory} 
                        onChange={(e) => {
                          setFormRootCategory(e.target.value)
                          // Auto select first subcategory or just the root if no subs
                          const subs = categories.filter(c => c.parent_id === e.target.value)
                          setForm({ ...form, category_id: subs.length > 0 ? subs[0].id : e.target.value })
                        }} 
                        className="w-full border border-brand-light-gray rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-emerald bg-white"
                      >
                        <option value="">Select Root Category...</option>
                        {rootCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-[Inter,sans-serif] font-semibold text-brand-gray mb-1 uppercase">Subcategory (Optional)</label>
                      <select 
                        value={form.category_id} 
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })} 
                        className="w-full border border-brand-light-gray rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-emerald bg-white"
                        disabled={!formRootCategory || categories.filter(c => c.parent_id === formRootCategory).length === 0}
                      >
                        <option value={formRootCategory}>Same as Root Category</option>
                        {categories.filter(c => c.parent_id === formRootCategory).map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal uppercase tracking-wide">Product Name *</label>
                    <button 
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={isGeneratingAI || !form.name.trim()}
                      className="text-xs font-semibold px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles size={12} /> {isGeneratingAI ? 'Thinking...' : '✨ Auto-Fill with AI'}
                    </button>
                  </div>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. iPhone 15 Pro Max" className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald" />
                </div>
                
                <div>
                  <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">Price (₦) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald" />
                </div>
                <div>
                  <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1 uppercase tracking-wide">Discount Price (₦)</label>
                  <input type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} placeholder="Optional" className="w-full border border-brand-light-gray rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-emerald" />
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

              {/* Multi-Image Upload */}
              <div className="bg-brand-offwhite rounded-2xl p-4 border border-brand-light-gray">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-[Outfit,sans-serif] font-bold text-sm text-brand-charcoal flex items-center gap-2">
                      <ImageIcon size={14} /> Product Images
                    </h3>
                    <p className="text-[10px] text-brand-gray font-[Inter,sans-serif] uppercase tracking-wider mt-0.5 flex items-center gap-1">
                      <span>Up to 6 images — Auto-compressed to WebP</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-brand-gray bg-white border border-brand-light-gray px-2 py-1 rounded-full">
                    {imagePreviews.length} / 6
                  </span>
                </div>

                {/* Compression In-Progress Banner */}
                {isCompressingImages && (
                  <div className="mb-3 flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs animate-pulse">
                    <Loader2 size={16} className="animate-spin text-emerald-600 shrink-0" />
                    <span className="font-semibold">Optimizing & compressing image(s) to high-speed WebP...</span>
                  </div>
                )}

                {/* Drag & Drop Zone */}
                {imagePreviews.length < 6 && (
                  <label
                    htmlFor="multi-image-input"
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleImageFilesChange(e.dataTransfer.files) }}
                    className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl py-6 cursor-pointer transition-all ${
                      isDragging ? 'border-brand-emerald bg-brand-emerald/10' : 'border-brand-light-gray hover:border-brand-emerald hover:bg-brand-emerald/5'
                    }`}
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-brand-light-gray shadow-sm">
                      <ImageIcon size={18} className="text-brand-emerald" />
                    </div>
                    <p className="text-xs font-semibold text-brand-charcoal">
                      {isDragging ? 'Drop images here!' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-[10px] text-brand-gray">PNG, JPG, WEBP — Instant auto-compression</p>
                    <input
                      id="multi-image-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={isCompressingImages}
                      onChange={(e) => handleImageFilesChange(e.target.files)}
                    />
                  </label>
                )}

                {/* Image Previews Grid */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2.5">
                    {imagePreviews.map((src, idx) => {
                      const meta = imageMeta[idx]
                      const hasSavings = meta && meta.originalSize > meta.size && meta.size > 0
                      const savedPercent = hasSavings ? Math.round((1 - meta.size / meta.originalSize) * 100) : 0

                      return (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-brand-light-gray bg-white shadow-xs">
                          <img src={src} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Badges Overlay */}
                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start pointer-events-none">
                            {idx === 0 && (
                              <span className="bg-brand-emerald text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                                COVER
                              </span>
                            )}
                            {meta && meta.size > 0 && (
                              <span className="bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                                <Zap size={9} className="text-amber-400 fill-amber-400" />
                                {formatBytes(meta.size)}
                                {hasSavings && (
                                  <span className="text-emerald-400 text-[8px]">
                                    (-{savedPercent}%)
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-md"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )
                    })}
                    {/* Add More Slot */}
                    {imagePreviews.length < 6 && (
                      <label htmlFor="multi-image-input" className="aspect-square rounded-xl border-2 border-dashed border-brand-light-gray flex flex-col items-center justify-center cursor-pointer hover:border-brand-emerald hover:bg-brand-emerald/5 transition-all">
                        <Plus size={18} className="text-brand-gray" />
                        <span className="text-[9px] font-semibold text-brand-gray mt-1">Add More</span>
                      </label>
                    )}
                  </div>
                )}
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

      {/* Add Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[Outfit,sans-serif] font-bold text-lg text-brand-charcoal">
                New Category
              </h2>
              <button onClick={() => setShowCategoryForm(false)} className="p-2 rounded-lg hover:bg-brand-offwhite transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Laptops"
                  className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-[Outfit,sans-serif] font-semibold text-brand-charcoal mb-1.5 uppercase tracking-wide">Place Inside Folder (Optional)</label>
                <select
                  value={categoryForm.parent_id}
                  onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
                  className="w-full border border-brand-light-gray rounded-xl px-4 py-2.5 text-sm font-[Inter,sans-serif] outline-none focus:border-brand-emerald bg-white"
                >
                  <option value="">Top Level (Root)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {saveError && (
              <div className="mt-4 bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
                {saveError}
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCategoryForm(false)} disabled={isLoading} className="flex-1 btn-outline py-2.5">Cancel</button>
              <button onClick={handleSaveCategory} disabled={isLoading || !categoryForm.name.trim()} className="flex-1 btn-primary py-2.5 disabled:opacity-50">
                {isLoading ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCategoryTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h2 className="font-[Outfit,sans-serif] font-black text-xl text-brand-charcoal">Delete Folder?</h2>
                  <p className="text-brand-gray text-xs font-[Inter,sans-serif]">Deleting <strong className="text-brand-charcoal">{deleteCategoryTarget.name}</strong></p>
                </div>
              </div>
              <button onClick={() => setDeleteCategoryTarget(null)} className="p-2 rounded-lg hover:bg-brand-offwhite text-brand-gray">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <label className="flex gap-3 p-4 border border-brand-light-gray rounded-xl cursor-pointer hover:border-brand-emerald transition-colors">
                <input 
                  type="radio" 
                  name="deleteMode" 
                  checked={deleteMode === 'relocate'}
                  onChange={() => setDeleteMode('relocate')}
                  className="mt-1 accent-brand-emerald"
                />
                <div className="flex-1">
                  <span className="block font-[Outfit,sans-serif] font-bold text-sm text-brand-charcoal mb-1">Only delete folder, keep contents</span>
                  <p className="text-xs text-brand-gray">Move all products and sub-folders to another location.</p>
                  
                  {deleteMode === 'relocate' && (
                    <div className="mt-3">
                      <select 
                        value={relocateTargetId} 
                        onChange={(e) => setRelocateTargetId(e.target.value)}
                        className="w-full border border-brand-light-gray rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-emerald bg-white"
                      >
                        <option value="">Select destination folder...</option>
                        {categories.filter(c => c.id !== deleteCategoryTarget.id).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </label>
              
              <label className="flex gap-3 p-4 border border-red-100 rounded-xl cursor-pointer hover:border-red-500 transition-colors bg-red-50/30">
                <input 
                  type="radio" 
                  name="deleteMode" 
                  checked={deleteMode === 'cascade'}
                  onChange={() => setDeleteMode('cascade')}
                  className="mt-1 accent-red-500"
                />
                <div>
                  <span className="block font-[Outfit,sans-serif] font-bold text-sm text-red-600 mb-1 flex items-center gap-2">
                    Delete folder and everything inside it <AlertTriangle size={14} />
                  </span>
                  <p className="text-xs text-red-500/80">This will permanently delete this category, all its subcategories, and all products within them. This action cannot be undone.</p>
                </div>
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setDeleteCategoryTarget(null)} disabled={isLoading} className="btn-outline py-2.5 px-6 font-semibold">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteCategoryTarget.id)}
                disabled={isLoading || (deleteMode === 'relocate' && !relocateTargetId)}
                className={`py-2.5 px-6 rounded-lg font-[Outfit,sans-serif] font-bold text-sm transition-colors text-white disabled:opacity-50 ${
                  deleteMode === 'cascade' ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-charcoal hover:bg-black'
                }`}
              >
                {isLoading ? 'Processing...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
