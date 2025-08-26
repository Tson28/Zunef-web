"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Bell, Shield, CreditCard, Globe } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    purchaseHistory: false,
  })

  const handleSave = () => {
    toast.success("Cài đặt đã được lưu!")
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="lg:pl-64">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Cài đặt</h1>
            <p className="text-muted-foreground mt-2">Quản lý tài khoản và tùy chọn cá nhân của bạn</p>
          </div>

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notifications">Thông báo</TabsTrigger>
              <TabsTrigger value="privacy">Quyền riêng tư</TabsTrigger>
              <TabsTrigger value="payment">Thanh toán</TabsTrigger>
              <TabsTrigger value="language">Ngôn ngữ</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Cài đặt thông báo
                  </CardTitle>
                  <CardDescription>Chọn loại thông báo bạn muốn nhận</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo email</Label>
                      <p className="text-sm text-muted-foreground">Nhận thông báo về đơn hàng và cập nhật sản phẩm</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Thông báo đẩy</Label>
                      <p className="text-sm text-muted-foreground">Nhận thông báo trực tiếp trên trình duyệt</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email marketing</Label>
                      <p className="text-sm text-muted-foreground">Nhận thông tin về sản phẩm mới và khuyến mãi</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketing: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Quyền riêng tư
                  </CardTitle>
                  <CardDescription>Kiểm soát thông tin cá nhân của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Hiển thị thông tin cá nhân</Label>
                      <p className="text-sm text-muted-foreground">Cho phép hiển thị tên và avatar trong đánh giá</p>
                    </div>
                    <Switch
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, profileVisible: checked }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lịch sử mua hàng công khai</Label>
                      <p className="text-sm text-muted-foreground">Cho phép người khác xem lịch sử mua hàng của bạn</p>
                    </div>
                    <Switch
                      checked={privacy.purchaseHistory}
                      onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, purchaseHistory: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Phương thức thanh toán
                  </CardTitle>
                  <CardDescription>Quản lý thông tin thanh toán của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có phương thức thanh toán</h3>
                    <p className="text-muted-foreground mb-4">
                      Thêm thẻ tín dụng hoặc ví điện tử để thanh toán nhanh chóng
                    </p>
                    <Button>Thêm phương thức thanh toán</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Ngôn ngữ và khu vực
                  </CardTitle>
                  <CardDescription>Tùy chỉnh ngôn ngữ và định dạng hiển thị</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ngôn ngữ</Label>
                    <select className="w-full p-2 border border-input rounded-md bg-background">
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Múi giờ</Label>
                    <select className="w-full p-2 border border-input rounded-md bg-background">
                      <option value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Định dạng tiền tệ</Label>
                    <select className="w-full p-2 border border-input rounded-md bg-background">
                      <option value="VND">VND (₫)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Lưu thay đổi</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
