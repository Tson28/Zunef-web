import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Download } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    customer: "Nguyễn Văn A",
    product: "ChatGPT Plus Premium Account",
    amount: 450000,
    status: "completed",
    date: "2024-01-15",
    email: "nguyenvana@email.com",
  },
  {
    id: "ORD-002",
    customer: "Trần Thị B",
    product: "GitHub Copilot Business",
    amount: 350000,
    status: "pending",
    date: "2024-01-14",
    email: "tranthib@email.com",
  },
  {
    id: "ORD-003",
    customer: "Lê Văn C",
    product: "JetBrains All Products Pack",
    amount: 1200000,
    status: "completed",
    date: "2024-01-13",
    email: "levanc@email.com",
  },
  {
    id: "ORD-004",
    customer: "Phạm Thị D",
    product: "Next.js SaaS Boilerplate",
    amount: 1500000,
    status: "processing",
    date: "2024-01-12",
    email: "phamthid@email.com",
  },
]

const statusColors = {
  completed: "bg-green-500",
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  cancelled: "bg-red-500",
}

const statusLabels = {
  completed: "Hoàn thành",
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  cancelled: "Đã hủy",
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <div className="lg:pl-64">
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Quản lý đơn hàng</h1>
            <p className="text-muted-foreground">Theo dõi và quản lý tất cả đơn hàng</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle>Danh sách đơn hàng</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm kiếm đơn hàng..." className="pl-10 w-64" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Mã đơn</th>
                      <th className="text-left py-3 px-4 font-medium">Khách hàng</th>
                      <th className="text-left py-3 px-4 font-medium">Sản phẩm</th>
                      <th className="text-left py-3 px-4 font-medium">Số tiền</th>
                      <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                      <th className="text-left py-3 px-4 font-medium">Ngày</th>
                      <th className="text-left py-3 px-4 font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{order.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-sm text-muted-foreground">{order.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="truncate">{order.product}</p>
                        </td>
                        <td className="py-3 px-4 font-medium">{order.amount.toLocaleString("vi-VN")}đ</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={`${statusColors[order.status as keyof typeof statusColors]} text-white`}
                          >
                            {statusLabels[order.status as keyof typeof statusLabels]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{order.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
