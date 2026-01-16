"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { apiClient } from "@/lib/api"
import { CheckCircle, AlertCircle } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image_url: string
  gallery?: string[]
}

interface EditProductFormProps {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onSuccess: () => void
}

export function EditProductForm({ isOpen, product, onClose, onSuccess }: EditProductFormProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [existingGallery, setExistingGallery] = useState<string[]>([])
  const [newFilesPreview, setNewFilesPreview] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (product && isOpen) {
      setName(product.name)
      setPrice(product.price.toString())
      setCategory(product.category)
      setDescription(product.description)
      const initialExisting =
        product.gallery && product.gallery.length > 0
          ? product.gallery
          : product.image_url
            ? [product.image_url]
            : []
      setExistingGallery(initialExisting)
      setNewFilesPreview([])
      setFiles([])
      setError("")
      setIsSuccess(false)
    }
  }, [product, isOpen])

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
            setNewFilesPreview(readers)
          }
        }
        reader.readAsDataURL(file)
      })
    } else {
      setFiles([])
      setNewFilesPreview([])
    }
  }

  const handleRemoveExisting = (index: number) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveNew = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setNewFilesPreview((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setError("")
    setIsSuccess(false)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("price", Number.parseFloat(price).toString())
      formData.append("category", category)
      formData.append("description", description)
      formData.append("existing_gallery", JSON.stringify(existingGallery))
      files.forEach((file) => formData.append("files", file))

      await apiClient.updateProduct(product.id, formData)

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        setIsSuccess(false)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Failed to update product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[500px] flex flex-col h-full overflow-hidden">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-2xl">Edit Product</SheetTitle>
          <SheetDescription>Update the product details below</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-0">
          <form onSubmit={handleSubmit} className="space-y-6 px-6">
            <div className="space-y-3">
              <Label htmlFor="edit-name" className="text-sm font-semibold">
                Product Name *
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cozy Blanket"
                disabled={isLoading}
                required
                className="h-10 rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="edit-price" className="text-sm font-semibold">
                Price ($) *
              </Label>
              <Input
                id="edit-price"
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

            <div className="space-y-3">
              <Label htmlFor="edit-category" className="text-sm font-semibold">
                Category *
              </Label>
              <Input
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Home Decor"
                disabled={isLoading}
                required
                className="h-10 rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="edit-description" className="text-sm font-semibold">
                Description
              </Label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                className="w-full px-3 py-2 border border-input rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#2A6F80]/30"
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="edit-image" className="text-sm font-semibold">
                Product Images
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#2A6F80] transition-colors cursor-pointer">
                <input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <label htmlFor="edit-image" className="cursor-pointer block">
                  <div className="text-sm text-muted-foreground">Click to upload or drag and drop</div>
                </label>
              </div>

              {existingGallery.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Current images</div>
                  <div className="grid grid-cols-2 gap-3">
                    {existingGallery.map((src, index) => (
                      <div
                        key={`existing-${index}`}
                        className="rounded-lg overflow-hidden border border-gray-200 relative"
                      >
                        <img src={src || "/placeholder.svg"} alt="Current" className="w-full h-auto" />
                        <button
                          type="button"
                          onClick={() => handleRemoveExisting(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                        <div className="p-2 bg-gray-50 text-xs text-muted-foreground text-center">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newFilesPreview.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">New images to add</div>
                  <div className="grid grid-cols-2 gap-3">
                    {newFilesPreview.map((src, index) => (
                      <div
                        key={`new-${index}`}
                        className="rounded-lg overflow-hidden border border-gray-200 relative"
                      >
                        <img src={src || "/placeholder.svg"} alt="New" className="w-full h-auto" />
                        <button
                          type="button"
                          onClick={() => handleRemoveNew(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                        <div className="p-2 bg-gray-50 text-xs text-muted-foreground text-center">
                          New {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Product updated successfully!</p>
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
            {isLoading ? "Updating..." : isSuccess ? "Updated!" : "Update Product"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
