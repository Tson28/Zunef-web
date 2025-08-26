import { CategoryHero } from "@/components/category-hero"
import { CategoryProductGrid } from "@/components/category-product-grid"
import { Code } from "lucide-react"

export default function IDEToolsPage() {
  return (
    <div className="w-full px-4 py-8 space-y-8">
      <CategoryHero
        title="IDE & Tools"
        description="Bộ sưu tập các công cụ phát triển chuyên nghiệp từ JetBrains, Visual Studio, Figma và nhiều IDE hàng đầu khác. Tối ưu hóa quy trình phát triển với các công cụ tốt nhất."
        productCount={4}
        icon={<Code className="h-6 w-6" />}
        gradient="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700"
      />

      <CategoryProductGrid category="IDE & Tools" />
    </div>
  )
}
