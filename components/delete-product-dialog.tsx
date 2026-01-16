"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api"
import { AlertCircle } from "lucide-react"

interface DeleteProductDialogProps {
  isOpen: boolean
  product: { id: number; name: string } | null
  onClose: () => void
  onSuccess: () => void
}

export function DeleteProductDialog({ isOpen, product, onClose, onSuccess }: DeleteProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!product) return

    setError("")
    setIsLoading(true)

    try {
      await apiClient.deleteProduct(product.id)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to delete product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Delete Product</DialogTitle>
          <DialogDescription>Are you sure you want to delete "{product?.name}"?</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 mt-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          This action cannot be undone.
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="rounded-lg bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            {isLoading ? "Deleting..." : "Delete Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
