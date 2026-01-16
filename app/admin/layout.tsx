"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { token, isLoading } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/")
    }
  }, [token, isLoading, router])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!token) {
    return null
  }

  return (
    <div className="flex h-screen bg-[#F9F9F9]">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 overflow-auto flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden bg-[#2A6F80] text-white p-4 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-lg font-bold">Family & Home</h1>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
      </div>
    </div>
  )
}
