"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  Store,
  Code,
  Cpu,
  Tags,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useSidebar } from "@/lib/sidebar-context"

const getUserSidebarItems = (userRole: string) => {
  const userItems = [
    {
      title: "Tổng quan",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Giỏ hàng",
      href: "/cart",
      icon: ShoppingCart,
    },
    {
      title: "Đơn hàng đã mua",
      href: "/dashboard/purchases",
      icon: ShoppingBag,
    },
    {
      title: "Thông tin tài khoản",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Cài đặt",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const adminItems = [
    {
      title: "Tổng quan",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Quản lý người dùng",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Quản lý cửa hàng tài khoản",
      href: "/admin/accounts",
      icon: Store,
    },
    {
      title: "Cấp tài khoản dịch vụ",
      href: "/admin/account-provisioning",
      icon: Shield,
    },
    {
      title: "Quản lý danh mục",
      href: "/admin/categories",
      icon: Tags,
    },
    {
      title: "Quản lý Source Code",
      href: "/admin/sourcecodes",
      icon: Code,
    },
    {
      title: "Quản lý IDE và Tools",
      href: "/admin/ide-tools",
      icon: Cpu,
    },
    {
      title: "Cài đặt",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return userRole === 'admin' ? adminItems : userItems;
};

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isCollapsed, toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className={`p-4 border-b border-border ${collapsed ? "px-2" : ""}`}>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name || "Người dùng"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {getUserSidebarItems(user?.role || 'user').map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                } ${collapsed ? "justify-center" : ""}`}
                onClick={() => setIsOpen(false)}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && item.title}
              </Link>
            )
          })}
        </div>

        <div className={`mt-4 pt-3 border-t border-border ${collapsed ? "px-0" : ""}`}>
          <Button variant="outline" size="sm" className="w-full h-8 text-xs bg-transparent" onClick={toggleSidebar}>
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            {!isCollapsed && <span className="ml-2">Thu gọn</span>}
          </Button>
        </div>
      </nav>

      <div className={`p-3 border-t border-border ${collapsed ? "px-2" : ""}`}>
        <Button
          variant="ghost"
          className={`w-full text-muted-foreground hover:text-foreground ${collapsed ? "justify-center px-2" : "justify-start"}`}
          onClick={logout}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-2">Đăng xuất</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:top-16 lg:bottom-0 lg:border-r lg:border-border lg:bg-card transition-all duration-300 z-30 ${
          isCollapsed ? "lg:w-16" : "lg:w-64"
        }`}
      >
        <SidebarContent collapsed={isCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
