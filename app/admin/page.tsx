"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { AddProductForm } from "@/components/add-product-form"
import { apiClient } from "@/lib/api"

interface Product {
  id: number
  name: string
  price: number
  category: string
  image_url: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

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

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">Inventory</h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-[#FF8C78] hover:bg-[#ff7a63] text-white rounded-lg px-4 md:px-6 gap-2 h-10 w-full sm:w-auto"
        >
          <Plus size={20} />
          Add Product
        </Button>
      </div>

      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg md:text-xl">Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No products yet. Add one to get started!</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">Image</th>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Category</th>
                    <th className="text-right py-3 px-4 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        {product.image_url && (
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                      <td className="py-3 px-4 text-gray-600">{product.category}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">${product.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Form */}
      <AddProductForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={loadProducts} />
    </div>
  )
}
