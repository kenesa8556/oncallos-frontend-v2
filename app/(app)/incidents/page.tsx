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

export default function IncidentsPage() {
  const { orgId } = useOrg();
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

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

  const severityPill = (s: string) =>
    s === "high"
      ? "text-critical bg-critical-subtle"
      : s === "medium"
      ? "text-warning bg-warning-subtle"
      : "text-teal bg-[#1A3D38]";

  const filtered = incidents?.filter((i) => {
    const statusOk = statusFilter === "all" || (statusFilter === "resolved" ? i.status === "resolved" : i.status !== "resolved");
    const severityOk = severityFilter === "all" || i.severity === severityFilter;
    return statusOk && severityOk;
  });

  const selectClass =
    "bg-white border border-border rounded-[6px] px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-primary transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-[19px] font-bold tracking-tight">Incidents</h1>
        <div className="flex items-center gap-2.5 flex-wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className={selectClass}>
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-[8px] overflow-hidden">
        {incidents === null && !error && (
          <div className="px-[18px] py-10 text-center text-[13px] text-muted">Loading incidents...</div>
        )}

        {incidents !== null && filtered?.length === 0 && (
          <div className="px-[18px] py-10 text-center text-[13px] text-muted">
            {incidents.length === 0
              ? "No incidents yet — they'll show up here once your first alert fires."
              : "No incidents match the current filters."}
          </div>
        )}

        {filtered?.map((incident) => (
          <Link
            key={incident.id}
            href={`/incidents/${incident.id}`}
            className="flex border-b border-border-subtle last:border-b-0 hover:bg-[#2A2D2E] transition-colors"
          >
            <div className={`w-[3px] shrink-0 ${incident.status === "resolved" ? "bg-success" : "bg-warning"}`} />
            <div className="flex-1 flex flex-wrap items-center justify-between gap-2 px-4 py-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[11px] font-mono text-muted shrink-0">{incident.id.slice(0, 8)}</span>
                <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${severityPill(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-[13.5px] truncate">{incident.title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-full ${
                    incident.status === "resolved" ? "text-success bg-success-subtle" : "text-warning bg-warning-subtle"
                  }`}
                >
                  {incident.status}
                </span>
                <span className="text-[11px] text-muted font-mono whitespace-nowrap">
                  {new Date(incident.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  {" · "}
                  {new Date(incident.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered && filtered.length > 0 && (
        <p className="mt-3 text-[12px] text-muted">
          {filtered.length} of {incidents?.length} incident{incidents?.length === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}