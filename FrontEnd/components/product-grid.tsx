"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Loader2 } from "lucide-react"
import { accountApi, type Account } from "@/lib/api"

// Transform Account to Product format
const transformAccountToProduct = (account: Account) => ({
  id: account._id,
  title: account.title,
  description: account.description?.[0] || "Không có mô tả",
  price: account.price,
  originalPrice: account.originalPrice,
  category: account.category?.[0] || "Khác",
  image: account.thumbnail || "/placeholder.svg",
  seller: "ZuneF.Com",
  isHot: account.originalPrice ? account.originalPrice > account.price : false,
})

const categories = ["Tất cả", "AI Account", "IDE & Tools", "Source Code"]
const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-low", label: "Giá thấp đến cao" },
  { value: "price-high", label: "Giá cao đến thấp" },
]

export function ProductGrid() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [sortBy, setSortBy] = useState("newest")
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 12

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await accountApi.getAll(currentPage, itemsPerPage)
        
        if (response.success && response.data) {
          const transformedProducts = response.data.accounts.map(transformAccountToProduct)
          setProducts(transformedProducts)
          setFilteredProducts(transformedProducts)
          setTotalCount(response.data.count)
        } else {
          setError("Không thể tải sản phẩm")
        }
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra khi tải sản phẩm")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage])

  // Update categories based on actual data
  const categories = ["Tất cả", ...Array.from(new Set(products.map(p => p.category)))]

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    if (selectedCategory !== "Tất cả") {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
      default:
        // Keep original order (newest first from API)
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, sortBy])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterProducts(query, selectedCategory, sortBy)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterProducts(searchQuery, category, sortBy)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    filterProducts(searchQuery, selectedCategory, sort)
  }

  const filterProducts = (query: string, category: string, sort: string) => {
    let filtered = [...products]

    // Filter by search query
    if (query) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()),
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
      default:
        // Keep original order for "newest"
        break
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("Tất cả")
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

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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

          {(searchQuery || selectedCategory !== "Tất cả" || sortBy !== "newest") && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || selectedCategory !== "Tất cả") && (
        <div className="flex gap-2 flex-wrap">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Tìm kiếm: {searchQuery}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearch("")} />
            </Badge>
          )}
          {selectedCategory !== "Tất cả" && (
            <Badge variant="secondary" className="gap-1">
              Danh mục: {selectedCategory}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange("Tất cả")} />
            </Badge>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Đang tải sản phẩm...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Thử lại
          </Button>
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && (
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredProducts.length} / {totalCount} sản phẩm
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Không tìm thấy sản phẩm nào</p>
              <Button onClick={clearFilters} variant="outline">
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalCount > itemsPerPage && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trang trước
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Trang {currentPage} / {Math.ceil(totalCount / itemsPerPage)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
