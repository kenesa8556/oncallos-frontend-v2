"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useOrg } from "../../../lib/OrgContext";


interface Diagnosis {
  id: string;
  root_cause: string;
  confidence: string;
  recommended_action: string;
  status: string;
  created_at: string;
}
interface Resolution {
  id: string;
  root_cause: string;
  resolution_method: string;
  resolved: boolean;
  resolved_at: string;
}
interface Snapshot {
  id: string;
  state_data: Record<string, unknown>;
  created_at: string;
}
interface IncidentDetail {
  incident: { id: string; title: string; severity: string; status: string; created_at: string };
  diagnoses: Diagnosis[];
  resolutions: Resolution[];
  snapshots: Snapshot[];
}

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { orgId } = useOrg();

  const [data, setData] = useState<IncidentDetail | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"diagnosis" | "timeline" | "snapshots">("diagnosis");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/incidents/${id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "X-Organization-Id": orgId,
        },
      });

      if (!res.ok) {
        setError("Could not load this incident.");
        return;
      }
      setData(await res.json());
    }
    load();
  }, [id, orgId]);

  if (error) {
    return (
      <div className="text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
        {error}
      </div>
    );
  }
  if (!data) {
    return <div className="text-[13px] text-muted">Loading incident...</div>;
  }

  const { incident, diagnoses, resolutions, snapshots } = data;
  const latestDiagnosis = diagnoses[0];

  const severityPill =
    incident.severity === "high"
      ? "text-critical bg-critical-subtle"
      : incident.severity === "medium"
      ? "text-warning bg-warning-subtle"
      : "text-teal bg-[#1A3D38]";

  const timelineEvents = [
    { label: "Incident created", at: incident.created_at, color: "bg-primary" },
    ...diagnoses.map((d) => ({ label: `Diagnosis (${d.status})`, at: d.created_at, color: "bg-warning" })),
    ...resolutions.map((r) => ({ label: r.resolved ? "Resolved" : "Resolution attempted", at: r.resolved_at, color: "bg-success" })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const tabs = [
    { id: "diagnosis" as const, label: "Diagnosis" },
    { id: "timeline" as const, label: "Timeline" },
    { id: "snapshots" as const, label: `Snapshots (${snapshots.length})` },
  ];

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="text-[11.5px] font-mono text-muted">{incident.id.slice(0, 8)}</span>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${severityPill}`}>{incident.severity}</span>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                incident.status === "resolved" ? "text-success bg-success-subtle" : "text-warning bg-warning-subtle"
              }`}
            >
              {incident.status}
            </span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight">{incident.title}</h1>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-[13px] font-medium px-3.5 py-2.5 border-b-2 transition-colors ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "diagnosis" && (
        <div className="bg-white border border-border rounded-[8px] p-6">
          {!latestDiagnosis ? (
            <p className="text-[13px] text-muted">No diagnosis has been generated for this incident yet.</p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11.5px] font-mono text-muted uppercase">Confidence</span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    latestDiagnosis.confidence === "high"
                      ? "text-success bg-success-subtle"
                      : latestDiagnosis.confidence === "medium"
                      ? "text-warning bg-warning-subtle"
                      : "text-critical bg-critical-subtle"
                  }`}
                >
                  {latestDiagnosis.confidence}
                </span>
              </div>
              <div className="mb-5">
                <div className="text-[11.5px] font-mono text-muted uppercase mb-1.5">Root cause</div>
                <p className="text-[14px] leading-[1.6]">{latestDiagnosis.root_cause}</p>
              </div>
              <div>
                <div className="text-[11.5px] font-mono text-muted uppercase mb-1.5">Recommended action</div>
                <div className="bg-surface border border-border rounded-[6px] px-3.5 py-3 font-mono text-[13px] text-ink">
                  {latestDiagnosis.recommended_action}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "timeline" && (
        <div className="bg-white border border-border rounded-[8px] p-6">
          <div className="flex flex-col gap-4">
            {timelineEvents.map((ev, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ev.color}`} />
                <div>
                  <div className="text-[13px]">{ev.label}</div>
                  <div className="text-[11.5px] font-mono text-muted">{new Date(ev.at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "snapshots" && (
        <div className="bg-white border border-border rounded-[8px] p-6">
          {snapshots.length === 0 ? (
            <p className="text-[13px] text-muted">
              No snapshot was taken for this incident — stateless actions (like restarts) don&apos;t require one.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {snapshots.map((s) => (
                <div key={s.id} className="bg-surface border border-border rounded-[6px] p-3.5">
                  <div className="text-[11.5px] font-mono text-muted mb-2">{new Date(s.created_at).toLocaleString()}</div>
                  <pre className="text-[12px] font-mono text-ink whitespace-pre-wrap break-all">
                    {JSON.stringify(s.state_data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}