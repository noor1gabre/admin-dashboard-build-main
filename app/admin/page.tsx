"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Package } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { apiClient } from "@/lib/api"

const COLORS = ["#2A6F80", "#FF8C78", "#94a3b8", "#fbbf24", "#a3e635"]

interface AnalyticsData {
  kpis: { label: string; value: string; trend: string; trend_direction: string }[]
  revenue_history: { name: string; value: number }[]
  order_status_distribution: { name: string; value: number }[]
  recent_orders: { id: string; customer: string; date: string; amount: string; status: string }[]
  total_active_orders: number
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analyticsData = await apiClient.getAnalytics()
        setData(analyticsData)
      } catch (error) {
        console.error("Failed to load analytics", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load data.</div>
  }

  // Map backend ChartData to Recharts format (value -> total for bar chart to match old key if needed, or just use value)
  // Backend returns 'value', so we use dataKey="value" for charts

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Business Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-sm text-slate-600">
          <Calendar size={16} className="text-[#2A6F80]" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.kpis.map((kpi, index) => {
          let Icon = DollarSign
          let iconBg = "bg-[#2A6F80]/10"
          let iconColor = "text-[#2A6F80]"

          if (kpi.label.includes("Orders")) {
            Icon = ShoppingBag
            iconBg = "bg-[#FF8C78]/10"
            iconColor = "text-[#FF8C78]"
          } else if (kpi.label.includes("Avg")) {
            Icon = TrendingUp
            iconBg = "bg-slate-100"
            iconColor = "text-slate-600"
          }

          const isUp = kpi.trend_direction === "up"

          return (
            <Card key={index} className="rounded-xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{kpi.label}</CardTitle>
                <div className={`h-8 w-8 rounded-full ${iconBg} flex items-center justify-center`}>
                  <Icon size={16} className={iconColor} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{kpi.value}</div>
                <p className={`text-xs ${isUp ? 'text-emerald-600' : 'text-rose-500'} flex items-center gap-1 mt-1 font-medium`}>
                  {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {kpi.trend}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 rounded-xl border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Revenue History</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenue_history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="value" fill="#2A6F80" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Chart */}
        <Card className="lg:col-span-1 rounded-xl border-slate-100 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Order Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center relative">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.order_status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.order_status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[40%] text-center pointer-events-none">
              <p className="text-2xl font-bold text-slate-800">{data.total_active_orders}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card className="rounded-xl border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100/50 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">Recent VIP Orders</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-slate-400" />
                        {order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{order.customer}</td>
                    <td className="px-6 py-4 text-slate-500">{order.date}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status === "Delivered"
                            ? "bg-teal-50 text-teal-700 border-teal-100"
                            : order.status === "Processing"
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
