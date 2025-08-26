"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/lib/cart-context"

interface CartItemProps {
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  seller: string
  quantity: number
}

export function CartItem({ id, title, price, originalPrice, image, seller, quantity }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <div className="flex gap-4 p-4 border rounded-lg bg-card">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover rounded-md" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">{title}</h3>
        <p className="text-sm text-muted-foreground">Bởi {seller}</p>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-primary">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeFromCart(id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => updateQuantity(id, quantity - 1)} className="h-8 w-8 p-0">
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => updateQuantity(id, Number.parseInt(e.target.value) || 1)}
            className="w-16 h-8 text-center"
            min="1"
          />
          <Button variant="outline" size="sm" onClick={() => updateQuantity(id, quantity + 1)} className="h-8 w-8 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-sm font-medium">{formatPrice(price * quantity)}</div>
      </div>
    </div>
  )
}
