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

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order? It will also cancel the shipment if possible.")) return;

    setUpdatingId(orderId)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/v1/admin/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to cancel order")

      const data = await response.json()
      const updatedOrder = data.order || data
      const userWaLink = data.user_whatsapp_link

      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))

      if (userWaLink) {
        window.open(userWaLink, '_blank')
        alert(`Order #${orderId} Cancelled! WhatsApp opened for customer notification.`)
      } else {
        alert(`Order #${orderId} Cancelled successfully.`)
      }

    } catch (error) {
      console.error(error)
      alert("Failed to cancel order.")
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
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200"
      case "processing": return "bg-blue-50 text-blue-700 border-blue-200"
      case "shipped": return "bg-indigo-50 text-indigo-700 border-indigo-200"
      case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  if (loading) return <div className="p-8 text-center">Loading orders...</div>

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2A6F80] tracking-tight">Orders Management</h1>
          <p className="text-gray-500 mt-1 min-w-8">Manage and track all customer orders</p>
        </div>
        <div className="relative w-full sm:w-72 shadow-sm rounded-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID, name, or phone..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2A6F80]/20 bg-white placeholder-gray-400 text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden rounded-xl">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2A6F80]/5 text-[#2A6F80] uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-center">Receipt</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50 rounded-b-lg">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-lg font-medium text-gray-900">No orders found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-all duration-200">
                      <td className="px-6 py-5 font-semibold text-gray-900">#{order.id}</td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-gray-900">{order.customer_name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span>📞</span> {order.customer_phone}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 max-w-[250px] leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">
                          <span className="font-medium text-gray-700 block mb-1">Delivery Address:</span>
                          {(() => {
                            try {
                              const addr = JSON.parse(order.customer_address)
                              return `${addr.street_address || ''}, ${addr.local_area || ''}, ${addr.city || ''}, ${addr.postal_code || ''}, ${addr.province || ''}`
                                .replace(/(^, |, $)/g, '').replace(/, ,/g, ',')
                            } catch (e) {
                              return order.customer_address
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="max-w-[200px] text-gray-600 leading-snug">
                          {order.items_summary.split(', ').map((item, i) => (
                            <div key={i} className="mb-1 bg-blue-50/50 text-blue-900 px-2 py-1 rounded text-xs border border-blue-100 inline-block mr-1">
                              {item}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-900 font-bold whitespace-nowrap">
                        R {order.total_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {order.receipt_url ? (
                          <a
                            href={order.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A6F80]/10 text-[#2A6F80] hover:bg-[#2A6F80]/20 rounded-md transition-colors text-xs font-medium"
                          >
                            <ExternalLink size={14} /> View
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-gray-600 whitespace-nowrap text-sm">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)} border shadow-sm`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right space-x-2 whitespace-nowrap">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            className="bg-[#2A6F80] hover:bg-[#1f5562] text-white shadow-sm transition-all hover:shadow-md"
                            onClick={() => handleApproveClick(order)}
                            disabled={updatingId === order.id}
                          >
                            {updatingId === order.id ? "Processing..." : "Approve & Ship"}
                          </Button>
                        )}
                        {['pending', 'processing', 'shipped'].includes(order.status) && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="shadow-sm hover:shadow-md transition-all"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={updatingId === order.id}
                          >
                            Cancel
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
