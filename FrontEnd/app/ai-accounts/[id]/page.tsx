"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { accountApi } from "@/lib/api"
import { ProductDetail } from "@/components/product-detail"
import { RelatedProducts } from "@/components/related-products"
import { toast } from "sonner"

const FILES_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function resolveFileUrl(file: any): string {
  if (!file) return ""
  if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://")) return file
    return `${FILES_BASE_URL}/api/files/${file}`
  }
  const id = file?.$oid || file?._id || file?.id
  return id ? `${FILES_BASE_URL}/api/files/${id}` : ""
}

export default function AIAccountDetailPage() {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const routeParams = useParams<{ id: string }>()
  const id = Array.isArray(routeParams.id) ? routeParams.id[0] : routeParams.id

  useEffect(() => {
    if (!id) return

    const fetchAccount = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await accountApi.getById(id)
        if (response.success && response.data) {
          const accountData: any = response.data

          const images: string[] = Array.isArray(accountData.imagepreview) && accountData.imagepreview.length > 0
            ? accountData.imagepreview.map((img: any) => resolveFileUrl(img)).filter(Boolean)
            : [resolveFileUrl(accountData.thumbnail) || "/placeholder-h7ony.png"]

          const transformedProduct = {
            id: accountData._id,
            title: accountData.name,
            description: accountData.description?.[0] || "Không có mô tả",
            fullDescription: Array.isArray(accountData.description)
              ? accountData.description.join("<br>")
              : accountData.description || "Không có mô tả chi tiết",
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
              "Kho hàng": accountData.stock?.toString() || "0",
            },
            tags: accountData.category || [],
            inStock: (accountData.stock || 0) > 0,
            stockCount: accountData.stock || 0,
            isHot: (accountData.Discount || 0) > 0,
            policy: Array.isArray(accountData.policy) ? accountData.policy : [],
            videoPreview: Array.isArray(accountData.videopreview)
              ? accountData.videopreview.map((v: any) => resolveFileUrl(v)).filter(Boolean)
              : [],
            videoTutorial: [],
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

    fetchAccount()
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
        <ProductDetail product={product} />
        <RelatedProducts currentProductId={product.id} category={product.category} useSourceCodeApi={false} />
      </main>
    </div>
  )
}