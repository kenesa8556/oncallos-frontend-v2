"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useOrg } from "../../lib/OrgContext";

interface Incident {
  id: string;
  title: string;
  severity: "low" | "medium" | "high";
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { orgId } = useOrg();
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/incidents`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "X-Organization-Id": orgId,
        },
      });

      if (!res.ok) {
        setError("Could not load incidents from the backend.");
        return;
      }
      setIncidents(await res.json());
    }
    load();
  }, [orgId]);

  const open = incidents?.filter((i) => i.status !== "resolved").length ?? null;
  const resolved = incidents?.filter((i) => i.status === "resolved").length ?? null;
  const total = incidents?.length ?? null;

  const severityPill = (s: string) =>
    s === "high" ? "text-critical bg-critical-subtle" : s === "medium" ? "text-warning bg-warning-subtle" : "text-teal bg-[#1A3D38]";

  return (
    <div>
      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {[
          { title: "Open incidents", value: open, icon: "⚠", color: "text-critical bg-critical/15" },
          { title: "Resolved", value: resolved, icon: "✓", color: "text-success bg-success/15" },
          { title: "Total incidents", value: total, icon: "▤", color: "text-primary bg-primary/15" },
          { title: "Status", value: "Live", icon: "⎔", color: "text-teal bg-teal/15" },
        ].map((s) => (
          <div key={s.title} className="bg-white border border-border rounded-[8px] p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] text-muted">{s.title}</span>
              <div className={`w-[22px] h-[22px] rounded-[5px] flex items-center justify-center text-[11px] ${s.color}`}>
                {s.icon}
              </div>
            </div>
            <div className="text-[24px] font-bold font-mono">{s.value ?? "—"}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-[8px] overflow-hidden">
        <div className="px-[18px] py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="text-[13px] font-semibold">Recent incidents</h3>
          <Link href="/incidents" className="text-[12px] text-primary hover:underline">
            View all →
          </Link>
        </div>

        {incidents === null && !error && (
          <div className="px-[18px] py-8 text-center text-[13px] text-muted">Loading incidents...</div>
        )}
        {incidents?.length === 0 && (
          <div className="px-[18px] py-8 text-center text-[13px] text-muted">
            No incidents yet — they&apos;ll show up here once your first alert fires.
          </div>
        )}

        {incidents?.slice(0, 8).map((incident) => (
          <Link key={incident.id} href={`/incidents/${incident.id}`} className="flex border-b border-border-subtle last:border-b-0 hover:bg-[#2A2D2E] transition-colors">
            <div className={`w-[3px] shrink-0 ${incident.status === "resolved" ? "bg-success" : "bg-warning"}`} />
            <div className="flex-1 flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[11px] font-mono text-muted shrink-0">{incident.id.slice(0, 8)}</span>
                <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${severityPill(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-[13px] truncate">{incident.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-full ${incident.status === "resolved" ? "text-success bg-success-subtle" : "text-warning bg-warning-subtle"}`}>
                  {incident.status}
                </span>
                <span className="text-[11px] text-muted font-mono">
                  {new Date(incident.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}