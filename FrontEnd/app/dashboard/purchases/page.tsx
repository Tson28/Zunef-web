"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Copy, ExternalLink, Key, Mail, ShoppingBag, FileArchive } from "lucide-react"
import { toast } from "sonner"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { useSidebar } from "@/lib/sidebar-context"
import { API_BASE_URL } from "@/lib/api"
import { DownloadModal } from "@/components/modals/download-modal"
import { AccountInfoModal } from "@/components/modals/account-info-modal"



export default function PurchasesPage() {
  const { isCollapsed } = useSidebar()
  const [selectedItem, setSelectedItem] = useState(null)
  const [purchasedItems, setPurchasedItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previousItemsCount, setPreviousItemsCount] = useState(0)
  
  // Modal states
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [selectedProductName, setSelectedProductName] = useState('')

  // Fetch purchased items from payments API
  const fetchPurchasedItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vui lòng đăng nhập để xem đơn hàng')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/payment/my-payments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Không thể tải danh sách đơn hàng')
      }

      const data = await response.json()

      
      // Transform payment data to match UI structure and filter out pending payments
      const transformedItems = data.data?.filter((payment: any) => payment.status !== 'pending')
        .map((payment: any) => {
          return {
            id: payment._id,
            orderId: payment.orderId,
            name: payment.items?.map((item: any) => item.title || item.name).join(', ') || 'Đơn hàng',
            price: payment.amount,
            purchaseDate: payment.paymentDate,
            status: payment.status === 'completed' ? 'active' : payment.status,
            category: 'Sản phẩm số',
            transactionCode: payment.transactionCode,
            bankInfo: payment.bankInfo,
            customerInfo: payment.customerInfo,
            items: payment.items || [],
            type: 'purchase' // Default type for payments
          }
        }) || []
      // Check for new completed payments and show notification
       if (previousItemsCount > 0 && transformedItems.length > previousItemsCount) {
         const newItemsCount = transformedItems.length - previousItemsCount
         toast.success(`Có ${newItemsCount} đơn hàng mới được hoàn thành!`, {
           description: 'Danh sách đơn hàng đã được cập nhật'
         })
       }
       
       setPurchasedItems(transformedItems)
       setPreviousItemsCount(transformedItems.length)
       
     } catch (err: any) {
      console.error('Error fetching purchased items:', err)
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPurchasedItems()
    
    // Auto refresh every 30 seconds to check for payment updates
    const interval = setInterval(() => {
      fetchPurchasedItems()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Đã sao chép vào clipboard!")
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Đang tải xuống...")
  }

  const renderProductAccess = (item: any) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Mã giao dịch
            </Label>
            <div className="flex gap-2">
              <Input value={item.transactionCode || 'N/A'} readOnly />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(item.transactionCode || '')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Mã đơn hàng
            </Label>
            <div className="flex gap-2">
              <Input value={item.orderId || 'N/A'} readOnly />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(item.orderId || '')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Thông tin sản phẩm đã mua */}
        {item.items && item.items.length > 0 && (
          <div className="space-y-2">
            <Label>Sản phẩm đã mua</Label>
            <div className="space-y-2">
              {item.items.map((product: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{product.title || product.name || 'Sản phẩm'}</p>
                      <p className="text-sm text-muted-foreground">Số lượng: {product.quantity || 1}</p>
                      <p className="text-sm text-muted-foreground">Loại: {product.productType === 'source-code' ? 'Source Code' : 'Tài khoản'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{(product.price || 0).toLocaleString('vi-VN')}đ</p>
                      {product.productType === 'source-code' ? (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedOrderId(item.orderId)
                            setSelectedProductName(product.title || product.name || 'Source Code')
                            setDownloadModalOpen(true)
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Tải xuống
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedOrderId(item.orderId)
                            setSelectedProductName(product.title || product.name || 'Tài khoản')
                            setAccountModalOpen(true)
                          }}
                        >
                          <Key className="h-4 w-4 mr-1" />
                          Lấy thông tin
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Thông tin ngân hàng nếu có */}
        {item.bankInfo && (
          <div className="space-y-2">
            <Label>Thông tin thanh toán</Label>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm"><strong>Ngân hàng:</strong> {item.bankInfo.bankName || 'N/A'}</p>
              <p className="text-sm"><strong>Số tài khoản:</strong> {item.bankInfo.accountNumber || 'N/A'}</p>
              <p className="text-sm"><strong>Chủ tài khoản:</strong> {item.bankInfo.accountName || item.customerInfo?.fullName || item.customerInfo?.name || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Đơn hàng đã mua</h1>
            <p className="text-muted-foreground mt-2">Quản lý và truy cập các sản phẩm đã mua</p>
          </div>

          {loading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Lỗi tải dữ liệu</h3>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                  <Button onClick={() => window.location.reload()}>Thử lại</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {purchasedItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{item.name}</CardTitle>
                        <CardDescription>
                          Mua ngày {new Date(item.purchaseDate).toLocaleDateString("vi-VN")} • {item.category}
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                          {item.status === "active" ? "Đang hoạt động" : "Hoàn thành"}
                        </Badge>
                        <p className="text-lg font-semibold">{item.price.toLocaleString("vi-VN")}đ</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="access" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Thông tin đơn hàng</TabsTrigger>
                      </TabsList>
                      <TabsContent value="access" className="mt-4">
                        {renderProductAccess(item)}
                      </TabsContent>
                      <TabsContent value="info" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">Mã đơn hàng</Label>
                            <p className="font-medium">{item.orderId || `#${item.id}`}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Mã giao dịch</Label>
                            <p className="font-medium">{item.transactionCode || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Trạng thái thanh toán</Label>
                            <p className="font-medium">
                              {item.status === 'completed' ? 'Đã thanh toán' : 
                               item.status === 'pending' ? 'Đang chờ' : 
                               item.status === 'failed' ? 'Thất bại' : item.status}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Tổng tiền</Label>
                            <p className="font-medium text-lg">{item.price.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                        
                        {/* Thông tin khách hàng */}
                        {item.customerInfo && (
                          <div className="mt-6">
                            <Label className="text-muted-foreground mb-2 block">Thông tin khách hàng</Label>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-muted-foreground">Họ tên</Label>
                                  <p className="font-medium">{item.customerInfo.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Email</Label>
                                  <p className="font-medium">{item.customerInfo.email || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Số điện thoại</Label>
                                  <p className="font-medium">{item.customerInfo.phone || 'N/A'}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Địa chỉ</Label>
                                  <p className="font-medium">{item.customerInfo.address || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {purchasedItems.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Chưa có đơn hàng nào</h3>
                    <p className="text-muted-foreground">
                      Bạn chưa mua sản phẩm nào. Hãy khám phá cửa hàng để tìm sản phẩm phù hợp!
                    </p>
                  </div>
                  <Button asChild>
                    <a href="/">Khám phá sản phẩm</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <DownloadModal 
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        orderId={selectedOrderId}
        productName={selectedProductName}
      />
      
      <AccountInfoModal 
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        orderId={selectedOrderId}
        productName={selectedProductName}
      />
    </div>
  )
}
