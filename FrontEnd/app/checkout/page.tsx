"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, CreditCard, Wallet, Building } from "lucide-react"
import { useRouter } from "next/navigation"
import QRPayment from "@/components/payment/qr-payment"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("qr_banking")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [showQR, setShowQR] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const totalPrice = getTotalPrice()
  const shippingFee = 0
  const finalTotal = totalPrice + shippingFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms) {
      alert("Vui lòng đồng ý với điều khoản sử dụng")
      return
    }

    setIsProcessing(true)

    try {
      // Tạo đơn hàng thanh toán
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
          })),
          customerInfo: {
            fullName: user?.name || "Khách hàng",
            email: user?.email || "customer@example.com",
          }
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setPaymentData(result.data)
        setShowQR(true)
      } else {
        alert('Lỗi tạo đơn hàng: ' + result.message)
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      alert('Lỗi kết nối server')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) {
    return (
      <div className="container px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h1>
          <p className="text-muted-foreground mb-6">Bạn cần đăng nhập để thực hiện thanh toán</p>
          <Button asChild>
            <Link href="/auth/login">Đăng nhập</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Không có sản phẩm để thanh toán</h1>
          <p className="text-muted-foreground mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Button asChild>
            <Link href="/">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại giỏ hàng
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Thanh toán</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Method */}
            <div className="lg:col-span-2 space-y-6">
              {!showQR ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Phương thức thanh toán</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Chúng tôi chỉ hỗ trợ thanh toán qua chuyển khoản ngân hàng bằng QR Code
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <Building className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <div className="text-base font-medium">
                          Chuyển khoản qua QR Code
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quét mã QR để thanh toán nhanh chóng và an toàn
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Hướng dẫn thanh toán:</p>
                          <ol className="list-decimal list-inside space-y-1 text-blue-700">
                            <li>Nhấn "Tạo mã QR thanh toán" để tạo mã QR</li>
                            <li>Sử dụng app ngân hàng quét mã QR</li>
                            <li>Xác nhận thanh toán trên app ngân hàng</li>
                            <li>Hệ thống sẽ tự động xác nhận thanh toán</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                 <QRPayment 
                   paymentData={{
                     orderId: paymentData?.orderId || '',
                     transactionCode: paymentData?.transactionCode || '',
                     qrUrl: paymentData?.qrUrl || '',
                     amount: finalTotal,
                     status: 'pending',
                     expiresAt: paymentData?.expiresAt || ''
                   }}
                   onPaymentSuccess={() => {
                     clearCart()
                     toast({
                       title: "Thanh toán thành công!",
                       description: "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.",
                     })
                     router.push("/")
                   }}
                   onPaymentFailed={() => {
                     toast({
                       title: "Thanh toán thất bại",
                       description: "Vui lòng thử lại hoặc liên hệ hỗ trợ.",
                       variant: "destructive",
                     })
                   }}
                   onPaymentExpired={() => {
                     toast({
                       title: "Mã QR đã hết hạn",
                       description: "Vui lòng tạo mã QR mới để tiếp tục thanh toán.",
                       variant: "destructive",
                     })
                     setShowQR(false)
                     setPaymentData(null)
                   }}
                 />
               )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Đơn hàng của bạn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-muted-foreground">Số lượng: {item.quantity}</p>
                        </div>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tạm tính</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="text-green-600">Miễn phí</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>

                  <div className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50">
                    <Checkbox 
                      id="terms" 
                      checked={agreeTerms} 
                      onCheckedChange={setAgreeTerms}
                      className="mt-0.5 h-5 w-5 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      Tôi đồng ý với{" "}
                      <Link href="/terms" className="underline text-primary hover:text-primary/80">
                        điều khoản sử dụng
                      </Link>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing || !agreeTerms || showQR}>
                    {isProcessing ? "Đang tạo mã QR..." : showQR ? "Đã tạo mã QR" : "Tạo mã QR thanh toán"}
                  </Button>
                </CardContent>
              </Card>
            </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
