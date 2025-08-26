"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

interface ProductDetailProps {
  product: {
    id: string
    title: string
    description: string
    fullDescription: string
    price: number
    originalPrice?: number
    // removed rating and reviewCount
    category: string
    images: string[]
    seller: {
      name: string
      rating: number
      totalSales: number
      joinDate: string
      avatar: string
    }
    specifications: Record<string, string>
    tags: string[]
    inStock: boolean
    stockCount: number
    isHot: boolean
    // Optional real data fields
    policy?: string[]
    // New optional media fields
    videoPreview?: string[]
    videoTutorial?: string[]
  }
  // Optional flags to hide mock metas like rating/reviews and stock
  hideMeta?: boolean
}

interface TocItem { id: string; text: string; level: number }

export function ProductDetail({ product, hideMeta = false }: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [toc, setToc] = useState<TocItem[]>([])
  const descRef = useRef<HTMLDivElement | null>(null)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const hasPolicies = Array.isArray(product.policy) && product.policy.length > 0
  const hasVideoPreview = Array.isArray(product.videoPreview) && product.videoPreview.length > 0
  const hasVideoTutorial = Array.isArray(product.videoTutorial) && product.videoTutorial.length > 0
  const hasAnyVideo = hasVideoPreview || hasVideoTutorial

  const baseTabs = 2 // description + specifications
  const videoTab = hasAnyVideo ? 1 : 0
  const totalTabs = baseTabs + videoTab
  const tabsColsClass = totalTabs === 3 ? "grid-cols-3" : "grid-cols-2"

  // Build Table of Contents from headings inside description
  useEffect(() => {
    const el = descRef.current
    if (!el) return
    // Find h2/h3 and assign ids
    const headings = Array.from(el.querySelectorAll<HTMLHeadingElement>("h2, h3"))
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
    const items: TocItem[] = []
    headings.forEach((h) => {
      const text = h.textContent?.trim() || ""
      if (!text) return
      const id = h.id || slugify(text)
      h.id = id
      items.push({ id, text, level: h.tagName.toLowerCase() === "h3" ? 3 : 2 })
    })
    setToc(items)
  }, [product.fullDescription])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
          <img
            src={product.images[currentImageIndex] || "/placeholder.svg"}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          {product.images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            {product.isHot && <Badge variant="destructive">HOT</Badge>}
            {discount > 0 && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                -{discount}%
              </Badge>
            )}
          </div>
        </div>

        {/* Thumbnail Images */}
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentImageIndex ? "border-primary" : "border-border"
                }`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* Avoid duplicate category when it's already in tags */}
            {(() => {
              const tagList = Array.from(new Set(product.tags || []))
              const showCategory = !!product.category && !tagList.includes(product.category)
              return (
                <>
                  {showCategory && <Badge variant="outline">{product.category}</Badge>}
                  {tagList.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </>
              )
            })()}
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">{product.title}</h1>

          {!hideMeta && (
            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm text-muted-foreground">
                {product.inStock ? (
                  <span className="text-green-600">Còn {product.stockCount} sản phẩm</span>
                ) : (
                  <span className="text-red-600">Hết hàng</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-primary">{product.price.toLocaleString("vi-VN")}đ</span>
            {product.originalPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {product.originalPrice.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Purchase Actions */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button size="lg" className="flex-1" disabled={!product.inStock}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Mua ngay
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={isWishlisted ? "text-red-500 border-red-500" : ""}
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {hasPolicies && (
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {product.policy!.slice(0, 3).map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx === 0 && <Shield className="h-4 w-4" />}
                  {idx === 1 && <Truck className="h-4 w-4" />}
                  {idx === 2 && <RotateCcw className="h-4 w-4" />}
                  <span>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className={`grid w-full ${tabsColsClass}`}>
            <TabsTrigger value="description">Mô tả chi tiết</TabsTrigger>
            <TabsTrigger value="specifications">Thông số</TabsTrigger>
            {hasAnyVideo && <TabsTrigger value="video">Video</TabsTrigger>}
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {/* TOC */}
                {toc.length > 0 && (
                  <div className="mb-6 rounded-lg border bg-muted/30 p-4">
                    <div className="text-sm font-semibold mb-3">Mục lục</div>
                    <nav className="flex flex-wrap gap-3">
                      {toc.map((i) => (
                        <a
                          key={i.id}
                          href={`#${i.id}`}
                          className={`text-xs px-2 py-1 rounded-md border hover:bg-accent transition ${
                            i.level === 3 ? "opacity-80" : ""
                          }`}
                        >
                          {i.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Description content */}
                <div className={descExpanded ? "prose prose-sm max-w-none prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline prose-strong:text-foreground prose-li:marker:text-muted-foreground prose-img:rounded-lg prose-pre:bg-muted" : "prose prose-sm max-w-none max-h-72 overflow-hidden relative prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline prose-strong:text-foreground prose-li:marker:text-muted-foreground prose-img:rounded-lg prose-pre:bg-muted"}>
                  <div ref={descRef} dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
                  {!descExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" onClick={() => setDescExpanded(!descExpanded)}>
                    {descExpanded ? "Thu gọn" : "Xem thêm"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Object.entries(product.specifications)
                    .filter(([key]) => !/lượt\s*tải/i.test(key) && !/downloads?/i.test(key) && !/\bluot\s*tai\b/i.test(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border last:border-0">
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {hasAnyVideo && (
            <TabsContent value="video" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="p-6 space-y-8">
                      {hasVideoPreview && (
                        <section>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Video preview</h3>
                            <Badge variant="outline">{(product.videoPreview || []).filter(Boolean).length}</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(product.videoPreview || []).filter(Boolean).map((v, idx) => (
                              <div key={`vp-${idx}`} className="rounded-lg border bg-card">
                                <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-t-lg">
                                  <video
                                    controls
                                    preload="metadata"
                                    className="h-full w-full"
                                    onError={(e) => {
                                      const el = e.currentTarget as HTMLVideoElement
                                      el.style.display = 'none'
                                    }}
                                  >
                                    <source src={v as string} />
                                    Trình duyệt của bạn không hỗ trợ phát video.
                                  </video>
                                </AspectRatio>
                                <div className="p-3 flex items-center justify-between">
                                  <span className="text-sm font-medium">Preview {idx + 1}</span>
                                  <a href={v as string} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                                    Mở <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {hasVideoTutorial && (
                        <section>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Video hướng dẫn</h3>
                            <Badge variant="outline">{(product.videoTutorial || []).filter(Boolean).length}</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(product.videoTutorial || []).filter(Boolean).map((v, idx) => (
                              <div key={`vt-${idx}`} className="rounded-lg border bg-card">
                                <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-t-lg">
                                  <video
                                    controls
                                    preload="metadata"
                                    className="h-full w-full"
                                    onError={(e) => {
                                      const el = e.currentTarget as HTMLVideoElement
                                      el.style.display = 'none'
                                    }}
                                  >
                                    <source src={v as string} />
                                    Trình duyệt của bạn không hỗ trợ phát video.
                                  </video>
                                </AspectRatio>
                                <div className="p-3 flex items-center justify-between">
                                  <span className="text-sm font-medium">Hướng dẫn {idx + 1}</span>
                                  <a href={v as string} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                                    Mở <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* removed reviews tab content */}
        </Tabs>
      </div>
    </div>
  )
}
