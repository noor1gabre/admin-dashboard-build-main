"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Activity,
  MoreHorizontal,
  Zap,
  Sparkles
} from "lucide-react"
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
  AreaChart,
  Area
} from "recharts"
import { apiClient } from "@/lib/api"
import Link from "next/link"
// --- Premium Color Palette (Matched to User Website HSL) ---
// Primary: HSL(170, 24%, 35%) -> #446E66
// Secondary: HSL(10, 75%, 58%) -> #E96C4E
const THEME = {
  primary: "#446E66",    // Deep Sage
  coral: "#E96C4E",      // Terra Cotta
  slate: "#64748b"
}

const PIE_COLORS = ["#446E66", "#E96C4E", "#6B8E87", "#F0917B"]

interface KPI {
  label: string
  value: string
  trend: string
  trend_direction: string
}

interface ChartData {
  name: string
  value: number
}

interface RecentOrder {
  id: string
  customer: string
  date: string
  amount: string
  status: string
}

interface AnalyticsData {
  kpis: KPI[]
  revenue_history: ChartData[]
  order_status_distribution: ChartData[]
  recent_orders: RecentOrder[]
  total_active_orders: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-border/60 p-4 rounded-xl shadow-lg">
        <p className="font-bold text-muted-foreground text-xs uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-center gap-3">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-primary to-secondary" />
          <div>
            <p className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ${new Intl.NumberFormat('en-US').format(payload[0].value)}
            </p>
            <p className="text-xs text-primary font-semibold mt-0.5">Revenue</p>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function PremiumAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analyticsData = await apiClient.getAnalytics()
        setData(analyticsData)
      } catch (err) {
        console.error("Failed to load analytics", err)
        setError("Failed to load analytics data")
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-muted rounded-full"></div>
          <div className="absolute inset-0 w-24 h-24 border-8 border-transparent border-t-primary border-r-secondary rounded-full animate-spin"></div>
          <div className="absolute inset-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
        </div>
        <p className="absolute mt-36 text-muted-foreground font-bold text-lg tracking-wide animate-pulse">Loading Analytics...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-destructive font-bold text-xl">{error || "Failed to load data"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden animate-fade-in-up">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10" />

      <div className="relative max-w-[1800px] mx-auto p-8 space-y-12">

        {/* Premium Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Activity className="text-primary" size={28} />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                  Analytics <span className="text-primary">Dashboard</span>
                </h1>
                <p className="text-muted-foreground mt-1 text-lg font-medium">
                  Real-time business intelligence & insights
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-card px-6 py-4 rounded-xl border border-border shadow-sm">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar size={20} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold leading-none mb-1">Live Date</span>
                <span className="text-sm font-bold text-foreground leading-none">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

        
          </div>
        </div>

        {/* Main KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.kpis.map((kpi, index) => {
            let Icon = DollarSign
            let iconBg = "bg-primary/10"
            let iconColor = "text-primary"

            if (kpi.label.includes("Orders")) {
              Icon = ShoppingBag
              iconBg = "bg-secondary/10"
              iconColor = "text-secondary"
            } else if (kpi.label.includes("Avg")) {
              Icon = Activity
              iconBg = "bg-primary/10"
              iconColor = "text-primary"
            }

            const isUp = kpi.trend_direction === "up"

            return (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <Card className="h-full border border-border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-card overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</CardTitle>
                    <div className={`p-3 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={20} />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold text-foreground">
                        {kpi.value}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border ${isUp
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {kpi.trend}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Revenue Area Chart */}
          <Card className="lg:col-span-2 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card">
            <CardHeader className="border-b border-border/50 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">Revenue Performance</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">6-month financial trend analysis</p>
                </div>
                <div className="p-2 bg-primary/5 rounded-lg">
                  <TrendingUp className="text-primary" size={20} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-8 pl-0 pr-6">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue_history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={THEME.primary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={15}
                      fontWeight={500}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value > 0 ? (value / 1000).toFixed(1) : 0}k`}
                      dx={-10}
                      fontWeight={500}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={THEME.primary}
                      strokeWidth={3}
                      fill="url(#colorRevenue)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Donut */}
          <Card className="lg:col-span-1 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card">
            <CardHeader className="border-b border-border/50 pb-6">
              <CardTitle className="text-xl font-bold text-foreground">Order Distribution</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Live status breakdown</p>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.order_status_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1500}
                    >
                      {data.order_status_distribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">
                      {data.total_active_orders}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-center gap-4 mt-4 flex-wrap">
                {data.order_status_distribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    ></div>
                    <span className="text-xs font-semibold text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Orders Table */}
        <Card className="rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card overflow-hidden">
          <CardHeader className="border-b border-border/50 px-8 py-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">Recent Transactions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest customer orders & activity</p>
            </div>
            <Link 
    href="/admin/orders" 
    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider flex items-center gap-1"
  >
    View All <ArrowUpRight size={14} />
  </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-8 py-5 text-left">Order ID</th>
                    <th className="px-6 py-5 text-left">Customer</th>
                    <th className="px-6 py-5 text-left">Date</th>
                    <th className="px-6 py-5 text-left">Amount</th>
                    <th className="px-8 py-5 text-right">Status</th>
                    <th className="px-6 py-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.recent_orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Package size={16} />
                          </div>
                          <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-foreground">{order.customer}</div>
                        <div className="text-[11px] text-muted-foreground font-medium mt-0.5">Premium Member</div>
                      </td>
                      <td className="px-6 py-5 text-muted-foreground font-medium">
                        {order.date}
                      </td>
                      <td className="px-6 py-5 text-base font-bold text-foreground">
                        {order.amount}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-wide ${order.status === "Delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : order.status === "Processing"
                              ? "bg-secondary/10 text-secondary border-secondary/20"
                              : "bg-slate-50 text-slate-600 border-slate-100"
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}