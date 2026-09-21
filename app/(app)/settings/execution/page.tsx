"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useOrg } from "../../../lib/OrgContext";

interface CredentialStatus {
  configured: boolean;
  provider?: string;
  railway_service_id?: string;
  created_at?: string;
}

export default function ExecutionSettingsPage() {
  const { orgId, userRole } = useOrg();
  const [status, setStatus] = useState<CredentialStatus | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const [railwayToken, setRailwayToken] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [environmentId, setEnvironmentId] = useState("");

  const isOwner = userRole === "owner";

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setToken(session.access_token);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/cloud-credentials`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      setError("Could not load execution credentials.");
      return;
    }
    const data = await res.json();
    setStatus(data);
  }

  useEffect(() => {
    load();
  }, [orgId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/cloud-credentials`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: railwayToken, serviceId, environmentId }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Could not save credentials. Check your token and IDs are correct.");
      return;
    }

    setSaved(true);
    setEditing(false);
    setRailwayToken("");
    setServiceId("");
    setEnvironmentId("");
    load();
    setTimeout(() => setSaved(false), 2500);
  }

  const inputClass =
    "w-full bg-surface border border-border rounded-[6px] px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors font-mono";

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[19px] font-bold tracking-tight mb-1">Execution</h1>
      <p className="text-[13px] text-muted mb-6">
        Connect a real cloud provider so OnCallOS can automatically resolve incidents — not just diagnose them.
      </p>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-5 text-[13px] text-success bg-success-subtle/40 border border-success/30 rounded-[6px] px-3.5 py-2.5">
          Credentials saved. Low-risk incidents on this service can now be resolved automatically.
        </div>
      )}

      <div className="bg-white border border-border rounded-[8px] p-6">
        {!status && !error && <div className="text-[13px] text-muted">Loading...</div>}

        {status && !status.configured && !editing && (
          <div>
            <p className="text-[13px] text-muted mb-4">
              No execution provider connected yet. Incidents will be diagnosed but not automatically resolved.
            </p>
            {isOwner ? (
              <button
                onClick={() => setEditing(true)}
                className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors"
              >
                Connect Railway
              </button>
            ) : (
              <p className="text-[12.5px] text-muted bg-surface border border-border rounded-[6px] px-3 py-2">
                Only the organization owner can connect an execution provider.
              </p>
            )}
          </div>
        )}

        {status && status.configured && !editing && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-success-subtle text-success uppercase">
                Connected
              </span>
              <span className="text-[13px] font-medium capitalize">{status.provider}</span>
            </div>
            <div className="text-[12.5px] text-muted font-mono mb-1">Service: {status.railway_service_id}</div>
            <div className="text-[12.5px] text-muted mb-5">
              Connected {status.created_at ? new Date(status.created_at).toLocaleDateString() : ""}
            </div>
            {isOwner && (
              <button
                onClick={() => setEditing(true)}
                className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] border border-border text-ink hover:bg-surface transition-colors"
              >
                Update connection
              </button>
            )}
          </div>
        )}

        {editing && (
          <form onSubmit={handleSave} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[12.5px] font-medium text-slate mb-1.5">Railway Project Token</label>
              <input
                type="password"
                value={railwayToken}
                onChange={(e) => setRailwayToken(e.target.value)}
                required
                placeholder="Project-scoped token, not account-wide"
                className={inputClass}
              />
              <p className="text-[11.5px] text-muted mt-1.5">
                Generate one in Railway → your project → Settings → Tokens. Never paste an account-level token here.
              </p>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate mb-1.5">Service ID</label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                placeholder="Found in the service's URL on Railway"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate mb-1.5">Environment ID</label>
              <input
                type="text"
                value={environmentId}
                onChange={(e) => setEnvironmentId(e.target.value)}
                required
                placeholder="Also found in the service's URL, after ?environmentId="
                className={inputClass}
              />
            </div>

            <div className="flex gap-2.5 mt-1">
              <button
                type="submit"
                disabled={saving}
                className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save connection"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] border border-border text-slate hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}