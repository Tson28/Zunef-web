"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Key, Copy, Mail, User, Info, CheckCircle, Clock, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useSidebar } from "@/lib/sidebar-context"
import { API_BASE_URL } from "@/lib/api"

interface AccountInfo {
  orderId: string
  productId: string
  productName: string
  loginInfo: {
    username: string
    password: string
    email: string
    additionalInfo: string
    isReady: boolean
    lastUpdated: string
  }
  orderStatus: string
  purchaseDate: string
}

export default function AccountInfoPage() {
  const { isCollapsed } = useSidebar()
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Không thể tải thông tin tài khoản')
      }

      const data = await response.json()
      setAccountInfo(data.data)
    } catch (err: any) {
      console.error('Error fetching account info:', err)
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Check account status
  const checkAccountStatus = async () => {
    try {
      setRefreshing(true)
      
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
        toast.success('Thông tin tài khoản đã sẵn sàng!')
        fetchAccountInfo() // Refresh the full info
      } else {
        toast.info('Thông tin tài khoản chưa sẵn sàng. Vui lòng thử lại sau.')
      }
    } catch (err: any) {
      console.error('Error checking account status:', err)
      toast.error(err.message || 'Có lỗi xảy ra khi kiểm tra trạng thái')
    } finally {
      setRefreshing(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label} vào clipboard!`)
  }

  useEffect(() => {
    if (orderId) {
      fetchAccountInfo()
    }
  }, [orderId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="p-6">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold">Thông tin đăng nhập</h1>
            <p className="text-muted-foreground mt-2">Thông tin tài khoản đã mua</p>
          </div>

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
                        <Key className="h-5 w-5" />
                        {accountInfo.productName}
                      </CardTitle>
                      <CardDescription>Mã đơn hàng: {accountInfo.orderId}</CardDescription>
                    </div>
                    <Badge 
                      variant={accountInfo.loginInfo.isReady ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {accountInfo.loginInfo.isReady ? (
                        <><CheckCircle className="h-3 w-3" /> Sẵn sàng</>
                      ) : (
                        <><Clock className="h-3 w-3" /> Đang xử lý</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Ngày mua</p>
                      <p className="font-medium">{formatDate(accountInfo.purchaseDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Trạng thái đơn hàng</p>
                      <p className="font-medium">{accountInfo.orderStatus}</p>
                    </div>
                  </div>

                  {accountInfo.loginInfo.isReady && accountInfo.loginInfo.lastUpdated && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
                      <p className="font-medium">{formatDate(accountInfo.loginInfo.lastUpdated)}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={checkAccountStatus}
                      disabled={refreshing}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      {refreshing ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Login Information Card */}
              {accountInfo.loginInfo.isReady ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin đăng nhập</CardTitle>
                    <CardDescription>
                      Thông tin tài khoản đã được chuẩn bị sẵn sàng
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Username */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Tên đăng nhập
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          value={accountInfo.loginInfo.username || 'Chưa có thông tin'} 
                          readOnly 
                          className="flex-1"
                        />
                        {accountInfo.loginInfo.username && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => copyToClipboard(accountInfo.loginInfo.username, 'tên đăng nhập')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Mật khẩu
                      </Label>
                      <div className="flex gap-2">
                        <Input 
                          type="password" 
                          value={accountInfo.loginInfo.password || 'Chưa có thông tin'} 
                          readOnly 
                          className="flex-1"
                        />
                        {accountInfo.loginInfo.password && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => copyToClipboard(accountInfo.loginInfo.password, 'mật khẩu')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    {accountInfo.loginInfo.email && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <div className="flex gap-2">
                          <Input 
                            value={accountInfo.loginInfo.email} 
                            readOnly 
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => copyToClipboard(accountInfo.loginInfo.email, 'email')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Additional Information */}
                    {accountInfo.loginInfo.additionalInfo && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Thông tin bổ sung
                        </Label>
                        <div className="flex gap-2">
                          <Textarea 
                            value={accountInfo.loginInfo.additionalInfo} 
                            readOnly 
                            className="flex-1 min-h-[100px]"
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => copyToClipboard(accountInfo.loginInfo.additionalInfo, 'thông tin bổ sung')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Đang xử lý tài khoản</h3>
                        <p className="text-muted-foreground">
                          Thông tin đăng nhập đang được chuẩn bị. Vui lòng kiểm tra lại sau.
                        </p>
                      </div>
                      <Button onClick={checkAccountStatus} disabled={refreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Kiểm tra lại
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                      <p className="text-sm text-muted-foreground">Nhấn nút sao chép để lấy thông tin đăng nhập</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Đăng nhập vào dịch vụ</p>
                      <p className="text-sm text-muted-foreground">Sử dụng thông tin để đăng nhập vào dịch vụ đã mua</p>
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
          ) : null}
        </div>
      </div>
    </div>
  )
}