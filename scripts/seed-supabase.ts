import { createClient } from '@supabase/supabase-js'
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../lib/seed-data'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('Creating storage bucket...')
  
  const { error: bucketError } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  })
  
  if (bucketError) {
    console.error('Error creating bucket (or it already exists):', bucketError.message)
  } else {
    console.log('Bucket "product-images" created successfully')
  }

  console.log('Seeding Supabase...')

  // Map old string IDs to new UUIDs
  const categoryIdMap: Record<string, string> = {}

  for (const cat of MOCK_CATEGORIES) {
    const newId = uuidv4()
    categoryIdMap[cat.id] = newId
    
    const { error } = await supabase.from('categories').insert({
      id: newId,
      name: cat.name,
      slug: cat.slug,
      icon_url: cat.icon_url,
    })

    if (error) {
      console.error(`Error inserting category ${cat.name}:`, error)
    } else {
      console.log(`Inserted category: ${cat.name}`)
    }
  }

  for (const prod of MOCK_PRODUCTS) {
    const { error } = await supabase.from('products').insert({
      id: uuidv4(),
      category_id: categoryIdMap[prod.category_id],
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      price: prod.price,
      discount_price: prod.discount_price,
      is_deal: prod.is_deal,
      stock_quantity: prod.stock_quantity,
      sku: prod.sku,
      images: prod.images,
      specifications: prod.specifications,
    })

    if (error) {
      console.error(`Error inserting product ${prod.name}:`, error)
    } else {
      console.log(`Inserted product: ${prod.name}`)
    }
  }

  console.log('Seeding complete!')
}

seed()
