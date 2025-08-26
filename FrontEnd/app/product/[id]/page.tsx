"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProductDetail } from "@/components/product-detail"
import { RelatedProducts } from "@/components/related-products"
import { notFound } from "next/navigation"
import { accountApi, sourceCodeApi, categoryApi } from "@/lib/api"
import { toast } from "sonner"

interface ProductPageProps {
  params: {
    id: string
  }
}

const FILES_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function resolveFileUrl(file: any): string {
  if (!file) return ""
  if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://")) return file
    return `${FILES_BASE_URL}/api/files/${file}`
  }
  const id = file.$oid || file._id || file.id || ""
  return id ? `${FILES_BASE_URL}/api/files/${id}` : ""
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

export default function ProductPage() {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSourceCodeProduct, setIsSourceCodeProduct] = useState(false)

  // Lấy id từ route params theo chuẩn client (tránh dùng props.params vì là Promise ở Next.js mới)
  const routeParams = useParams<{ id: string }>()
  const id = Array.isArray(routeParams.id) ? routeParams.id[0] : routeParams.id

  useEffect(() => {
    if (!id) return; // guard to avoid running before params ready
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        setIsSourceCodeProduct(false)
        
        let response: any = null
        let isSourceCode = false
        
        try {
          response = await sourceCodeApi.getBySlug(id)
          if (response.success && response.data) {
            isSourceCode = true
          }
        } catch {
          try {
            response = await sourceCodeApi.getById(id)
            if (response.success && response.data) {
              isSourceCode = true
            }
          } catch {}
        }
        
        if (!isSourceCode) {
          try {
            response = await accountApi.getById(id)
          } catch {}
        }
        
        if (response && response.success && response.data) {
          let transformedProduct: any
          
          if (isSourceCode) {
            const sourceCode = response.data as any
            setIsSourceCodeProduct(true)
            
            const imagePreviewArr: any[] = Array.isArray(sourceCode.imagePreview) ? sourceCode.imagePreview : []
            const images: string[] = imagePreviewArr.length > 0
              ? imagePreviewArr.map((img: any) => resolveFileUrl(img)).filter(Boolean)
              : [resolveFileUrl(sourceCode.thumbnailImage) || "/placeholder-h7ony.png"]
            
            let categoryName = ""
            if (Array.isArray(sourceCode.category) && sourceCode.category.length > 0) {
              const firstCat = sourceCode.category[0]
              const catId = resolveId(firstCat)
              if (catId) {
                try {
                  const catRes = await categoryApi.getById(catId)
                  if (catRes.success && catRes.data) {
                    categoryName = (catRes.data as any).name || ""
                  }
                } catch {
                  // ignore
                }
              } else if (firstCat && typeof firstCat === 'object' && typeof firstCat.slug === 'string') {
                try {
                  const catRes = await categoryApi.getBySlug(firstCat.slug)
                  if (catRes.success && catRes.data) {
                    categoryName = (catRes.data as any).name || ""
                  }
                } catch {
                  // ignore
                }
              }
            }

            transformedProduct = {
              id: sourceCode._id,
              title: sourceCode.name,
              description: Array.isArray(sourceCode.description) ? (sourceCode.description[0] || "") : (sourceCode.description || ""),
              fullDescription: Array.isArray(sourceCode.description) ? sourceCode.description.join("<br>") : (sourceCode.description || ""),
              price: sourceCode.discountedPrice || sourceCode.price,
              originalPrice: sourceCode.discountPercent > 0 ? sourceCode.price : undefined,
              // removed rating and reviewCount
              category: categoryName,
              images,
              seller: {
                name: "ZuneF Store",
                rating: 0,
                totalSales: 0,
                joinDate: "",
                avatar: "",
              },
              specifications: {
                "Ngôn ngữ/Tags": Array.isArray(sourceCode.tags) ? sourceCode.tags.join(", ") : "",
                "Lượt tải": `${sourceCode.downloadCount ?? 0}`,
                "Lượt xem": `${sourceCode.viewCount ?? 0}`,
                "Trạng thái": sourceCode.isActive ? "Hoạt động" : "Không hoạt động",
              },
              tags: Array.isArray(sourceCode.tags) ? sourceCode.tags : [],
              inStock: true,
              stockCount: 0,
              isHot: sourceCode.discountPercent > 0,
              policy: Array.isArray(sourceCode.policy) ? sourceCode.policy : [],
              videoPreview: Array.isArray(sourceCode.videoPreview) ? sourceCode.videoPreview.map(resolveFileUrl).filter(Boolean) : [],
              videoTutorial: Array.isArray(sourceCode.videoTutorial) ? sourceCode.videoTutorial.map(resolveFileUrl).filter(Boolean) : [],
            }

            try { sourceCodeApi.incrementView(sourceCode._id) } catch {}
          } else {
            const accountData = response.data as any
            
            const images = accountData.imagepreview && accountData.imagepreview.length > 0
              ? accountData.imagepreview.map((img: any) => resolveFileUrl(img)).filter(Boolean)
              : ["/placeholder-h7ony.png"]

            transformedProduct = {
              id: accountData._id,
              title: accountData.name,
              description: accountData.description?.[0] || "Không có mô tả",
              fullDescription: accountData.description?.join("<br>") || accountData.description?.[0] || "Không có mô tả chi tiết",
              price: accountData.price,
              originalPrice: accountData.Discount ? Math.round(accountData.price / (1 - accountData.Discount / 100)) : undefined,
              // removed rating and reviewCount
              category: accountData.category?.[0] || "Khác",
              images,
              seller: {
                name: "ZuneF Store",
                rating: 4.8,
                totalSales: 100,
                joinDate: "2023-01-01",
                avatar: "/seller-avatar-1.png",
              },
              specifications: {
                "Danh mục": accountData.category?.join(", ") || "N/A",
                "Thời hạn": accountData.duration || "N/A",
                "Kho hàng": accountData.stock?.toString() || "0"
              },
              tags: accountData.category || [],
              inStock: accountData.stock > 0,
              stockCount: accountData.stock || 0,
              isHot: accountData.Discount && accountData.Discount > 0,
              // Map video preview for account
              videoPreview: Array.isArray(accountData.videopreview) ? accountData.videopreview.map((v: any) => resolveFileUrl(v)).filter(Boolean) : [],
              videoTutorial: [],
            }
          }
          
          setProduct(transformedProduct)
        } else {
          setError("Sản phẩm không tồn tại")
        }
      } catch (err: any) {
        setError("Không thể tải thông tin sản phẩm")
        toast.error("Không thể tải thông tin sản phẩm")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <ProductDetail product={product} hideMeta={isSourceCodeProduct} />
        <RelatedProducts currentProductId={product.id} category={product.category} useSourceCodeApi={isSourceCodeProduct} />
      </main>
    </div>
  )
}
