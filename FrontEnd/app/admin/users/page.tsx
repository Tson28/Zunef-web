"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Edit, Trash2, Eye, Loader2, UserCheck, UserX, Key } from "lucide-react"
import { userApi, type User } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useSidebar } from "@/lib/sidebar-context"

interface UserFormData {
  name: string
  email: string
  role: string
  isVerified: boolean
}

const roles = ["user", "admin"]

function AdminUsersContent() {
  const { user: currentUser } = useAuth()
  const { isCollapsed } = useSidebar()
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "user",
    isVerified: false,
  })

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const itemsPerPage = 10

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await userApi.getAll(
        currentPage,
        itemsPerPage,
        searchQuery || undefined,
        selectedRole !== "all" ? selectedRole : undefined
      )
      
      if (response.success && response.data) {
        setUsers(response.data || [])
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages)
          setTotalCount(response.pagination.total)
        }
      } else {
        setError(response.message || "Không thể tải danh sách người dùng")
        setUsers([])
      }
    } catch (err: any) {
      setError("Lỗi kết nối đến server")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, selectedRole])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    // Direct API test removed to reduce noise
  }, [])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // Handle role filter
  const handleRoleFilter = (role: string) => {
    setSelectedRole(role)
    setCurrentPage(1)
  }

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    })
    setIsEditDialogOpen(true)
  }

  // Handle update user
  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      setIsSubmitting(true)
      const response = await userApi.update(editingUser._id, formData)
      
      if (response.success) {
        toast.success("Cập nhật người dùng thành công!")
        setIsEditDialogOpen(false)
        setEditingUser(null)
        fetchUsers()
      } else {
        toast.error(response.message || "Không thể cập nhật người dùng")
      }
    } catch (err: any) {
      toast.error("Lỗi kết nối đến server")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete user
  const handleDeleteUser = async (id: string) => {
    try {
      const response = await userApi.delete(id)
      if (response.success) {
        toast.success("Xóa người dùng thành công!")
        fetchUsers()
      } else {
        toast.error(response.message || "Không thể xóa người dùng")
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server")
    }
  }

  // Handle password update
  const handleUpdatePassword = async () => {
    if (!editingUser) return

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await userApi.updatePassword(editingUser._id, newPassword)
      
      if (response.success) {
        toast.success("Cập nhật mật khẩu thành công!")
        setIsPasswordDialogOpen(false)
        setEditingUser(null)
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(response.message || "Không thể cập nhật mật khẩu")
      }
    } catch (err) {
      toast.error("Lỗi kết nối đến server")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle password dialog
  const handlePasswordDialog = (user: User) => {
    setEditingUser(user)
    setNewPassword("")
    setConfirmPassword("")
    setIsPasswordDialogOpen(true)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "user":
        return "secondary"
      default:
        return "outline"
    }
  }

  // Get verification badge
  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge variant="default" className="bg-green-500">
        <UserCheck className="h-3 w-3 mr-1" />
        Đã xác minh
      </Badge>
    ) : (
      <Badge variant="destructive">
        <UserX className="h-3 w-3 mr-1" />
        Chưa xác minh
      </Badge>
    )
  }

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
            <h1 className="text-3xl font-bold text-foreground">Quản lý người dùng</h1>
            <p className="text-muted-foreground">Quản lý tài khoản người dùng trong hệ thống</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle>Danh sách người dùng ({totalCount})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên hoặc email..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={handleRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      <SelectItem value="user">Người dùng</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchUsers} variant="outline">
                    Thử lại
                  </Button>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Không tìm thấy người dùng nào.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Vai trò</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ngày tạo</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(user.role)}>
                                {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                              </Badge>
                            </TableCell>
                            <TableCell>{getVerificationBadge(user.isVerified)}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePasswordDialog(user)}
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                                {user.role !== "admin" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Bạn có chắc chắn muốn xóa người dùng "{user.name}"? 
                                          Hành động này không thể hoàn tác.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteUser(user._id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Xóa
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
                        {Math.min(currentPage * itemsPerPage, totalCount)} trong tổng số {totalCount} người dùng
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </Button>
                        <span className="text-sm">
                          Trang {currentPage} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Tên</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên người dùng"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Vai trò</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Người dùng</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVerified: !!checked })}
                  />
                  <Label htmlFor="isVerified">Đã xác minh email</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleUpdateUser} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Cập nhật
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Update Password Dialog */}
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Đổi mật khẩu</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleUpdatePassword} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Cập nhật
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

export default function AdminUsersPage() {
  return <AdminUsersContent />
}