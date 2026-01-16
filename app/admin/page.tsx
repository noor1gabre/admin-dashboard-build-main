"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Package, Activity, CreditCard } from "lucide-react"
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
  Area,
  AreaChart,
} from "recharts"
import { apiClient } from "@/lib/api"

// --- Luxury Color Palette ---
const COLORS = [
  "#2A6F80", // Deep Teal (Primary)
  "#FF8C78", // Coral (Accent)
  "#94a3b8", // Muted Slate
  "#E2B93B", // Muted Gold (Luxury Accent)
]

interface AnalyticsData {
  kpis: { label: string; value: string; trend: string; trend_direction: string }[]
  revenue_history: { name: string; value: number }[]
  order_status_distribution: { name: string; value: number }[]
  recent_orders: { id: string; customer: string; date: string; amount: string; status: string }[]
  total_active_orders: number
}

// --- Custom Tooltip Component for Charts ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-4 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="font-medium text-slate-600 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2A6F80]" />
          <p className="text-xl font-bold text-slate-800">
            {typeof payload[0].value === 'number' 
              ? `$${new Intl.NumberFormat('en-US').format(payload[0].value)}`
              : payload[0].value}
          </p>
        </div>
      </div>
    )
  }
  return null
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
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#2A6F80] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Gathering Insights...</p>
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl">Failed to load analytics data.</div>
  }

  return (
    <div className="space-y-8 p-1">
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-in slide-in-from-top-5 duration-700">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Welcome back, <span className="font-medium text-[#2A6F80]">Admin</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white pl-4 pr-5 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm shadow-slate-200/50">
          <div className="p-2 bg-[#2A6F80]/5 rounded-lg">
            <Calendar size={18} className="text-[#2A6F80]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Today</span>
            <span className="text-sm font-semibold text-slate-700">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* --- KPI Cards Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.kpis.map((kpi, index) => {
          let Icon = DollarSign
          let themeColor = "text-[#2A6F80]"
          let gradientBg = "from-[#2A6F80]/5 to-[#2A6F80]/10"
          let ringColor = "ring-[#2A6F80]/20"

          if (kpi.label.includes("Orders")) {
            Icon = ShoppingBag
            themeColor = "text-[#FF8C78]"
            gradientBg = "from-[#FF8C78]/5 to-[#FF8C78]/10"
            ringColor = "ring-[#FF8C78]/20"
          } else if (kpi.label.includes("Avg")) {
            Icon = Activity
            themeColor = "text-[#E2B93B]" // Gold
            gradientBg = "from-[#E2B93B]/5 to-[#E2B93B]/10"
            ringColor = "ring-[#E2B93B]/20"
          }

          const isUp = kpi.trend_direction === "up"

          return (
            <div 
              key={index} 
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${gradientBg} rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500`}></div>
              <Card className="relative h-full border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{kpi.label}</CardTitle>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientBg} ${themeColor} ring-1 ${ringColor}`}>
                    <Icon size={20} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-800 tracking-tight">{kpi.value}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                      isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} 
                      {kpi.trend}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* --- Charts Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Chart (Enhanced) */}
        <Card className="lg:col-span-2 rounded-3xl border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Revenue Analytics</CardTitle>
                <p className="text-sm text-slate-500">Monthly revenue performance</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                 <TrendingUp size={18} className="text-[#2A6F80]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pl-0">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenue_history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={50}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2A6F80" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#2A6F80" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                    fontWeight={500}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value/1000}k`} 
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#colorRevenue)" 
                    radius={[12, 12, 0, 0]} 
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Chart (Enhanced Donut) */}
        <Card className="lg:col-span-1 rounded-3xl border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Order Status</CardTitle>
             <p className="text-sm text-slate-500">Real-time distribution</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center relative p-6">
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {data.order_status_distribution.map((entry, index) => (
                      <linearGradient key={`grad-${index}`} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1}/>
                         <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={data.order_status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={110}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                    animationBegin={200}
                  >
                    {data.order_status_distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#color-${index})`} 
                        className="stroke-white stroke-[4px] hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                    itemStyle={{ color: "#1e293b", fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Luxury Center Label */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-full w-32 h-32 shadow-inner">
                  <span className="text-4xl font-extrabold text-slate-800 tracking-tighter">
                    {data.total_active_orders}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              {data.order_status_distribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span>{entry.name}</span>
                  <span className="ml-auto font-bold opacity-50">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Recent Orders Table (Luxury) --- */}
      <Card className="rounded-3xl border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Recent Transactions</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Monitoring latest VIP orders</p>
            </div>
            <button className="text-sm font-semibold text-[#2A6F80] hover:text-[#1e4e5b] hover:bg-[#2A6F80]/5 px-4 py-2 rounded-lg transition-colors">
              View All Orders
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5 font-medium text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-[#2A6F80] group-hover:text-white transition-colors duration-300">
                          <Package size={16} />
                        </div>
                        <span className="font-mono text-xs">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-700">{order.customer}</div>
                      <div className="text-xs text-slate-400">Verified Client</div>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-medium">
                      {order.date}
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-800">
                      {order.amount}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                          order.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : order.status === "Processing"
                            ? "bg-[#FF8C78]/10 text-[#FF8C78] border-[#FF8C78]/20"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {order.status === "Delivered" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>}
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