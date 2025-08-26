"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { accountApi, sourceCodeApi } from "@/lib/api"
import { toast } from "sonner"

interface RelatedProductsProps {
  currentProductId: string
  category: string
  useSourceCodeApi?: boolean
}

const FILES_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function resolveFileUrl(file: any): string {
  if (!file) return "/placeholder-h7ony.png"
  if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://")) return file
    return `${FILES_BASE_URL}/api/files/${file}`
  }
  const id = file?.$oid || file?._id || file?.id
  return id ? `${FILES_BASE_URL}/api/files/${id}` : "/placeholder-h7ony.png"
}

function resolveId(value: any): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid
    if (typeof value._id === "string") return value._id
    if (value._id && typeof value._id === "object" && typeof value._id.$oid === "string") return value._id.$oid
    if (typeof value.id === "string") return value.id
  }
  return ""
}

export function RelatedProducts({ currentProductId, category, useSourceCodeApi = false }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true)
        
        if (useSourceCodeApi) {
          // Use sourceCodeApi for source code products
          const response = await sourceCodeApi.getAll(1, 20, undefined, undefined, undefined, true) // Get active source codes
          
          if (response.success && response.data) {
            const raw: any = response.data as any
            const sourceCodeData: any[] = Array.isArray(raw) ? raw : (raw.data || raw.items || [])
            
            // Filter and transform source code products, exclude current product
            const transformedProducts = (sourceCodeData || [])
              .filter((item: any) => resolveId(item._id) !== currentProductId)
              .slice(0, 4)
              .map((item: any) => {
                const id = resolveId(item._id)
                return {
                  id,
                  title: item.name,
                  description: item.description?.[0] || "Không có mô tả",
                  price: item.discountedPrice || item.price,
                  originalPrice: (item.discountPercent || 0) > 0 ? item.price : undefined,
                  category: "Source Code",
                  image: resolveFileUrl(item.thumbnailImage) || "/placeholder-h7ony.png",
                  seller: "ZuneF Store",
                  isHot: (item.discountPercent || 0) > 0,
                  href: `/product/${id}`,
                }
              })
            
            setRelatedProducts(transformedProducts)
          } else {
            // No source code products available
            setRelatedProducts([])
          }
        } else {
          // Use accountApi for other categories
          const response = await accountApi.getAll()
          
          if (response.success && response.data) {
            // Transform and filter API data
            let accountsData: any[] = []
            if (Array.isArray(response.data)) {
              accountsData = response.data
            } else if ((response.data as any).accounts && Array.isArray((response.data as any).accounts)) {
              accountsData = (response.data as any).accounts
            } else if ((response.data as any).items && Array.isArray((response.data as any).items)) {
              accountsData = (response.data as any).items
            }
            
            const transformedProducts = accountsData
              .filter((item: any) => resolveId(item._id) !== currentProductId && (item.category?.includes(category) || true))
              .slice(0, 4)
              .map((item: any) => {
                const id = resolveId(item._id)
                return {
                  id,
                  title: item.name,
                  description: item.description?.[0] || "Không có mô tả",
                  price: item.price,
                  originalPrice: (item.Discount || 0) > 0 ? Math.round(item.price / (1 - item.Discount / 100)) : undefined,
                  category: item.category?.[0] || "Khác",
                  image: resolveFileUrl(item.thumbnail) || "/placeholder-h7ony.png",
                  seller: "ZuneF Store",
                  isHot: (item.Discount || 0) > 0,
                  href: `/ai-accounts/${id}`,
                }
              })
            
            // If not enough related products from same category, add some from other categories
            if (transformedProducts.length < 4) {
              const otherProducts = accountsData
                .filter((item: any) => resolveId(item._id) !== currentProductId && !(item.category?.includes(category)))
                .slice(0, 4 - transformedProducts.length)
                .map((item: any) => {
                  const id = resolveId(item._id)
                  return {
                    id,
                    title: item.name,
                    description: item.description?.[0] || "Không có mô tả",
                    price: item.price,
                    originalPrice: (item.Discount || 0) > 0 ? Math.round(item.price / (1 - item.Discount / 100)) : undefined,
                    category: item.category?.[0] || "Khác",
                    image: resolveFileUrl(item.thumbnail) || "/placeholder-h7ony.png",
                    seller: "ZuneF Store",
                    isHot: (item.Discount || 0) > 0,
                    href: `/ai-accounts/${id}`,
                  }
                })
              transformedProducts.push(...otherProducts)
            }
            
            setRelatedProducts(transformedProducts)
          } else {
            // No account products available
            setRelatedProducts([])
          }
        }
      } catch (err: any) {
        console.error("Error fetching related products:", err)
        toast.error("Không thể tải sản phẩm liên quan")
        setRelatedProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProductId, category, useSourceCodeApi])

  if (loading) {
    return (
      <section className="py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Sản phẩm liên quan</h2>
          <p className="text-muted-foreground">Những sản phẩm tương tự bạn có thể quan tâm</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Sản phẩm liên quan</h2>
        <p className="text-muted-foreground">Những sản phẩm tương tự bạn có thể quan tâm</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}
