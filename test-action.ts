import { addProduct } from './lib/admin-actions'

async function run() {
  console.log("Starting server action test...")
  try {
    const fd = new FormData()
    fd.append('name', 'Test Action Product')
    fd.append('description', 'Test Description')
    fd.append('price', '1000')
    fd.append('stock_quantity', '10')
    fd.append('sku', 'TEST-ACT')
    fd.append('category_id', '8248aea5-26fe-4b37-92b1-5d9787593028')
    fd.append('is_deal', 'false')

    const res = await addProduct(fd)
    console.log("Result:", res)
  } catch (err) {
    console.error("Caught error:", err)
  }
}
run()
