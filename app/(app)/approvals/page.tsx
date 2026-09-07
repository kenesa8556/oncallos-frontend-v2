"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useOrg } from "../../lib/OrgContext";

interface PendingDiagnosis {
  id: string;
  incident_id: string;
  root_cause: string;
  recommended_action: string;
  confidence: string;
  created_at: string;
  incidents: { title: string; severity: string };
}

export default function ApprovalsPage() {
  const { orgId } = useOrg();
  const [items, setItems] = useState<PendingDiagnosis[] | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [actingOn, setActingOn] = useState<string | null>(null);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setToken(session.access_token);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/diagnoses/pending`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-Organization-Id": orgId,
      },
    });

    if (!res.ok) {
      setError("Could not load pending approvals.");
      return;
    }
    setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, [orgId]);

  async function decide(diagnosisId: string, status: "approved" | "rejected") {
    setActingOn(diagnosisId);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/diagnoses/${diagnosisId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-Id": orgId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    setActingOn(null);

    if (!res.ok) {
      setError(`Could not ${status === "approved" ? "approve" : "deny"} this action.`);
      return;
    }
    setItems((prev) => prev?.filter((i) => i.id !== diagnosisId) ?? null);
  }

  const severityPill = (s: string) =>
    s === "high"
      ? "text-critical bg-critical-subtle"
      : s === "medium"
      ? "text-warning bg-warning-subtle"
      : "text-teal bg-[#1A3D38]";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[19px] font-bold tracking-tight mb-1">Approvals</h1>
        <p className="text-[13px] text-muted">
          High-risk actions wait here until a human signs off — nothing executes silently.
        </p>
      </div>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      {items === null && !error && <div className="text-[13px] text-muted">Loading...</div>}

      {items?.length === 0 && (
        <div className="bg-white border border-border rounded-[8px] px-6 py-10 text-center text-[13px] text-muted">
          Nothing waiting on approval right now.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {items?.map((item) => (
          <div key={item.id} className="bg-white border border-warning/30 rounded-[8px] overflow-hidden">
            <div className="flex w-full">
              <div className="w-[3px] shrink-0 bg-warning" />
              <div className="flex-1 p-5">
                <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${severityPill(item.incidents.severity)}`}>
                    {item.incidents.severity}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full text-warning bg-warning-subtle">
                    pending approval
                  </span>
                  <span className="text-[11px] font-mono text-muted">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-[15px] font-semibold mb-3">{item.incidents.title}</h3>

                <div className="mb-3">
                  <div className="text-[11px] font-mono text-muted uppercase mb-1">Root cause</div>
                  <p className="text-[13.5px] leading-[1.6] text-slate">{item.root_cause}</p>
                </div>

                <div className="mb-4">
                  <div className="text-[11px] font-mono text-muted uppercase mb-1">Recommended action</div>
                  <div className="bg-surface border border-border rounded-[6px] px-3 py-2.5 font-mono text-[12.5px]">
                    {item.recommended_action}
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => decide(item.id, "approved")}
                    disabled={actingOn === item.id}
                    className="text-[13px] font-semibold px-4 py-2 rounded-[6px] bg-success text-surface hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {actingOn === item.id ? "Working..." : "Approve"}
                  </button>
                  <button
                    onClick={() => decide(item.id, "rejected")}
                    disabled={actingOn === item.id}
                    className="text-[13px] font-semibold px-4 py-2 rounded-[6px] border border-border text-slate hover:bg-surface transition-colors disabled:opacity-50"
                  >
                    Deny
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}