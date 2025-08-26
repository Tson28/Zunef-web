"use client"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { useSidebar } from "@/lib/sidebar-context"

export default function DashboardPage() {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      <div className={`transition-all duration-300 ${isCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Chào mừng bạn quay trở lại!</p>
          </div>

          <div className="space-y-8">
            <DashboardStats />
            <RecentOrders />
          </div>
        </main>
      </div>
    </div>
  )
}
