"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, FileArchive, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/api"

interface DownloadInfo {
  orderId: string
  productId: string
  productName: string
  fileName: string
  fileSize: string
  downloadCount: number
  maxDownloads: number
  expiresAt: string
  isExpired: boolean
  canDownload: boolean
}

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  productName: string
}

export function DownloadModal({ isOpen, onClose, orderId, productName }: DownloadModalProps) {
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Fetch download information
  const fetchDownloadInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vui lòng đăng nhập để tải xuống')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/download/info/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Không thể tải thông tin tải xuống')
      }

      const data = await response.json()
      setDownloadInfo(data.data)
    } catch (err: any) {
      console.error('Error fetching download info:', err)
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Handle download
  const handleDownload = async () => {
    if (!downloadInfo || !downloadInfo.canDownload) {
      toast.error('Không thể tải xuống file này')
      return
    }

    try {
      setDownloading(true)
      setDownloadProgress(0)
      
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Vui lòng đăng nhập để tải xuống')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/download/source-code/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Không thể tải xuống file')
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition')
      let filename = downloadInfo.fileName
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Tải xuống thành công!')
      
      // Refresh download info to update download count
      setTimeout(() => {
        fetchDownloadInfo()
      }, 1000)
      
    } catch (err: any) {
      console.error('Error downloading file:', err)
      toast.error(err.message || 'Có lỗi xảy ra khi tải xuống')
    } finally {
      setDownloading(false)
      setDownloadProgress(0)
    }
  }

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDownloadInfo()
    }
  }, [isOpen, orderId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getRemainingDownloads = () => {
    if (!downloadInfo) return 0
    return Math.max(0, downloadInfo.maxDownloads - downloadInfo.downloadCount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Tải xuống Source Code
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
                <Button onClick={fetchDownloadInfo}>Thử lại</Button>
              </div>
            </CardContent>
          </Card>
        ) : downloadInfo ? (
          <div className="space-y-6">
            {/* Download Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileArchive className="h-5 w-5" />
                      {productName}
                    </CardTitle>
                    <CardDescription>Mã đơn hàng: {orderId}</CardDescription>
                  </div>
                  <Badge 
                    variant={downloadInfo.canDownload ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {downloadInfo.canDownload ? (
                      <><CheckCircle className="h-3 w-3" /> Có thể tải xuống</>
                    ) : downloadInfo.isExpired ? (
                      <><Clock className="h-3 w-3" /> Đã hết hạn</>
                    ) : (
                      <><AlertCircle className="h-3 w-3" /> Hết lượt tải</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tên file</p>
                    <p className="font-medium">{downloadInfo.fileName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Kích thước</p>
                    <p className="font-medium">{downloadInfo.fileSize}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Hết hạn</p>
                    <p className="font-medium">{formatDate(downloadInfo.expiresAt)}</p>
                  </div>
                </div>

                {/* Download Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lượt tải đã sử dụng</span>
                    <span>{downloadInfo.downloadCount} / {downloadInfo.maxDownloads}</span>
                  </div>
                  <Progress 
                    value={(downloadInfo.downloadCount / downloadInfo.maxDownloads) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Còn lại {getRemainingDownloads()} lượt tải xuống
                  </p>
                </div>

                {downloading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Đang tải xuống...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleDownload}
                    disabled={!downloadInfo.canDownload || downloading}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {downloading ? 'Đang tải xuống...' : 'Tải xuống'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={fetchDownloadInfo}
                    disabled={downloading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Download Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn tải xuống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Kiểm tra thông tin</p>
                    <p className="text-sm text-muted-foreground">Đảm bảo bạn có đủ lượt tải và file chưa hết hạn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Nhấn tải xuống</p>
                    <p className="text-sm text-muted-foreground">File sẽ được tải về máy tính của bạn</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Giải nén và sử dụng</p>
                    <p className="text-sm text-muted-foreground">Giải nén file .zip/.rar và làm theo hướng dẫn bên trong</p>
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
                  <p className="text-muted-foreground">Không tìm thấy thông tin tải xuống cho sản phẩm này.</p>
                </div>
                <Button onClick={fetchDownloadInfo}>Thử lại</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}