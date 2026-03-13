"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Ticket, Users, FileText, Settings, LogOut, Menu,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/lib/types";

const ALL_MENU_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "dashboard" },
  { label: "Tickets",   href: "/tickets",   icon: Ticket,          section: "tickets" },
  { label: "Customers", href: "/customers", icon: Users,           section: "customers" },
  { label: "Invoices",  href: "/invoices",  icon: FileText,        section: "invoices" },
  { label: "Settings",  href: "/settings",  icon: Settings,        section: "settings" },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { canAccess } = useAuth();

  return (
    <SidebarMenu>
      {ALL_MENU_ITEMS.filter(item => canAccess(item.section)).map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link href={item.href} onClick={onNavigate} className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const { user, signOut } = useAuth();
  return (
    <Sidebar className="border-border">
      <SidebarHeader className="border-b border-border px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-foreground">IR</span>
          </div>
          <span className="font-semibold text-foreground">Inferno Repair</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavItems />
      </SidebarContent>
      <SidebarFooter className="border-t border-border px-4 py-4 space-y-3">
        {user && (
          <div className="px-2">
            <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
            <Badge variant="outline" className="mt-1 text-[10px] border-primary/30 text-primary font-semibold px-1.5 py-0">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        )}
        <Button variant="outline" className="w-full justify-start gap-2 text-foreground" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <div className="flex flex-col h-full">
          <div className="border-b border-border px-6 py-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary-foreground">IR</span>
              </div>
              <span className="font-semibold text-foreground">Inferno Repair</span>
            </Link>
          </div>
          <div className="flex-1 p-2">
            <NavItems />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
