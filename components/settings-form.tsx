"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

interface AdminProfile {
  id: number
  email: string
  full_name?: string
  whatsapp_number?: string
  role: string
}

export function SettingsForm() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    whatsapp_number: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getAdminProfile()
      setProfile(data)
      setFormData({
        email: data.email,
        full_name: data.full_name || "",
        whatsapp_number: data.whatsapp_number || "",
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to load profile. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address" })
      return false
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" })
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)
      const updateData: any = {
        email: formData.email,
        full_name: formData.full_name,
        whatsapp_number: formData.whatsapp_number,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const updatedProfile = await apiClient.updateAdminSettings(updateData)
      setProfile(updatedProfile)
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }))
      setMessage({ type: "success", text: "Settings updated successfully!" })
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to update settings",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A6F80]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your admin profile and account information</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert
              className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              <AlertCircle className={`h-4 w-4 ${message.type === "success" ? "text-green-600" : "text-red-600"}`} />
              <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
              <Input
                type="tel"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full"
              />
            </div>

            {/* Password Section */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
              <p className="text-xs text-gray-600 mb-4">Leave blank to keep your current password</p>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t">
              <Button type="submit" disabled={submitting} className="bg-[#2A6F80] hover:bg-[#1f4f5a] text-white flex-1">
                {submitting ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => loadProfile()} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Profile Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Admin Role:</span>
              <span className="font-medium text-gray-900">{profile?.role || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Account Created:</span>
              <span className="font-medium text-gray-900">Admin Account</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
