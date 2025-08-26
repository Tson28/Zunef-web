"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"
import { accountApi } from "@/lib/api"
import { toast } from "sonner"



const categories = ["Tất cả", "AI Account", "IDE & Tools", "Source Code"]
const sortOptions = [
  { value: "relevance", label: "Liên quan nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-low", label: "Giá thấp đến cao" },
  { value: "price-high", label: "Giá cao đến thấp" },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [sortBy, setSortBy] = useState("relevance")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await accountApi.getAll()
        
        if (response.success && response.data) {
          // Transform API data to match component interface
          const transformedProducts = response.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            originalPrice: item.originalPrice,
            category: item.category,
            image: item.imagepreview || "/placeholder-h7ony.png",
            seller: item.seller || "ZuneF Store",
            isHot: item.isHot || false,
          }))
          setAllProducts(transformedProducts)
        } 
      } catch (err: any) {
        console.error("Error fetching products:", err)
       
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter and sort products when dependencies change
  useEffect(() => {
    if (allProducts.length > 0) {
      filterProducts(query, selectedCategory, sortBy)
    }
  }, [query, selectedCategory, sortBy, allProducts])

  const filterProducts = (searchQuery: string, category: string, sort: string) => {
    let filtered = [...allProducts]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.seller.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (category !== "Tất cả") {
      filtered = filtered.filter((product) => product.category === category)
    }

    // Sort products
    switch (sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        // Keep original order for newest
        break
      default:
        // Relevance - could implement more sophisticated scoring
        break
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setSelectedCategory("Tất cả")
    setSortBy("relevance")
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{query ? `Kết quả tìm kiếm cho "${query}"` : "Tìm kiếm sản phẩm"}</h1>

          <SearchBar defaultValue={query} className="max-w-2xl" />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-center">
            <Select value={sortBy} onValueChange={setSortBy}>
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

            {(selectedCategory !== "Tất cả" || sortBy !== "relevance") && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(query || selectedCategory !== "Tất cả") && (
          <div className="flex gap-2 flex-wrap">
            {query && (
              <Badge variant="secondary" className="gap-1">
                Từ khóa: {query}
              </Badge>
            )}
            {selectedCategory !== "Tất cả" && (
              <Badge variant="secondary" className="gap-1">
                Danh mục: {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("Tất cả")} />
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {query ? `Tìm thấy ${filteredProducts.length} kết quả` : `Hiển thị ${filteredProducts.length} sản phẩm`}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
              <p className="text-muted-foreground mb-4">
                {query
                  ? `Không có sản phẩm nào phù hợp với từ khóa "${query}"`
                  : "Không có sản phẩm nào phù hợp với bộ lọc hiện tại"}
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Gợi ý:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Thử từ khóa khác</li>
                  <li>• Kiểm tra chính tả</li>
                  <li>• Sử dụng từ khóa tổng quát hơn</li>
                  <li>• Xóa bộ lọc để xem tất cả sản phẩm</li>
                </ul>
              </div>
              {(selectedCategory !== "Tất cả" || sortBy !== "relevance") && (
                <Button variant="outline" className="mt-4 bg-transparent" onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
