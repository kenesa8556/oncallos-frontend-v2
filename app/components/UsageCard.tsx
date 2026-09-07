"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useOrg } from "../lib/OrgContext";

interface Usage {
  plan: string;
  apiKeys: { used: number; limit: number };
  incidentsThisMonth: { used: number; limit: number | null };
}

export default function UsageCard() {
  const { orgId } = useOrg();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/api-keys/usage`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        setError("Could not load usage.");
        return;
      }
      setUsage(await res.json());
    }
    load();
  }, [orgId]);

  function bar(used: number, limit: number | null) {
    if (limit === null) return null;
    const pct = Math.min(100, Math.round((used / limit) * 100));
    const color = pct >= 90 ? "bg-critical" : pct >= 70 ? "bg-warning" : "bg-primary";
    return (
      <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-1.5">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    );
  }

  if (error) return null; // don't break the page over a non-critical widget
  if (!usage) return <div className="text-[13px] text-muted">Loading usage...</div>;

  return (
    <div className="bg-white border border-border rounded-[8px] p-6">
      <h3 className="text-[13px] font-semibold mb-4">Usage this month</h3>

      <div className="mb-4">
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-slate">API keys</span>
          <span className="font-mono text-muted">
            {usage.apiKeys.used} / {usage.apiKeys.limit}
          </span>
        </div>
        {bar(usage.apiKeys.used, usage.apiKeys.limit)}
      </div>

      <div>
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-slate">Incidents processed</span>
          <span className="font-mono text-muted">
            {usage.incidentsThisMonth.used}
            {usage.incidentsThisMonth.limit === null ? " (unlimited)" : ` / ${usage.incidentsThisMonth.limit}`}
          </span>
        </div>
        {bar(usage.incidentsThisMonth.used, usage.incidentsThisMonth.limit)}
      </div>
    </div>
  );
}