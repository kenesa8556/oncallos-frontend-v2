"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const mainNav = [
  { href: "/dashboard", icon: "▦", label: "Dashboard" },
  { href: "/incidents", icon: "⚠", label: "Incidents" },
  { href: "/approvals", icon: "✓", label: "Approvals", badge: true },
];

const settingsNav = [
  { href: "/settings/organization", icon: "◧", label: "Organization" },
  { href: "/settings/team", icon: "👥", label: "Team" },
  { href: "/settings/api-keys", icon: "🔑", label: "API Keys" },
  { href: "/settings/risk-rules", icon: "⚖", label: "Risk Rules" },
  { href: "/settings/billing", icon: "💳", label: "Billing" },
];

export default function AppShell({
  children,
  userEmail,
  userRole,
  orgId,
  orgName,
  orgPlan,
}: {
  children: React.ReactNode;
  userEmail: string;
  userRole: string;
  orgId: string;
  orgName: string;
  orgPlan: string;
}) {
  const pathname = usePathname();
  const initials = orgName.slice(0, 2).toUpperCase();
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  const titleFor = (path: string) => {
    const all = [...mainNav, ...settingsNav];
    return all.find((i) => path.startsWith(i.href))?.label ?? "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-surface text-ink text-[14px]">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 bg-white border-r border-border flex flex-col">
        <div className="p-3.5 border-b border-border">
          <button className="w-full flex items-center gap-2.5 bg-[#2D2D30] border border-border rounded-[7px] px-2.5 py-2 text-left hover:bg-[#2A2D2E] transition-colors">
            <div className="w-[22px] h-[22px] rounded-[5px] bg-primary-hover flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{orgName}</div>
              <div className="text-[10.5px] text-muted font-mono uppercase">{orgPlan} plan</div>
            </div>
            <span className="text-[10px] text-muted/70">▾</span>
          </button>
        </div>

        <nav className="p-2">
          {mainNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2 py-1.75 rounded-[6px] text-[13px] font-medium mb-0.5 transition-colors ${
                  active ? "bg-primary-subtle text-primary" : "text-slate hover:bg-[#2A2D2E] hover:text-ink"
                }`}
              >
                <span className="w-[15px] text-center text-[13px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10.5px] font-mono bg-warning/15 text-warning rounded-full px-1.5">1</span>
                )}
              </Link>
            );
          })}
        </nav>

        <nav className="p-2">
          <div className="text-[10.5px] font-mono text-muted/70 uppercase tracking-wider px-2 pt-2.5 pb-1.5">
            Settings
          </div>
          {settingsNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-2 py-1.75 rounded-[6px] text-[13px] font-medium mb-0.5 transition-colors ${
                  active ? "bg-primary-subtle text-primary" : "text-slate hover:bg-[#2A2D2E] hover:text-ink"
                }`}
              >
                <span className="w-[15px] text-center text-[13px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-3.5 border-t border-border flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-full bg-purple text-surface flex items-center justify-center text-[11px] font-bold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate">{userEmail}</div>
            <div className="text-[10.5px] text-muted/70 font-mono">{userRole}</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-14 shrink-0 border-b border-border flex items-center justify-between px-6">
          <div className="text-[14px] font-semibold flex items-center gap-2">
            {orgName} <span className="text-muted/70 font-normal">/ {titleFor(pathname)}</span>
          </div>
          <button className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center text-slate hover:bg-white hover:border hover:border-border transition-colors relative">
            🔔
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-critical" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}