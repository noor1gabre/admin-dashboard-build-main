"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Order {
  id: number
  customer_name: string
  customer_phone: string
  customer_address: string
  items_summary: string
  total_price: number
  receipt_url: string
  status: string
  created_at: string
}

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"]
/*test*/
export default function OrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Approval Modal State
  const [approvalOpen, setApprovalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [weight, setWeight] = useState("")

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/v1/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchOrders()
  }, [token])

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/v1/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      const updatedOrder = await response.json()
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
    } catch (error) {
      console.error(error)
      alert("Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleApproveClick = (order: Order) => {
    setSelectedOrder(order)
    setWeight("") // Reset weight
    setApprovalOpen(true)
  }

  const handleConfirmApproval = async () => {
    if (!selectedOrder || !weight) return;

    setUpdatingId(selectedOrder.id)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

      const formData = new FormData()
      formData.append("weight", weight)

      const response = await fetch(`${apiUrl}/api/v1/admin/orders/${selectedOrder.id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to approve order")

      const data = await response.json()
      // Backend now returns { order: ..., user_whatsapp_link: ... }
      const updatedOrder = data.order || data // Fallback for safety
      const userWaLink = data.user_whatsapp_link

      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o))
      setApprovalOpen(false)

      if (userWaLink) {
        // Open WhatsApp to notify user
        window.open(userWaLink, '_blank')
        alert(`Order #${selectedOrder.id} Approved & Shipped! WhatsApp opened for customer notification. 🚀`)
      } else {
        alert(`Order #${selectedOrder.id} Approved & Shipment Created! 🚀`)
      }

    } catch (error) {
      console.error(error)
      alert("Failed to approve order. Check console.")
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredOrders = orders.filter(order =>
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toString().includes(searchQuery) ||
    order.customer_phone.includes(searchQuery)
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "shipped": return "bg-indigo-100 text-indigo-800"
      case "delivered": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) return <div className="p-8 text-center">Loading orders...</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-[#2A6F80]">Orders Management</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2A6F80]/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Receipt</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">#{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">{order.customer_phone}</div>
                        <div className="text-xs text-gray-500 max-w-[150px] truncate" title={order.customer_address}>
                          {order.customer_address}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate" title={order.items_summary}>
                        {order.items_summary}
                      </td>
                      <td className="px-6 py-4 font-bold">
                        {order.total_price.toFixed(2)} EGP
                      </td>
                      <td className="px-6 py-4">
                        {order.receipt_url && (
                          <a
                            href={order.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2A6F80] hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink size={12} />
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            className="bg-[#2A6F80] hover:bg-[#1f5562] text-white"
                            onClick={() => handleApproveClick(order)}
                            disabled={updatingId === order.id}
                          >
                            {updatingId === order.id ? "..." : "Approve & Ship"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Approve Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Review the payment receipt and enter package weight to initiate shipment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {selectedOrder?.receipt_url && (
              <div className="flex justify-center mb-4">
                <a href={selectedOrder.receipt_url} target="_blank" rel="noreferrer">
                  <img
                    src={selectedOrder.receipt_url}
                    alt="Receipt"
                    className="max-h-[200px] rounded border hover:scale-105 transition-transform cursor-zoom-in"
                  />
                </a>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g. 5.0"
                className="col-span-3"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setApprovalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleConfirmApproval} disabled={!weight || updatingId !== null}>
              {updatingId ? "Processing..." : "Confirm & Ship"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
