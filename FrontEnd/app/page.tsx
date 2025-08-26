import { HeroSection } from "@/components/hero-section"
import { FeaturedCategories } from "@/components/featured-categories"
import { ProductGrid } from "@/components/product-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeaturedCategories />

        <section className="py-16">
          <div className="w-full px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Sản phẩm nổi bật</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Những sản phẩm được yêu thích nhất từ cộng đồng developer
              </p>
            </div>
            <ProductGrid />
          </div>
        </section>
      </main>
    </div>
  )
}
