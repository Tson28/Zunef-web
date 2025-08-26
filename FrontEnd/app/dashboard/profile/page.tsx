"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/lib/sidebar-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ProfilePage() {
  const { isCollapsed } = useSidebar()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    secondaryEmail: "",
    phoneNumber: "",
    avatar: ""
  })
  const [avatarPreview, setAvatarPreview] = useState("/placeholder.svg")

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          toast({
            title: "Lỗi",
            description: "Vui lòng đăng nhập lại",
            variant: "destructive"
          })
          return
        }

        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setProfileData(data.data)
            if (data.data.avatar) {
              setAvatarPreview(`data:image/jpeg;base64,${data.data.avatar}`)
            }
          }
        }
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin profile",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleAvatarClick = () => {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement
    fileInput?.click()
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Convert file to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      const base64Data = base64.split(',')[1] // Remove data:image/jpeg;base64, prefix
      setProfileData(prev => ({ ...prev, avatar: base64Data }))
      setAvatarPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleProfileUpdate = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Thành công",
            description: "Cập nhật thông tin thành công!"
          })
        } else {
          toast({
            title: "Lỗi",
            description: data.message || "Có lỗi xảy ra",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật thông tin",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Lỗi kết nối đến server",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <div className={`transition-all duration-300 ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Thông tin tài khoản</h1>
            <p className="text-muted-foreground">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Picture */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Ảnh đại diện</h3>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarPreview} alt="Profile" />
                      <AvatarFallback>{profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" onClick={handleAvatarClick}>
                        <Camera className="mr-2 h-4 w-4" />
                        Tải ảnh lên
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        JPG, PNG hoặc GIF (tối đa 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email chính</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        placeholder="Email chính (không thể thay đổi)"
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryEmail">Email phụ</Label>
                      <Input
                        id="secondaryEmail"
                        type="email"
                        value={profileData.secondaryEmail}
                        onChange={(e) => handleInputChange('secondaryEmail', e.target.value)}
                        placeholder="Nhập email phụ (tùy chọn)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Số điện thoại</Label>
                      <Input
                        id="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleProfileUpdate} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
