"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/components/cart-item"
import { useCart } from "@/lib/cart-context"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ShoppingCart, ArrowLeft } from "lucide-react"

export default function CartPage() {
  const { items, getTotalPrice, clearCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const totalPrice = getTotalPrice()
  const shippingFee = 0 // Free shipping
  const finalTotal = totalPrice + shippingFee

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Giỏ hàng trống</h1>
            <p className="text-muted-foreground mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Button asChild>
              <Link href="/">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tiếp tục mua sắm
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Giỏ hàng ({items.length} sản phẩm)</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} {...item} />
              ))}

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={clearCart}>
                  Xóa tất cả
                </Button>
                <p className="text-sm text-muted-foreground">{items.length} sản phẩm trong giỏ hàng</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>

                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">Tiến hành thanh toán</Link>
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    Bằng cách tiếp tục, bạn đồng ý với{" "}
                    <Link href="/terms" className="underline">
                      Điều khoản sử dụng
                    </Link>{" "}
                    của chúng tôi
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
