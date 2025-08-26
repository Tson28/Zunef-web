import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { SidebarProvider } from "@/lib/sidebar-context"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "ZuneF.Com - Marketplace cho Developer",
  description: "Mua bán tài khoản AI, IDE và Source Code chất lượng cao",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <SidebarProvider>
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </SidebarProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
