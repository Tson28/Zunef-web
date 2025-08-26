"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Copy, CheckCircle, AlertCircle, RefreshCw, Clock, Shield } from "lucide-react"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api"

interface AccountInfo {
  orderId: string
  productId: string
  productName: string
  username: string
  password: string
  email: string
  additionalInfo?: string
  isReady: boolean
  deliveredAt?: string
  expiresAt?: string
}

interface AccountInfoModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  productName: string
}

export function AccountInfoModal({ isOpen, onClose, orderId, productName }: AccountInfoModalProps) {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Fetch account information
  const fetchAccountInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vui lòng đăng nhập để xem thông tin tài khoản')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/account-info/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (response.status === 202) {
        // Account đang được chuẩn bị - tạo object với isReady = false
        setAccountInfo({
          orderId: data.data.orderId,
          productId: '',
          productName: data.data.productName,
          username: '',
          password: '',
          email: '',
          additionalInfo: '',
          isReady: false,
          deliveredAt: undefined,
          expiresAt: undefined
        })
      } else if (response.ok) {
        // Account đã sẵn sàng - set data bình thường
        setAccountInfo({
          orderId: data.data.orderId,
          productId: data.data.productId || '',
          productName: data.data.productName,
          username: data.data.loginInfo?.username || '',
          password: data.data.loginInfo?.password || '',
          email: data.data.loginInfo?.email || '',
          additionalInfo: data.data.loginInfo?.additionalInfo || '',
          isReady: true,
          deliveredAt: data.data.deliveredAt,
          expiresAt: data.data.expiresAt
        })
      } else {
        throw new Error(data.message || 'Không thể tải thông tin tài khoản')
      }
    } catch (err: any) {
      console.error('Error fetching account info:', err)
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Check account status
  const checkAccountStatus = async () => {
    if (!orderId) return
    
    try {
      setCheckingStatus(true)
      
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Vui lòng đăng nhập để kiểm tra trạng thái')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/account-info/status/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Không thể kiểm tra trạng thái')
      }

      const data = await response.json()
      
      if (data.data.isReady) {
        toast.success('Tài khoản đã sẵn sàng!')
        // Refresh account info
        fetchAccountInfo()
      } else {
        toast.info('Tài khoản đang được chuẩn bị, vui lòng chờ...')
      }
    } catch (err: any) {
      console.error('Error checking account status:', err)
      toast.error(err.message || 'Có lỗi xảy ra khi kiểm tra trạng thái')
    } finally {
      setCheckingStatus(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`Đã sao chép ${label}`)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Không thể sao chép')
    }
  }

  useEffect(() => {
    if (isOpen && orderId) {
      fetchAccountInfo()
    }
  }, [isOpen, orderId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin đăng nhập tài khoản
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={fetchAccountInfo}>Thử lại</Button>
              </div>
            </CardContent>
          </Card>
        ) : accountInfo ? (
          <div className="space-y-6">
            {/* Account Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {productName}
                    </CardTitle>
                    <CardDescription>Mã đơn hàng: {orderId}</CardDescription>
                  </div>
                  <Badge 
                    variant={accountInfo.isReady ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {accountInfo.isReady ? (
                      <><CheckCircle className="h-3 w-3" /> Sẵn sàng</>
                    ) : (
                      <><Clock className="h-3 w-3" /> Đang chuẩn bị</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              
              {accountInfo.isReady ? (
                <CardContent className="space-y-4">
                  {/* Login Credentials */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <h4 className="font-semibold">Thông tin đăng nhập</h4>
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Tên đăng nhập</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="username"
                            value={accountInfo.username || 'Chưa có thông tin'} 
                            readOnly 
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(accountInfo.username, 'tên đăng nhập')}
                            disabled={!accountInfo.username}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="password"
                            type="password"
                            value={accountInfo.password || 'Chưa có thông tin'} 
                            readOnly 
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(accountInfo.password, 'mật khẩu')}
                            disabled={!accountInfo.password}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="email"
                            value={accountInfo.email || 'Chưa có thông tin'} 
                            readOnly 
                            className="flex-1"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(accountInfo.email, 'email')}
                            disabled={!accountInfo.email}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {accountInfo.additionalInfo && (
                        <div className="space-y-2">
                          <Label htmlFor="additional">Thông tin bổ sung</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="additional"
                              value={accountInfo.additionalInfo} 
                              readOnly 
                              className="flex-1"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(accountInfo.additionalInfo!, 'thông tin bổ sung')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Account Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {accountInfo.deliveredAt && (
                      <div>
                        <p className="text-muted-foreground">Ngày giao</p>
                        <p className="font-medium">{formatDate(accountInfo.deliveredAt)}</p>
                      </div>
                    )}
                    {accountInfo.expiresAt && (
                      <div>
                        <p className="text-muted-foreground">Hết hạn</p>
                        <p className="font-medium">{formatDate(accountInfo.expiresAt)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={checkAccountStatus}
                      disabled={checkingStatus}
                      className="flex-1"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${checkingStatus ? 'animate-spin' : ''}`} />
                      {checkingStatus ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="text-center py-8">
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Đang chuẩn bị tài khoản</h3>
                      <p className="text-muted-foreground">Admin đang chuẩn bị thông tin đăng nhập cho bạn. Vui lòng chờ trong giây lát.</p>
                    </div>
                    <Button 
                      onClick={checkAccountStatus}
                      disabled={checkingStatus}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${checkingStatus ? 'animate-spin' : ''}`} />
                      {checkingStatus ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Instructions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn sử dụng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Sao chép thông tin</p>
                    <p className="text-sm text-muted-foreground">Nhấn nút sao chép để lưu thông tin đăng nhập</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Đăng nhập tài khoản</p>
                    <p className="text-sm text-muted-foreground">Sử dụng thông tin này để đăng nhập vào dịch vụ</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Bảo mật thông tin</p>
                    <p className="text-sm text-muted-foreground">Không chia sẻ thông tin đăng nhập với người khác</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Không có thông tin</h3>
                  <p className="text-muted-foreground">Không tìm thấy thông tin tài khoản cho sản phẩm này. Admin có thể chưa cung cấp thông tin đăng nhập.</p>
                </div>
                <Button onClick={fetchAccountInfo}>Thử lại</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}