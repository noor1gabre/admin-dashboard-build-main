"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import { AddProductForm } from "@/components/add-product-form"
import { EditProductForm } from "@/components/edit-product-form"
import { DeleteProductDialog } from "@/components/delete-product-dialog"
import { ProductGallery } from "@/components/product-gallery"
import { apiClient } from "@/lib/api"

interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image_url: string
  gallery?: string[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.getProducts()
      setProducts(data)
    } catch (err) {
      console.error("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsEditOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditOpen(false)
    setSelectedProduct(null)
  }

  const handleCloseDelete = () => {
    setIsDeleteOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">Products</h1>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#FF8C78] hover:bg-[#ff7a63] text-white rounded-lg px-4 md:px-6 gap-2 h-10 w-full sm:w-auto"
        >
          <Plus size={20} />
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <Card className="rounded-lg border border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">Loading products...</CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card className="rounded-lg border border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            No products yet. Add one to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-64 bg-gray-50 relative">
                <ProductGallery
                  images={product.gallery && product.gallery.length > 0 ? product.gallery : (product.image_url ? [product.image_url] : [])}
                  productName={product.name}
                />
              </div>

              {/* Product Info */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>

                <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>

                {product.gallery && product.gallery.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      Gallery preview
                    </div>
                    <div className="flex gap-1">
                      {product.gallery.slice(0, 4).map((url, index) => (
                        <div
                          key={index}
                          className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 bg-gray-50"
                        >
                          <img src={url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {product.gallery.length > 4 && (
                        <span className="text-xs text-gray-500 flex items-center">
                          +{product.gallery.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold text-[#2A6F80]">${product.price.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleEdit(product)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg border-gray-200 gap-2"
                  >
                    <Edit size={16} />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    onClick={() => handleDelete(product)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50 gap-2"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Forms and Dialogs */}
      <AddProductForm isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={loadProducts} />
      <EditProductForm
        isOpen={isEditOpen}
        product={selectedProduct}
        onClose={handleCloseEdit}
        onSuccess={loadProducts}
      />
      <DeleteProductDialog
        isOpen={isDeleteOpen}
        product={selectedProduct}
        onClose={handleCloseDelete}
        onSuccess={loadProducts}
      />
    </div>
  )
}
