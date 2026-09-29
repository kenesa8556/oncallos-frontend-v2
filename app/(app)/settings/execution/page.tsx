"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useOrg } from "../../../lib/OrgContext";

interface RailwayService {
  id: string;
  service_name: string;
  railway_service_id: string;
  created_at: string;
}

export default function ExecutionSettingsPage() {
  const { orgId, userRole } = useOrg();
  const [services, setServices] = useState<RailwayService[] | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const [serviceName, setServiceName] = useState("");
  const [railwayToken, setRailwayToken] = useState("");
  const [railwayServiceId, setRailwayServiceId] = useState("");
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
      setError("Could not load execution services.");
      return;
    }
    setServices(await res.json());
  }

  useEffect(() => {
    load();
  }, [orgId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/cloud-credentials`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceName,
        token: railwayToken,
        serviceId: railwayServiceId,
        environmentId,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? "Could not add this service. Check your token and IDs.");
      return;
    }

    setServiceName("");
    setRailwayToken("");
    setRailwayServiceId("");
    setEnvironmentId("");
    setAdding(false);
    load();
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/cloud-credentials/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setRemoving(null);

    if (!res.ok) {
      setError("Could not remove this service.");
      return;
    }
    setServices((prev) => prev?.filter((s) => s.id !== id) ?? null);
  }

  const inputClass =
    "w-full bg-surface border border-border rounded-[6px] px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors font-mono";

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[19px] font-bold tracking-tight mb-1">Execution</h1>
      <p className="text-[13px] text-muted mb-6">
        Connect the real services OnCallOS can act on. Each one is matched by name to your alerts&apos; service field.
      </p>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-[8px] overflow-hidden mb-5">
        {services === null && !error && (
          <div className="px-5 py-8 text-center text-[13px] text-muted">Loading...</div>
        )}
        {services?.length === 0 && (
          <div className="px-5 py-8 text-center text-[13px] text-muted">
            No services connected yet — incidents will be diagnosed but not automatically resolved.
          </div>
        )}

        {services?.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border-subtle last:border-b-0 flex-wrap"
          >
            <div className="min-w-0">
              <div className="text-[13px] font-semibold font-mono">{s.service_name}</div>
              <div className="text-[11.5px] font-mono text-muted mt-0.5">Railway service {s.railway_service_id.slice(0, 8)}...</div>
              <div className="text-[11px] text-muted/70 mt-0.5">Connected {new Date(s.created_at).toLocaleDateString()}</div>
            </div>
            {isOwner && (
              <button
                onClick={() => handleRemove(s.id)}
                disabled={removing === s.id}
                className="text-[12.5px] font-medium text-critical hover:bg-critical-subtle/40 px-3 py-1.5 rounded-[6px] transition-colors disabled:opacity-50 shrink-0"
              >
                {removing === s.id ? "Removing..." : "Remove"}
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner && !adding && (
        <button
          onClick={() => setAdding(true)}
          className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors"
        >
          Connect a service
        </button>
      )}

      {isOwner && adding && (
        <form onSubmit={handleAdd} className="bg-white border border-border rounded-[8px] p-6 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12.5px] font-medium text-slate mb-1.5">Service name</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
              placeholder="Must match the service name your alerts use, e.g. checkout-api"
              className={inputClass}
            />
          </div>
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
          </div>
          <div>
            <label className="block text-[12.5px] font-medium text-slate mb-1.5">Railway Service ID</label>
            <input
              type="text"
              value={railwayServiceId}
              onChange={(e) => setRailwayServiceId(e.target.value)}
              required
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
              className={inputClass}
            />
          </div>

          <div className="flex gap-2.5 mt-1">
            <button
              type="submit"
              disabled={saving}
              className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add service"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] border border-border text-slate hover:bg-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}