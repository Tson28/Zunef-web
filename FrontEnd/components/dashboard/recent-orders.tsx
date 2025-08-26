import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Nguyễn Văn A",
    product: "ChatGPT Plus Premium Account",
    amount: 450000,
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Trần Thị B",
    product: "GitHub Copilot Business",
    amount: 350000,
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "ORD-003",
    customer: "Lê Văn C",
    product: "JetBrains All Products Pack",
    amount: 1200000,
    status: "completed",
    date: "2024-01-13",
  },
  {
    id: "ORD-004",
    customer: "Phạm Thị D",
    product: "Next.js SaaS Boilerplate",
    amount: 1500000,
    status: "processing",
    date: "2024-01-12",
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

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>{order.customer[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-sm text-muted-foreground">{order.product}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{order.amount.toLocaleString("vi-VN")}đ</p>
                <Badge
                  variant="secondary"
                  className={`${statusColors[order.status as keyof typeof statusColors]} text-white`}
                >
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
