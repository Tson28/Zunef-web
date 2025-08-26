import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Cửa hàng số hàng đầu cho Developer</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Tài khoản AI, <span className="text-primary">IDE & Source Code</span> chất lượng cao
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Khám phá bộ sưu tập tài khoản AI premium, công cụ IDE chuyên nghiệp và source code chất lượng cao. Được tuyển
          chọn kỹ lưỡng để phục vụ nhu cầu phát triển của bạn.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/">
              Khám phá ngay
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
            <Link href="/cart">Mua ngay</Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <div className="text-muted-foreground">Sản phẩm chất lượng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Khách hàng hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Hỗ trợ khách hàng</div>
          </div>
        </div>
      </div>
    </section>
  )
}
