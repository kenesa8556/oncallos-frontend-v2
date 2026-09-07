"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useOrg } from "../../../lib/OrgContext";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeysSettingsPage() {
  const { orgId, userRole } = useOrg();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  const isOwner = userRole === "owner";

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setToken(session.access_token);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/api-keys`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      setError("Could not load API keys.");
      return;
    }
    setKeys(await res.json());
  }

  useEffect(() => {
    load();
  }, [orgId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/api-keys`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    setCreating(false);
    if (!res.ok) {
      setError("Could not create API key.");
      return;
    }
    const data = await res.json();
    setNewKey(data.rawKey);
    setName("");
    load();
  }

  async function handleRevoke(keyId: string) {
    setRevoking(keyId);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/api-keys/${keyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setRevoking(null);

    if (!res.ok) {
      setError("Could not revoke this key.");
      return;
    }
    setKeys((prev) => prev?.filter((k) => k.id !== keyId) ?? null);
  }

  function copyKey() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[19px] font-bold tracking-tight mb-1">API Keys</h1>
      <p className="text-[13px] text-muted mb-6">Used to authenticate incoming alerts and webhooks.</p>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      {newKey && (
        <div className="mb-6 bg-warning-subtle/30 border border-warning/40 rounded-[8px] p-5">
          <div className="text-[13px] font-semibold text-warning mb-1.5">Copy this key now</div>
          <p className="text-[12.5px] text-muted mb-3">
            This is the only time you&apos;ll see the full key. Store it somewhere safe.
          </p>
          <div className="flex items-center gap-2.5 flex-wrap">
            <code className="flex-1 min-w-[200px] bg-surface border border-border rounded-[6px] px-3 py-2 text-[12.5px] font-mono break-all">
              {newKey}
            </code>
            <button
              onClick={copyKey}
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-[6px] border border-border text-ink hover:bg-surface transition-colors shrink-0"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="text-[12px] text-muted hover:text-ink mt-3 transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {isOwner && !newKey && (
        <form onSubmit={handleCreate} className="bg-white border border-border rounded-[8px] p-5 mb-6">
          <label className="block text-[12.5px] font-medium text-slate mb-1.5">Create a new key</label>
          <div className="flex gap-2.5 flex-wrap">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Datadog production"
              className="flex-1 min-w-[200px] bg-surface border border-border rounded-[6px] px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={creating}
              className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create key"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-[8px] overflow-hidden">
        {keys === null && !error && (
          <div className="px-5 py-8 text-center text-[13px] text-muted">Loading keys...</div>
        )}
        {keys?.length === 0 && (
          <div className="px-5 py-8 text-center text-[13px] text-muted">
            No API keys yet — create one to start sending alerts.
          </div>
        )}

        {keys?.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border-subtle last:border-b-0 flex-wrap"
          >
            <div className="min-w-0">
              <div className="text-[13px] font-medium">{key.name}</div>
              <div className="text-[11.5px] font-mono text-muted mt-0.5">
                {key.key_prefix}••••••••
              </div>
              <div className="text-[11px] text-muted/70 mt-0.5">
                {key.last_used_at
                  ? `Last used ${new Date(key.last_used_at).toLocaleDateString()}`
                  : "Never used"}
                {" · Created "}
                {new Date(key.created_at).toLocaleDateString()}
              </div>
            </div>

            {isOwner && (
              <button
                onClick={() => handleRevoke(key.id)}
                disabled={revoking === key.id}
                className="text-[12.5px] font-medium text-critical hover:bg-critical-subtle/40 px-3 py-1.5 rounded-[6px] transition-colors disabled:opacity-50 shrink-0"
              >
                {revoking === key.id ? "Revoking..." : "Revoke"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}