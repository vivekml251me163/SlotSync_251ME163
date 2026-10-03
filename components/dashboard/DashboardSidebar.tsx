"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  Search,
  Building2,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Building2,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  CalendarDays,
};

export interface NavItem {
  label: string;
  href: string;
  icon: string | React.ComponentType<{ className?: string }>;
}

interface DashboardSidebarProps {
  title?: string;
  navItems: NavItem[];
  userName?: string | null;
  userRole?: string | null;
  studentMode?: boolean;
}

export function DashboardSidebar({
  title = "SlotSync",
  navItems,
  userName = "User",
  userRole = "STUDENT",
  studentMode = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-border flex items-center gap-2">
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon =
            typeof item.icon === "string"
              ? iconMap[item.icon] || Search
              : item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Student info banner */}
      {studentMode && (
        <div className="mx-3 mb-3 bg-muted/40 border border-border rounded-lg p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Students can view facility availability but cannot make bookings.
            Contact your faculty advisor to request a slot.
          </p>
        </div>
      )}

      {/* User Info & Sign Out Footer */}
      <div className="p-4 border-t border-border bg-card/50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{userName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{userRole}</p>
          </div>
          {/* Neutral muted badge for student, normal StatusBadge for others */}
          {studentMode ? (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground border-border">
              STUDENT
            </span>
          ) : (
            <StatusBadge status={userRole || "STUDENT"} />
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-border"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
