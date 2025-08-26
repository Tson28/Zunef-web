import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, Users } from "lucide-react"

const stats = [
  {
    title: "Tổng chi tiêu",
    value: "2,450,000đ",
    change: "+15.2%",
    changeType: "increase" as const,
    icon: DollarSign,
  },
  {
    title: "Đơn hàng đã mua",
    value: "12",
    change: "+3",
    changeType: "increase" as const,
    icon: ShoppingBag,
  },
  {
    title: "Sản phẩm sở hữu",
    value: "8",
    change: "+2",
    changeType: "increase" as const,
    icon: Package,
  },
  {
    title: "Điểm tích lũy",
    value: "245",
    change: "+12",
    changeType: "increase" as const,
    icon: Users,
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.changeType === "increase" ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={stat.changeType === "increase" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
              <span className="ml-1">so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
