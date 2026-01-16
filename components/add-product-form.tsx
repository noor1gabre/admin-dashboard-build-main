"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { apiClient } from "@/lib/api"
import { CheckCircle, AlertCircle } from "lucide-react"

interface AddProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddProductForm({ isOpen, onClose, onSuccess }: AddProductFormProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles)
      const readers: string[] = []
      selectedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          readers.push(reader.result as string)
          if (readers.length === selectedFiles.length) {
            setPreview(readers)
          }
        }
        reader.readAsDataURL(file)
      })
    } else {
      setFiles([])
      setPreview([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSuccess(false)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("price", Number.parseFloat(price).toString())
      formData.append("category", category)
      formData.append("description", description)
      files.forEach((file) => formData.append("files", file))

      await apiClient.createProduct(formData)

      setIsSuccess(true)

      // Reset form
      setName("")
      setPrice("")
      setCategory("")
      setDescription("")
      setFiles([])
      setPreview([])

      // Brief delay to show success state
      setTimeout(() => {
        onSuccess()
        onClose()
        setIsSuccess(false)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] flex flex-col h-full overflow-hidden">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-2xl">Add New Product</SheetTitle>
          <SheetDescription>Fill in the product details below</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-0">
          <form onSubmit={handleSubmit} className="space-y-6 px-6">
            {/* Product Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold">
                Product Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cozy Blanket"
                disabled={isLoading}
                required
                className="h-10 rounded-lg"
              />
            </div>

            {/* Price */}
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-semibold">
                Price ($) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                disabled={isLoading}
                required
                className="h-10 rounded-lg"
              />
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label htmlFor="category" className="text-sm font-semibold">
                Category *
              </Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Home Decor"
                disabled={isLoading}
                required
                className="h-10 rounded-lg"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                className="w-full px-3 py-2 border border-input rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2A6F80]/30"
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label htmlFor="image" className="text-sm font-semibold">
                Product Image
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#2A6F80] transition-colors cursor-pointer">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer block">
                  <div className="text-sm text-muted-foreground">Click to upload or drag and drop</div>
                </label>
              </div>

              {preview.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {preview.map((src, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                      <img src={src || "/placeholder.svg"} alt="Preview" className="w-full h-auto" />
                      <div className="p-2 bg-gray-50 text-xs text-muted-foreground text-center">Image {index + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success State */}
            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Product added successfully!</p>
              </div>
            )}
          </form>
        </div>

        <SheetFooter className="border-t pt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border-gray-200 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isSuccess}
            className="flex-1 bg-[#FF8C78] hover:bg-[#ff7a63] text-white rounded-lg h-10"
          >
            {isLoading ? "Adding..." : isSuccess ? "Added!" : "Add Product"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
