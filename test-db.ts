import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from './lib/supabase/config'

async function run() {
  const supabase = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey())
  
  const { data: cats } = await supabase.from('categories').select('*')
  console.log("Categories:", cats)
  
}
run()
