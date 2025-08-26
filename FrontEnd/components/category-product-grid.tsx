"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { accountApi, sourceCodeApi, type Account, type SourceCode } from "@/lib/api"

const FILES_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function resolveFileUrl(file: any): string {
  if (!file) return "/placeholder.svg"
  if (typeof file === "string") {
    if (file.startsWith("http://") || file.startsWith("https://")) return file
    return `${FILES_BASE_URL}/api/files/${file}`
  }
  const id = file?.$oid || file?._id || file?.id
  return id ? `${FILES_BASE_URL}/api/files/${id}` : "/placeholder.svg"
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

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-low", label: "Giá thấp đến cao" },
  { value: "price-high", label: "Giá cao đến thấp" },
]

interface CategoryProductGridProps {
  category: string
  useSourceCodeApi?: boolean
}

export function CategoryProductGrid({ category, useSourceCodeApi = false }: CategoryProductGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transform Account to Product format
  const transformAccountToProduct = (account: Account) => ({
    id: resolveId((account as any)._id),
    title: (account as any).name || (account as any).title || "",
    description: (account as any).description?.[0] || "Không có mô tả",
    price: account.price,
    originalPrice: (account as any).Discount ? Math.round(account.price / (1 - ((account as any).Discount / 100))) : undefined,
    category: (account as any).category?.[0] || "Khác",
    image: resolveFileUrl((account as any).thumbnail),
    seller: "ZuneF.Com",
    isHot: (account as any).Discount && (account as any).Discount > 0,
  })

  const transformSourceCodeToProduct = (sourceCode: SourceCode) => {
    const effectivePrice =
      typeof (sourceCode as any).discountedPrice === 'number'
        ? (sourceCode as any).discountedPrice
        : Math.round(sourceCode.price * (1 - ((sourceCode.discountPercent || 0) / 100)))

    const cat = Array.isArray(sourceCode.category) ? (sourceCode.category as any[])[0] : undefined
    const categoryLabel =
      cat && typeof cat === 'object' && 'name' in (cat as any)
        ? (cat as any).name
        : "Source Code"

    const thumb = (sourceCode as any).thumbnailImage
      ? resolveFileUrl((sourceCode as any).thumbnailImage)
      : "/placeholder.svg"

    return {
      id: (sourceCode as any)._id,
      title: sourceCode.name,
      description: sourceCode.description?.[0] || "Không có mô tả",
      price: effectivePrice,
      originalPrice: (sourceCode.discountPercent || 0) > 0 ? sourceCode.price : undefined,
      category: categoryLabel,
      image: thumb,
      seller: "ZuneF.Com",
      isHot: (sourceCode.discountPercent || 0) > 0,
    }
  }

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (useSourceCodeApi) {
          // Use sourceCodeApi for source code products
          const response = await sourceCodeApi.getAll(1, 20, searchQuery, undefined, undefined, true)
          
          if (response.success && response.data) {
            const raw: any = response.data as any
            const sourceCodeData: any[] = Array.isArray(raw) ? raw : (raw?.data || raw?.items || [])
            const transformedProducts = (sourceCodeData || []).map(transformSourceCodeToProduct)
            setAllProducts(transformedProducts)
          } 
        } else {
          // Use accountApi for other categories
          const response = await accountApi.getAll(1, 50) // Get more products for better filtering
          
          if (response.success) {
            const raw = (response as any).data
            let accountData: any[] = []
            if (Array.isArray(raw)) accountData = raw
            else if (raw?.accounts) accountData = raw.accounts
            else if (raw?.items) accountData = raw.items

            const transformedProducts = (accountData || []).map(transformAccountToProduct)
            setAllProducts(transformedProducts)
          }
        }
      } catch (err: any) {
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, useSourceCodeApi])

  // Filter products by category and other criteria when dependencies change
  useEffect(() => {
    if (allProducts.length > 0) {
      filterProducts(searchQuery, sortBy)
    }
  }, [category, searchQuery, sortBy, allProducts, useSourceCodeApi])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
  }

  const filterProducts = (query: string, sort: string) => {
    let filtered = allProducts

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()),
      )
    }

    // Sort products
    switch (sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      default:
        // Keep original order for "newest"
        break
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSortBy("newest")
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || sortBy !== "newest") && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {searchQuery && (
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            Tìm kiếm: {searchQuery}
            <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearch("")} />
          </Badge>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">Hiển thị {filteredProducts.length} sản phẩm</div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} href={`${useSourceCodeApi ? '/product' : '/ai-accounts'}/${product.id}`} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
