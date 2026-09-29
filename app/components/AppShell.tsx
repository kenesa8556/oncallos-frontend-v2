"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBell from "./NotificationBell";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Users,
  KeyRound,
  Scale,
  CreditCard,
  LogOut,
  Menu,
  Zap,
  Webhook,
  X,
} from "lucide-react";
import { OrgContext } from "../lib/OrgContext";
import { supabase } from "../lib/supabase";
import OrgSwitcher from "./OrgSwitcher";

const mainNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/incidents", icon: AlertTriangle, label: "Incidents" },
  { href: "/approvals", icon: CheckCircle2, label: "Approvals", badge: true },
];

const settingsNav = [
  { href: "/settings/organization", icon: Building2, label: "Organization" },
  { href: "/settings/team", icon: Users, label: "Team" },
  { href: "/settings/api-keys", icon: KeyRound, label: "API Keys" },
  { href: "/settings/risk-rules", icon: Scale, label: "Risk Rules" },
  { href: "/settings/billing", icon: CreditCard, label: "Billing" },
  { href: "/settings/execution", icon: Zap, label: "Execution" },
  { href: "/settings/integrations/datadog", icon: Webhook, label: "Datadog" },
];

export default function AppShell({
  children,
  userEmail,
  userRole,
  orgId,
  orgName,
  orgPlan,
  orgList,
}: {
  children: React.ReactNode;
  userEmail: string;
  userRole: string;
  orgId: string;
  orgName: string;
  orgPlan: string;
  orgList: { id: string; name: string }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  const titleFor = (path: string) => {
    const all = [...mainNav, ...settingsNav];
    return all.find((i) => path.startsWith(i.href))?.label ?? "Dashboard";
  };

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const NavContent = ({ showLabels }: { showLabels: boolean }) => (
    <>
      <div className="p-3.5 border-b border-border">
        {showLabels ? (
          <OrgSwitcher orgId={orgId} orgName={orgName} orgPlan={orgPlan} orgList={orgList} />
        ) : (
          <div className="w-[22px] h-[22px] rounded-[5px] bg-primary-hover flex items-center justify-center text-[11px] font-bold text-white mx-auto">
            {orgName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <nav className="p-2">
        {mainNav.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={showLabels ? undefined : item.label}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-2.5 px-2 py-1.75 rounded-[6px] text-[13px] font-medium mb-0.5 transition-colors ${
                showLabels ? "" : "justify-center"
              } ${active ? "bg-primary-subtle text-primary" : "text-slate hover:bg-[#2A2D2E] hover:text-ink"}`}
            >
              <Icon size={15} strokeWidth={2} className="shrink-0" />
              {showLabels && <span>{item.label}</span>}
              {showLabels && item.badge && (
                <span className="ml-auto text-[10.5px] font-mono bg-warning/15 text-warning rounded-full px-1.5">1</span>
              )}
            </Link>
          );
        })}
      </nav>

      <nav className="p-2">
        {showLabels && (
          <div className="text-[10.5px] font-mono text-muted/70 uppercase tracking-wider px-2 pt-2.5 pb-1.5">
            Settings
          </div>
        )}
        {settingsNav.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={showLabels ? undefined : item.label}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-2.5 px-2 py-1.75 rounded-[6px] text-[13px] font-medium mb-0.5 transition-colors ${
                showLabels ? "" : "justify-center"
              } ${active ? "bg-primary-subtle text-primary" : "text-slate hover:bg-[#2A2D2E] hover:text-ink"}`}
            >
              <Icon size={15} strokeWidth={2} className="shrink-0" />
              {showLabels && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`mt-auto p-3.5 border-t border-border flex items-center gap-2.5 ${showLabels ? "" : "flex-col"}`}>
        <div className="w-[26px] h-[26px] rounded-full bg-purple text-surface flex items-center justify-center text-[11px] font-bold shrink-0">
          {userInitials}
        </div>
        {showLabels && (
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate">{userEmail}</div>
            <div className="text-[10.5px] text-muted/70 font-mono">{userRole}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-muted hover:text-critical transition-colors shrink-0"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={15} strokeWidth={2} />
        </button>
      </div>
    </>
  );

  return (
    <OrgContext.Provider value={{ orgId, orgName, orgPlan, userRole, orgList }}>
      <div className="flex h-screen bg-surface text-ink text-[14px] overflow-hidden">
        {/* Desktop sidebar (≥1024px) — full width with labels */}
        <aside className="hidden lg:flex w-[240px] shrink-0 bg-white border-r border-border flex-col">
          <NavContent showLabels />
        </aside>

        {/* Tablet icon rail (640-1023px) */}
        <aside className="hidden sm:flex lg:hidden w-[64px] shrink-0 bg-white border-r border-border flex-col">
          <NavContent showLabels={false} />
        </aside>

        {/* Mobile drawer (<640px) */}
        {drawerOpen && (
          <div className="sm:hidden fixed inset-0 z-40">
            <div className="fixed inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-border flex flex-col z-50">
              <div className="flex items-center justify-between px-3.5 pt-3.5">
                <span className="text-[13px] font-semibold">Menu</span>
                <button onClick={() => setDrawerOpen(false)} className="text-muted hover:text-ink">
                  <X size={18} />
                </button>
              </div>
              <NavContent showLabels />
            </aside>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="h-14 shrink-0 sticky top-0 z-30 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className="sm:hidden text-slate hover:text-ink shrink-0"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="text-[14px] font-semibold flex items-center gap-2 truncate">
                <span className="truncate">{orgName}</span>
                <span className="text-muted/70 font-normal hidden sm:inline">/ {titleFor(pathname)}</span>
              </div>
            </div>
            <NotificationBell />
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</div>
        </div>
      </div>
    </OrgContext.Provider>
  );
}