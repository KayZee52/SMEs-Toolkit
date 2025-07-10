
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Landmark,
  AreaChart,
  ArrowRightLeft,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/expenses", label: "Expenses", icon: Landmark },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/reports", label: "Reports", icon: AreaChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg shadow-md shadow-primary/30 w-10 h-10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/smes-toolkit.png"
                  alt="SMEs Toolkit Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
            </div>
            <h1 className="font-headline text-xl font-semibold">SMEs Toolkit</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="font-body text-base"
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Footer content can go here if needed */}
      </SidebarFooter>
    </>
  );
}
