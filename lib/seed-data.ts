// ============================================================
// MOCK SEED DATA — MARKSONGLOBAL STORES
// Replace these with live Supabase queries when going live.
// All mock data is clearly typed against the DB schema.
// ============================================================

export type Category = {
  id: string
  name: string
  slug: string
  icon_url: string | null
}

export type Product = {
  id: string
  category_id: string
  name: string
  slug: string
  description: string
  price: number
  discount_price: number | null
  is_deal: boolean
  stock_quantity: number
  sku: string
  images: string[]
  specifications: Record<string, string> | null
}

// MOCK DATA — Replace with: const { data } = await supabase.from('categories').select('*')
export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-groceries',
    name: 'Groceries & Provisions',
    slug: 'groceries',
    icon_url: null,
  },
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon_url: null,
  },
]

// MOCK DATA — Replace with: const { data } = await supabase.from('products').select('*')
export const MOCK_PRODUCTS: Product[] = [
  // ── Groceries ──────────────────────────────────────────────
  {
    id: 'prod-001',
    category_id: 'cat-groceries',
    name: 'Peak Full Cream Milk (400g)',
    slug: 'peak-full-cream-milk-400g',
    description: 'Rich, nutritious full cream powdered milk for the whole family.',
    price: 3500,
    discount_price: 2999,
    is_deal: true,
    stock_quantity: 120,
    sku: 'GRC-PEAK-400',
    images: ['/mock/peak-milk.jpg'],
    specifications: { weight: '400g', brand: 'Peak', type: 'Full Cream' },
  },
  {
    id: 'prod-002',
    category_id: 'cat-groceries',
    name: 'Indomie Instant Noodles Chicken (70g × 40)',
    slug: 'indomie-chicken-70g-40pack',
    description: 'Classic Indomie chicken flavour, carton of 40 packs.',
    price: 8200,
    discount_price: null,
    is_deal: false,
    stock_quantity: 85,
    sku: 'GRC-INDOMIE-CHK40',
    images: ['/mock/indomie.jpg'],
    specifications: { weight: '70g × 40', brand: 'Indomie', flavour: 'Chicken' },
  },
  {
    id: 'prod-003',
    category_id: 'cat-groceries',
    name: 'Dangote Sugar (1kg)',
    slug: 'dangote-sugar-1kg',
    description: 'Pure refined white sugar, great for home and baking use.',
    price: 1800,
    discount_price: 1650,
    is_deal: true,
    stock_quantity: 200,
    sku: 'GRC-DANG-SGR1',
    images: ['/mock/sugar.jpg'],
    specifications: { weight: '1kg', brand: 'Dangote', type: 'Refined White' },
  },
  {
    id: 'prod-004',
    category_id: 'cat-groceries',
    name: 'Golden Penny Semolina (2kg)',
    slug: 'golden-penny-semolina-2kg',
    description: 'Premium quality semolina for swallow meals.',
    price: 4200,
    discount_price: null,
    is_deal: false,
    stock_quantity: 60,
    sku: 'GRC-GP-SEMO2',
    images: ['/mock/semolina.jpg'],
    specifications: { weight: '2kg', brand: 'Golden Penny' },
  },
  {
    id: 'prod-005',
    category_id: 'cat-groceries',
    name: 'Titus Sardines in Tomato Sauce (125g)',
    slug: 'titus-sardines-tomato-125g',
    description: 'Ready-to-eat sardines packed in rich tomato sauce.',
    price: 900,
    discount_price: 750,
    is_deal: true,
    stock_quantity: 300,
    sku: 'GRC-TITUS-SARD',
    images: ['/mock/sardines.jpg'],
    specifications: { weight: '125g', brand: 'Titus', sauce: 'Tomato' },
  },
  {
    id: 'prod-006',
    category_id: 'cat-groceries',
    name: 'Sunlight Dishwashing Liquid (750ml)',
    slug: 'sunlight-dishwash-750ml',
    description: 'Powerful grease-cutting dishwashing liquid.',
    price: 1500,
    discount_price: null,
    is_deal: false,
    stock_quantity: 140,
    sku: 'GRC-SUNLGT-750',
    images: ['/mock/sunlight.jpg'],
    specifications: { volume: '750ml', brand: 'Sunlight' },
  },

  // ── Electronics ────────────────────────────────────────────
  {
    id: 'prod-007',
    category_id: 'cat-electronics',
    name: 'Anker PowerCore 10000 Power Bank',
    slug: 'anker-powercore-10000',
    description: 'Slim 10,000mAh power bank with high-speed charging for all devices.',
    price: 22000,
    discount_price: 18500,
    is_deal: true,
    stock_quantity: 45,
    sku: 'ELC-ANKR-PB10K',
    images: ['/mock/powerbank.jpg'],
    specifications: { capacity: '10,000mAh', brand: 'Anker', ports: '2 USB-A', weight: '180g' },
  },
  {
    id: 'prod-008',
    category_id: 'cat-electronics',
    name: 'JBL GO 3 Portable Bluetooth Speaker',
    slug: 'jbl-go3-bluetooth-speaker',
    description: 'Compact waterproof speaker with bold JBL Pro Sound and up to 5 hours playtime.',
    price: 35000,
    discount_price: 29999,
    is_deal: true,
    stock_quantity: 30,
    sku: 'ELC-JBL-GO3',
    images: ['/mock/jbl-go3.jpg'],
    specifications: { brand: 'JBL', battery: '5 hrs', waterproof: 'IP67', bluetooth: '5.1' },
  },
  {
    id: 'prod-009',
    category_id: 'cat-electronics',
    name: 'Oraimo FreePods 4 True Wireless Earbuds',
    slug: 'oraimo-freepods-4',
    description: 'Premium TWS earbuds with Active Noise Cancellation and 35hr total playtime.',
    price: 18500,
    discount_price: null,
    is_deal: false,
    stock_quantity: 55,
    sku: 'ELC-ORAI-FP4',
    images: ['/mock/earbuds.jpg'],
    specifications: { brand: 'Oraimo', battery: '35hrs total', ANC: 'Yes', connectivity: 'Bluetooth 5.3' },
  },
  {
    id: 'prod-010',
    category_id: 'cat-electronics',
    name: 'Syinix 43" FHD Smart TV',
    slug: 'syinix-43-fhd-smart-tv',
    description: 'Full HD Smart Android TV with built-in WiFi, Netflix & YouTube support.',
    price: 185000,
    discount_price: 165000,
    is_deal: false,
    stock_quantity: 12,
    sku: 'ELC-SYNX-43FHD',
    images: ['/mock/smart-tv.jpg'],
    specifications: { brand: 'Syinix', screen: '43"', resolution: '1920×1080', OS: 'Android TV', HDR: 'Yes' },
  },
  {
    id: 'prod-011',
    category_id: 'cat-electronics',
    name: 'Polystar 1.5HP Split Air Conditioner',
    slug: 'polystar-1-5hp-split-ac',
    description: 'Energy-efficient inverter split AC with fast cooling for rooms up to 25m².',
    price: 320000,
    discount_price: 299000,
    is_deal: false,
    stock_quantity: 8,
    sku: 'ELC-POLY-AC15',
    images: ['/mock/ac-unit.jpg'],
    specifications: { brand: 'Polystar', capacity: '1.5HP', type: 'Split Inverter', energy: 'A++' },
  },
  {
    id: 'prod-012',
    category_id: 'cat-electronics',
    name: 'Tecno SPARK 20 Pro (8GB + 256GB)',
    slug: 'tecno-spark-20-pro-8-256',
    description: 'Powerful smartphone with 108MP camera, 5000mAh battery, and 8GB RAM.',
    price: 155000,
    discount_price: 139000,
    is_deal: true,
    stock_quantity: 25,
    sku: 'ELC-TECO-SP20P',
    images: ['/mock/smartphone.jpg'],
    specifications: { brand: 'Tecno', RAM: '8GB', storage: '256GB', camera: '108MP', battery: '5000mAh', OS: 'Android 14' },
  },
]

export const MOCK_DEALS = MOCK_PRODUCTS.filter((p) => p.is_deal)
export const MOCK_GROCERIES = MOCK_PRODUCTS.filter((p) => p.category_id === 'cat-groceries')
export const MOCK_ELECTRONICS = MOCK_PRODUCTS.filter((p) => p.category_id === 'cat-electronics')
