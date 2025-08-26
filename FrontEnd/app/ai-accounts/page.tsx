import { CategoryHero } from "@/components/category-hero"
import { CategoryProductGrid } from "@/components/category-product-grid"
import { Cpu } from "lucide-react"

export default function AIAccountsPage() {
  return (
    <div className="w-full px-4 py-8 space-y-8">
      <CategoryHero
        title="Tài khoản AI"
        description="Khám phá bộ sưu tập tài khoản AI premium với các công cụ hàng đầu như ChatGPT Plus, Claude Pro, GitHub Copilot và nhiều hơn nữa. Nâng cao năng suất làm việc với sức mạnh trí tuệ nhân tạo."
        productCount={5}
        icon={<Cpu className="h-6 w-6" />}
        gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
      />

      <CategoryProductGrid category="AI Account" />
    </div>
  )
}
