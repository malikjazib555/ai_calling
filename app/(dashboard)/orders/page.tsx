'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Search, Filter } from 'lucide-react'

interface Order {
  id: string
  customer_name: string
  phone: string
  item: string
  quantity: number
  address: string
  status: string
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        // Ensure data is an array
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch(error => {
        console.error('Error fetching orders:', error)
        setOrders([])
      })
  }, [])

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.item.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const exportOrders = () => {
    const csv = [
      ['Customer Name', 'Phone', 'Item', 'Quantity', 'Address', 'Status', 'Date'],
      ...filteredOrders.map(order => [
        order.customer_name,
        order.phone,
        order.item,
        order.quantity.toString(),
        order.address,
        order.status,
        new Date(order.created_at).toLocaleDateString(),
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-white/60 mt-1">Manage customer orders collected from calls</p>
        </div>
        <Button onClick={exportOrders} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Address</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-white/60">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium">{order.customer_name}</td>
                      <td className="px-4 py-3 text-white/80">{order.phone}</td>
                      <td className="px-4 py-3">{order.item}</td>
                      <td className="px-4 py-3">{order.quantity}</td>
                      <td className="px-4 py-3 text-white/80">{order.address}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          order.status === 'fulfilled' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

