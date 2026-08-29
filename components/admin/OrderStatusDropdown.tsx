'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/lib/admin-actions'

export default function OrderStatusDropdown({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setLoading(true)
    await updateOrderStatus(orderId, newStatus)
    setLoading(false)
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className={`text-xs font-semibold px-2 py-1 rounded-full outline-none capitalize cursor-pointer disabled:opacity-50
        ${status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
        ${status === 'processing' ? 'bg-purple-100 text-purple-700' : ''}
        ${status === 'shipped' ? 'bg-indigo-100 text-indigo-700' : ''}
        ${status === 'delivered' ? 'bg-green-100 text-green-700' : ''}
        ${status === 'cancelled' ? 'bg-red-100 text-red-600' : ''}
      `}
    >
      <option value="pending">Pending</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  )
}
