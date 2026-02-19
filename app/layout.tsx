import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
/*test*/
export const metadata: Metadata = {
  title: "Family & Home - Admin Dashboard",
  description: "E-commerce Admin Dashboard",
  icons: {
    icon: "/family_home_logo.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
