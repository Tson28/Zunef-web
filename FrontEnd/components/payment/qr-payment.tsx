"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'

interface PaymentData {
  orderId: string
  transactionCode: string
  qrUrl: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'expired'
  expiresAt: string
}

interface QRPaymentProps {
  paymentData: PaymentData
  onPaymentSuccess?: () => void
  onPaymentFailed?: () => void
  onPaymentExpired?: () => void
}

export default function QRPayment({ 
  paymentData, 
  onPaymentSuccess, 
  onPaymentFailed, 
  onPaymentExpired 
}: QRPaymentProps) {
  const [status, setStatus] = useState(paymentData.status)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isChecking, setIsChecking] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Tính thời gian còn lại
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(paymentData.expiresAt).getTime()
      const difference = expiry - now
      return Math.max(0, Math.floor(difference / 1000))
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      
      if (remaining <= 0 && status === 'pending') {
        setStatus('expired')
        onPaymentExpired?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentData.expiresAt, status, onPaymentExpired])

  // Kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async () => {
    setIsChecking(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/payment/status/order/${paymentData.orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setStatus(result.data.status)
        
        if (result.data.status === 'completed') {
          setShowSuccessModal(true)
        } else if (result.data.status === 'failed') {
          onPaymentFailed?.()
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // Auto check payment status every 5 seconds
  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(checkPaymentStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [status])

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Chờ thanh toán
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã thanh toán
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Thanh toán thất bại
          </Badge>
        )
      case 'expired':
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            Đã hết hạn
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Quét mã QR để thanh toán</CardTitle>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">
            Sử dụng app ngân hàng để quét mã QR bên dưới
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
        {status === 'pending' && (
          <>
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
                <img 
                  src={paymentData.qrUrl} 
                  alt="QR Code thanh toán" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Số tài khoản:</span>
                <span className="font-mono">0915878677</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Ngân hàng:</span>
                <span>MB BANK</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Số tiền:</span>
                <span className="font-semibold text-primary">{formatPrice(paymentData.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Nội dung:</span>
                <span className="font-mono text-xs">ZUNEF_{paymentData.transactionCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Thời gian còn lại:</span>
                <span className={`font-semibold ${timeLeft < 300 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Đơn hàng sẽ tự động được xác nhận sau khi thanh toán thành công
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkPaymentStatus}
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  'Kiểm tra trạng thái thanh toán'
                )}
              </Button>
            </div>
          </>
        )}
        
        {status === 'completed' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">Thanh toán thành công!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Đơn hàng của bạn đã được xác nhận và đang được xử lý
              </p>
            </div>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">Thanh toán thất bại</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vui lòng thử lại hoặc liên hệ hỗ trợ
              </p>
            </div>
          </div>
        )}
        
        {status === 'expired' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Mã QR đã hết hạn</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vui lòng tạo mã QR mới để tiếp tục thanh toán
              </p>
            </div>
          </div>
        )}
        </CardContent>
      </Card>
      
      {/* Modal thông báo thanh toán thành công */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-green-600">
            Thanh toán thành công!
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý. Cảm ơn bạn đã mua hàng tại ZuneF!
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button 
            onClick={() => {
              setShowSuccessModal(false)
              onPaymentSuccess?.()
            }}
            className="w-full"
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}