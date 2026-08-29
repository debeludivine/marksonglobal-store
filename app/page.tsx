import { redirect } from 'next/navigation'

// Root redirect — sends to the customer storefront
export default function RootPage() {
  redirect('/')
}
