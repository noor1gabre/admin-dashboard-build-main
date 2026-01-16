"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { token, isLoading } = useAuth()
    const pathname = usePathname()
    const router = useRouter()
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (!isLoading) {
            if (!token && pathname !== "/") {
                // If not authenticated and trying to access any page other than login, redirect
                router.push("/")
            } else if (token && pathname === "/") {
                // Optional: If authenticated and on login page, redirect to admin dashboard
                router.push("/admin")
            }
            setChecked(true)
        }
    }, [token, isLoading, pathname, router])

    // While checking auth state, we can show a loader or nothing
    // But to avoid flicker, we might render children if we are on the login page
    // or if we are already authenticated.

    // However, simple approach:
    if (isLoading) return null // or a global loader

    // If not on home page and no token, don't render children (avoid flash of content)
    if (!token && pathname !== "/") {
        return null
    }

    return <>{children}</>
}
