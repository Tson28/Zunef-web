"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSidebar } from "@/lib/sidebar-context"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Edit, Eye, Search, Filter, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface UserAccountInfo {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  orderId: string
  productId: {
    _id: string
    name: string
  }
  productName: string
  username: string | null
  password: string | null
  email: string | null
  additionalInfo: string | null
  isReady: boolean
  deliveredAt: string | null
  expiresAt: string | null
  updatedBy: string | null
  notes: string | null
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

interface EditFormData {
  username: string
  password: string
  email: string
  additionalInfo: string
  notes: string
  expiresAt: string
}

export default function AccountProvisioningPage() {
  const { user: currentUser } = useAuth()
  const { isCollapsed } = useSidebar()
  const [accounts, setAccounts] = useState<UserAccountInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<UserAccountInfo | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    username: "",
    password: "",
    email: "",
    additionalInfo: "",
    notes: "",
    expiresAt: ""
  })

  const itemsPerPage = 10

  // Fetch accounts data
  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`http://localhost:5000/api/admin/account-info?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch accounts')
      }

      const data = await response.json()
      setAccounts(data.accounts || [])
      setTotalCount(data.total || 0)
      setError(null)
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Không thể tải danh sách tài khoản')
    } finally {
      setLoading(false)
    }
  }

  // Update account info
  const handleUpdateAccount = async () => {
    if (!selectedAccount) return

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`http://localhost:5000/api/admin/account-info/${selectedAccount._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editFormData,
          expiresAt: editFormData.expiresAt ? new Date(editFormData.expiresAt).toISOString() : null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update account')
      }

      toast.success('Cập nhật thông tin tài khoản thành công')
      setIsEditDialogOpen(false)
      fetchAccounts()
    } catch (err) {
      console.error('Error updating account:', err)
      toast.error('Không thể cập nhật thông tin tài khoản')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mark account as ready
  const handleMarkReady = async (accountId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`http://localhost:5000/api/admin/account-info/${accountId}/ready`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to mark account as ready')
      }

      toast.success('Đã đánh dấu tài khoản sẵn sàng')
      fetchAccounts()
    } catch (err) {
      console.error('Error marking account as ready:', err)
      toast.error('Không thể đánh dấu tài khoản sẵn sàng')
    }
  }

  // Open edit dialog
  const openEditDialog = (account: UserAccountInfo) => {
    setSelectedAccount(account)
    setEditFormData({
      username: account.username || "",
      password: account.password || "",
      email: account.email || "",
      additionalInfo: account.additionalInfo || "",
      notes: account.notes || "",
      expiresAt: account.expiresAt ? new Date(account.expiresAt).toISOString().split('T')[0] : ""
    })
    setIsEditDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (account: UserAccountInfo) => {
    setSelectedAccount(account)
    setIsViewDialogOpen(true)
  }

  // Get status badge
  const getStatusBadge = (account: UserAccountInfo) => {
    if (account.isReady) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Sẵn sàng</Badge>
    } else if (account.username && account.password) {
      return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Chờ xác nhận</Badge>
    } else {
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Chờ cấp</Badge>
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  useEffect(() => {
    fetchAccounts()
  }, [currentPage, searchQuery, statusFilter])

  // Check admin permission
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <>
        <DashboardSidebar />
        <div className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
          <div className="p-6 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h1>
              <p className="text-muted-foreground">Bạn không có quyền truy cập trang này.</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardSidebar />
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Cấp tài khoản dịch vụ</h1>
            <p className="text-muted-foreground">Quản lý việc cấp tài khoản dịch vụ cho người dùng</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle>Danh sách tài khoản ({totalCount})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Tìm kiếm theo tên, email, sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ cấp</SelectItem>
                      <SelectItem value="ready">Sẵn sàng</SelectItem>
                      <SelectItem value="delivered">Đã giao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Đang tải...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Không có dữ liệu</div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Mã đơn hàng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{account.userId.name}</div>
                              <div className="text-sm text-muted-foreground">{account.userId.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{account.productName}</div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{account.orderId}</code>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(account)}
                          </TableCell>
                          <TableCell>
                            {formatDate(account.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openViewDialog(account)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(account)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!account.isReady && account.username && account.password && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleMarkReady(account._id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCount)} của {totalCount} kết quả
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage * itemsPerPage >= totalCount}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin tài khoản</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin đăng nhập cho khách hàng {selectedAccount?.userId.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email tài khoản</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Nhập email tài khoản"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Ngày hết hạn</Label>
              <Input
                id="expiresAt"
                type="date"
                value={editFormData.expiresAt}
                onChange={(e) => setEditFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Thông tin bổ sung</Label>
              <Textarea
                id="additionalInfo"
                value={editFormData.additionalInfo}
                onChange={(e) => setEditFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                placeholder="Nhập thông tin bổ sung (nếu có)"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Nhập ghi chú cho admin"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateAccount} disabled={isSubmitting}>
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết tài khoản</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết tài khoản của {selectedAccount?.userId.name}
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Khách hàng</Label>
                  <p className="mt-1">{selectedAccount.userId.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAccount.userId.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Sản phẩm</Label>
                  <p className="mt-1">{selectedAccount.productName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mã đơn hàng</Label>
                  <p className="mt-1 font-mono text-sm">{selectedAccount.orderId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(selectedAccount)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tên đăng nhập</Label>
                  <p className="mt-1">{selectedAccount.username || "Chưa cấp"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mật khẩu</Label>
                  <p className="mt-1">{selectedAccount.password ? "••••••••" : "Chưa cấp"}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email tài khoản</Label>
                <p className="mt-1">{selectedAccount.email || "Chưa cấp"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ngày tạo</Label>
                  <p className="mt-1">{formatDate(selectedAccount.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ngày hết hạn</Label>
                  <p className="mt-1">{selectedAccount.expiresAt ? formatDate(selectedAccount.expiresAt) : "Không giới hạn"}</p>
                </div>
              </div>
              {selectedAccount.additionalInfo && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Thông tin bổ sung</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedAccount.additionalInfo}</p>
                </div>
              )}
              {selectedAccount.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ghi chú</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedAccount.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}