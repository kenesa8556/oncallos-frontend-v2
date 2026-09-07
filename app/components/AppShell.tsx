"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Users,
  KeyRound,
  Scale,
  CreditCard,
  Bell,
  LogOut,
  ChevronDown,
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

  return (
    <OrgContext.Provider value={{ orgId, orgName, orgPlan, userRole, orgList }}>
      <div className="flex min-h-screen bg-surface text-ink text-[14px]">
        <aside className="w-[240px] shrink-0 bg-white border-r border-border flex flex-col">
          <div className="p-3.5 border-b border-border">
            <OrgSwitcher orgId={orgId} orgName={orgName} orgPlan={orgPlan} orgList={orgList} />
          </div>

          <nav className="p-2">
            {mainNav.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2 py-1.75 rounded-[6px] text-[13px] font-medium mb-0.5 transition-colors ${
                    active ? "bg-primary-subtle text-primary" : "text-slate hover:bg-[#2A2D2E] hover:text-ink"
                  }`}
                >
                  <Icon size={15} strokeWidth={2} className="shrink-0" />
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
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2 py-1.75 rounded-[6px] text-[13px] font-medium mb-0.5 transition-colors ${
                    active ? "bg-primary-subtle text-primary" : "text-slate hover:bg-[#2A2D2E] hover:text-ink"
                  }`}
                >
                  <Icon size={15} strokeWidth={2} className="shrink-0" />
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
            <button
              onClick={handleLogout}
              className="text-muted hover:text-critical transition-colors shrink-0"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={15} strokeWidth={2} />
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="h-14 shrink-0 border-b border-border flex items-center justify-between px-6">
            <div className="text-[14px] font-semibold flex items-center gap-2">
              {orgName} <span className="text-muted/70 font-normal">/ {titleFor(pathname)}</span>
            </div>
            <button className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center text-slate hover:bg-white hover:border hover:border-border transition-colors relative">
              <Bell size={16} strokeWidth={2} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-critical" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
        </div>
      </div>
    </OrgContext.Provider>
  );
}