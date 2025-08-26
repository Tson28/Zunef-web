import type React from "react"
import { Badge } from "@/components/ui/badge"

interface CategoryHeroProps {
  title: string
  description: string
  productCount: number
  icon: React.ReactNode
  gradient: string
}

export function CategoryHero({ title, description, productCount, icon, gradient }: CategoryHeroProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-8 md:p-12 text-white`}>
      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">{icon}</div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {productCount} sản phẩm
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-white/90 leading-relaxed">{description}</p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16" />
    </div>
  )
}
