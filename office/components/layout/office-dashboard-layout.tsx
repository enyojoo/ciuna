"use client"

import type React from "react"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  CreditCard,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Gift,
  Store,
  HandHelping,
  UserCircle,
  ClipboardList,
  ChevronRight,
  Package,
} from "lucide-react"
import { BrandLogo } from "@ciuna/shared"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { officeDataStore } from "@/lib/office-data-store"
import { cn } from "@/lib/utils"

interface OfficeDashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Assistant", href: "/assistant", icon: HandHelping },
  { name: "Experts", href: "/experts", icon: UserCircle },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Referrals", href: "/referrals", icon: Gift },
  { name: "Compliance", href: "/compliance", icon: ShieldCheck },
  { name: "Rates", href: "/rates", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
]

/** Sidebar active state for Hub marketplace links using `?line=` (food | mart). */
function hubSubLinkActive(pathname: string | null, lineParam: string, href: string): boolean {
  let u: URL
  try {
    u = new URL(href, "https://office.ciuna.internal")
  } catch {
    return false
  }
  const path = u.pathname
  const wantLine = (u.searchParams.get("line") || "").trim().toLowerCase()
  const cur = lineParam.trim().toLowerCase()

  if (path === "/hub") {
    if (pathname !== "/hub") return false
    if (!wantLine) return !cur
    return cur === wantLine
  }
  if (path === "/hub/vendors") {
    if (!pathname?.startsWith("/hub/vendors")) return false
    if (!wantLine) return !cur
    return cur === wantLine
  }
  return false
}

function HubMarketplaceSubnav({
  pathname,
  onNavigate,
}: {
  pathname: string | null
  onNavigate: () => void
}) {
  const searchParams = useSearchParams()
  const hubLineParam = (searchParams.get("line") || "").trim().toLowerCase()

  return (
    <div className="mt-1 space-y-0.5 border-l border-sidebar-border/80 ml-[1.125rem] pl-2">
      <Link
        href="/hub"
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
          hubSubLinkActive(pathname, hubLineParam, "/hub")
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={onNavigate}
      >
        <Package className="h-4 w-4 shrink-0 opacity-80" />
        <span className="truncate">All products</span>
      </Link>
      <Link
        href="/hub/vendors"
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
          hubSubLinkActive(pathname, hubLineParam, "/hub/vendors")
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={onNavigate}
      >
        <Store className="h-4 w-4 shrink-0 opacity-80" />
        <span className="truncate">All vendors</span>
      </Link>

      <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Food</p>
      <Link
        href="/hub?line=food"
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
          hubSubLinkActive(pathname, hubLineParam, "/hub?line=food")
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={onNavigate}
      >
        <Package className="h-4 w-4 shrink-0 opacity-80" />
        <span className="truncate">Products</span>
      </Link>
      <Link
        href="/hub/vendors?line=food"
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
          hubSubLinkActive(pathname, hubLineParam, "/hub/vendors?line=food")
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={onNavigate}
      >
        <Store className="h-4 w-4 shrink-0 opacity-80" />
        <span className="truncate">Vendors</span>
      </Link>

      <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Mart</p>
      <Link
        href="/hub?line=mart"
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
          hubSubLinkActive(pathname, hubLineParam, "/hub?line=mart")
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={onNavigate}
      >
        <Package className="h-4 w-4 shrink-0 opacity-80" />
        <span className="truncate">Products</span>
      </Link>
      <Link
        href="/hub/vendors?line=mart"
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
          hubSubLinkActive(pathname, hubLineParam, "/hub/vendors?line=mart")
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={onNavigate}
      >
        <Store className="h-4 w-4 shrink-0 opacity-80" />
        <span className="truncate">Vendors</span>
      </Link>
    </div>
  )
}

export function OfficeDashboardLayout({ children }: OfficeDashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hubNavOpen, setHubNavOpen] = useState(true)
  const { signOut } = useAuth()

  useEffect(() => {
    if (pathname === "/hub" || pathname?.startsWith("/hub/")) setHubNavOpen(true)
  }, [pathname])

  const handleLogout = async () => {
    try {
      officeDataStore.clearDataCache()
      officeDataStore.destroy()
      await signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/auth/login")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 border-r bg-sidebar flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full w-full">
          <div className="flex items-center justify-between px-6 h-16 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <span className="text-sm text-primary font-medium">Office</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                pathname === "/dashboard" || Boolean(pathname?.startsWith("/dashboard/"))
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </Link>

            <div className="pt-1">
              <div className="flex items-center gap-0.5 rounded-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground"
                  aria-expanded={hubNavOpen}
                  aria-label={hubNavOpen ? "Collapse Hub menu" : "Expand Hub menu"}
                  onClick={() => setHubNavOpen((o) => !o)}
                >
                  <ChevronRight className={cn("h-4 w-4 transition-transform", hubNavOpen && "rotate-90")} />
                </Button>
                <Link
                  href="/hub"
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium transition-all duration-200",
                    pathname === "/hub" || Boolean(pathname?.startsWith("/hub/"))
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Store className="h-5 w-5 shrink-0" />
                  <span className="truncate">Hub</span>
                </Link>
              </div>

              {hubNavOpen ? (
                <Suspense
                  fallback={
                    <div
                      className="mt-1 ml-[1.125rem] min-h-[11rem] rounded-md border border-dashed border-sidebar-border/60 pl-2"
                      aria-hidden
                    />
                  }
                >
                  <HubMarketplaceSubnav pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
                </Suspense>
              ) : null}
            </div>

            {navigation.map((item) => {
              const isActive =
                item.href === "/assistant"
                  ? pathname === "/assistant" || Boolean(pathname?.startsWith("/assistant/"))
                  : item.href === "/experts"
                    ? pathname === "/experts" || Boolean(pathname?.startsWith("/experts/"))
                    : pathname === item.href || Boolean(pathname?.startsWith(item.href + "/"))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="px-3 py-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-accent-foreground hover:bg-accent px-3 py-3"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-56">
        <div className="bg-background border-b border-sidebar-border px-4 h-16 flex items-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1"></div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
