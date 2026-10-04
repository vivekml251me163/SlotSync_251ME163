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
  Zap,
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
    <aside className="w-[240px] shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/[0.05] bg-[#020203] relative overflow-hidden">
      {/* Subtle gradient blob behind sidebar */}
      <div
        className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(94,106,210,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Brand Header */}
      <div className="relative z-10 px-5 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/25">
            <Zap className="h-3.5 w-3.5 text-primary" />
          </div>
          <h1 className="font-display text-sm font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Nav label */}
      <div className="relative z-10 px-4 pt-4 pb-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
          Navigation
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="relative z-10 flex-1 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon =
            typeof item.icon === "string"
              ? iconMap[item.icon] || Search
              : item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/15 shadow-[0_0_0_1px_rgba(94,106,210,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-primary" : ""
                }`}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Student info banner */}
      {studentMode && (
        <div className="relative z-10 mx-2 mb-2 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Students can view facility availability but cannot make bookings.
            Contact your faculty advisor to request a slot.
          </p>
        </div>
      )}

      {/* User Info & Sign Out Footer */}
      <div className="relative z-10 p-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 px-2 py-2.5 mb-2 rounded-lg bg-white/[0.02]">
          {/* Avatar */}
          <div className="h-7 w-7 shrink-0 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary uppercase">
            {userName?.charAt(0) ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
            <p className="text-[11px] text-muted-foreground/70 truncate">{userRole}</p>
          </div>
          {studentMode ? (
            <span className="inline-flex items-center rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] font-semibold bg-white/[0.04] text-muted-foreground shrink-0">
              STUDENT
            </span>
          ) : (
            <div className="shrink-0">
              <StatusBadge status={userRole || "STUDENT"} />
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20 group"
        >
          <LogOut className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
