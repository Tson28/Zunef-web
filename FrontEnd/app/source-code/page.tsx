import { CategoryHero } from "@/components/category-hero"
import { CategoryProductGrid } from "@/components/category-product-grid"
import { Folder } from "lucide-react"

export default function SourceCodePage() {
  return (
    <div className="w-full px-4 py-8 space-y-8">
      <CategoryHero
        title="Source Code"
        description="Thư viện mã nguồn chất lượng cao với các template React, Vue.js, Flutter và boilerplate SaaS. Tiết kiệm thời gian phát triển với các giải pháp có sẵn được tối ưu hóa."
        productCount={4}
        icon={<Folder className="h-6 w-6" />}
        gradient="bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700"
      />

      <CategoryProductGrid category="Source Code" useSourceCodeApi={true} />
    </div>
  )
}
