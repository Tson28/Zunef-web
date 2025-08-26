import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cpu, Code, Folder, ArrowRight } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    title: "Tài khoản AI",
    description: "ChatGPT, Claude, Gemini và các AI tools khác",
    icon: Cpu,
    count: "200+",
    href: "/ai-accounts",
    color: "bg-blue-500",
  },
  {
    title: "IDE & Tools",
    description: "JetBrains, Visual Studio, và công cụ phát triển",
    icon: Code,
    count: "150+",
    href: "/ide-tools",
    color: "bg-green-500",
  },
  {
    title: "Source Code",
    description: "Templates, boilerplates và dự án hoàn chỉnh",
    icon: Folder,
    count: "500+",
    href: "/source-code",
    color: "bg-purple-500",
  },
]

export function FeaturedCategories() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Danh mục nổi bật</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá các sản phẩm chất lượng cao trong từng danh mục
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card
              key={category.title}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{category.count} sản phẩm</span>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-muted-foreground mb-4">{category.description}</p>

                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                  asChild
                >
                  <Link href={category.href}>
                    Xem tất cả
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
