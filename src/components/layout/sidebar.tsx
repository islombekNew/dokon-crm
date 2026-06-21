"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, Bookmark, Ruler, Palette,
  Warehouse, ShoppingCart, Users, CreditCard, Truck,
  GitBranch, BarChart2, Users2, Shield, Receipt,
  ClipboardList, Settings, ChevronDown, Store, AlertTriangle,
  TrendingUp, Award, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Mahsulotlar", icon: Package, children: [
      { title: "Barcha mahsulotlar", href: "/products" },
      { title: "Yangi mahsulot", href: "/products/new" },
      { title: "Kategoriyalar", href: "/categories" },
      { title: "Brendlar", href: "/brands" },
      { title: "O'lchamlar", href: "/sizes" },
      { title: "Ranglar", href: "/colors" },
    ]
  },
  {
    title: "Ombor", icon: Warehouse, children: [
      { title: "Ombor holati", href: "/warehouse" },
      { title: "Kirim", href: "/warehouse/stock-in" },
      { title: "Chiqim", href: "/warehouse/stock-out" },
      { title: "O'tkazma", href: "/warehouse/transfer" },
      { title: "Harakatlar", href: "/warehouse/movements" },
      { title: "Kam qolganlar", href: "/warehouse/low-stock" },
    ]
  },
  { title: "POS — Savdo", href: "/pos", icon: Store },
  {
    title: "Sotuvlar", icon: ShoppingCart, children: [
      { title: "Barcha sotuvlar", href: "/sales" },
    ]
  },
  { title: "Mijozlar", href: "/customers", icon: Users },
  {
    title: "Qarzlar", icon: CreditCard, children: [
      { title: "Barcha qarzlar", href: "/debts" },
      { title: "Muddati o'tgan", href: "/debts/overdue" },
    ]
  },
  { title: "To'lovlar", href: "/payments", icon: Receipt },
  { title: "Ta'minotchilar", href: "/suppliers", icon: Truck },
  { title: "Xarajatlar", href: "/expenses", icon: ClipboardList },
  { title: "Filiallar", href: "/branches", icon: GitBranch },
  {
    title: "Hisobotlar", icon: BarChart2, children: [
      { title: "Sotuvlar grafigi", href: "/reports/sales" },
      { title: "Foyda", href: "/reports/profit" },
      { title: "Top mahsulotlar", href: "/reports/top-products" },
      { title: "Top kategoriyalar", href: "/reports/top-categories" },
      { title: "Top brendlar", href: "/reports/top-brands" },
    ]
  },
  { title: "Xodimlar", href: "/employees", icon: Users2 },
  {
    title: "Rollar", icon: Shield, children: [
      { title: "Barcha rollar", href: "/roles" },
    ]
  },
  { title: "Audit jurnali", href: "/audit-logs", icon: ClipboardList },
  {
    title: "Sozlamalar", icon: Settings, children: [
      { title: "Profil", href: "/settings/profile" },
      { title: "Filial", href: "/settings/branch" },
      { title: "Telegram bot", href: "/settings/telegram-bot" },
    ]
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => pathname.startsWith(c.href)) || false
  );

  if (item.children) {
    const isActive = item.children.some((c) => pathname.startsWith(c.href));
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.title}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-1 border-l pl-3">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                  pathname === child.href || pathname.startsWith(child.href + "/")
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href!));

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.title}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Store className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground">RetailCRM</p>
          <p className="text-xs text-muted-foreground">Do'kon boshqaruvi</p>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.title} item={item} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
