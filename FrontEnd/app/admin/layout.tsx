"use client"

import { SidebarProvider } from "@/lib/sidebar-context"
import type React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        {children}
      </div>
    </SidebarProvider>
  )
}