import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from './lib/supabase/config'

async function run() {
  console.log("Starting test...")
  try {
    const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey())
    const { data, error } = await supabase.from('products').insert({
      name: 'Test Product',
      description: 'Test',
      price: 1000,
      stock_quantity: 10,
      sku: 'TEST',
      category_id: '8248aea5-26fe-4b37-92b1-5d9787593028',
      slug: 'test-product',
      images: [],
    })
    console.log("Result:", { data, error })
  } catch (err) {
    console.error("Caught error:", err)
  }
}
run()
