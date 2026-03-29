"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logout } from "@/services/auth";
import type { UserWithProfile } from "@/types";

export function AppSidebar({ user }: { user: UserWithProfile }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const displayName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email;

  const initials = user.profile
    ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`
    : user.email[0].toUpperCase();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-sidebar-primary">SGO</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {filteredItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors justify-center",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    />
                  }
                >
                  <item.icon className="size-5 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <div className={cn("p-3 flex items-center gap-3", collapsed && "justify-center")}>
        {!collapsed && (
          <>
            <div className="flex size-8 shrink-0 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user.role}
              </p>
            </div>
          </>
        )}
        <form action={logout}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                />
              }
            >
              <LogOut className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </aside>
  );
}
