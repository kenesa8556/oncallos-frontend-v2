"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useOrg } from "../../../../lib/OrgContext";


export default function DatadogIntegrationPage() {
  const { orgId, userRole } = useOrg();
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isOwner = userRole === "owner";
  const webhookUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/webhooks/datadog`;

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setToken(session.access_token);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/integrations/datadog`,
      { headers: { Authorization: `Bearer ${session.access_token}` } },
    );

    if (!res.ok) {
      setError("Could not load Datadog integration settings.");
      return;
    }
    const data = await res.json();
    setSecret(data.webhookSecret);
  }

  useEffect(() => {
    load();
  }, [orgId]);

  async function handleRegenerate() {
    if (!confirm("Regenerating will break your existing Datadog webhook until you update it with the new secret. Continue?")) {
      return;
    }
    setRegenerating(true);
    setError("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/integrations/datadog/regenerate`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    setRegenerating(false);
    if (!res.ok) {
      setError("Could not regenerate the webhook secret.");
      return;
    }
    const data = await res.json();
    setSecret(data.webhookSecret);
  }

  function copy(value: string, field: string) {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[19px] font-bold tracking-tight mb-1">Datadog Integration</h1>
      <p className="text-[13px] text-muted mb-6">
        Connect Datadog monitors to send alerts directly into OnCallOS.
      </p>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-[8px] p-5 mb-6 space-y-5">
        <div>
          <label className="block text-[12.5px] font-medium text-slate mb-1.5">Webhook URL</label>
          <div className="flex items-center gap-2.5 flex-wrap">
            <code className="flex-1 min-w-[200px] bg-surface border border-border rounded-[6px] px-3 py-2 text-[12.5px] font-mono break-all">
              {webhookUrl}
            </code>
            <button
              onClick={() => copy(webhookUrl, "url")}
              className="text-[12.5px] font-semibold px-3.5 py-2 rounded-[6px] border border-border text-ink hover:bg-surface transition-colors shrink-0"
            >
              {copiedField === "url" ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-slate mb-1.5">X-Webhook-Secret header</label>
          {secret ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <code className="flex-1 min-w-[200px] bg-surface border border-border rounded-[6px] px-3 py-2 text-[12.5px] font-mono break-all">
                {secret}
              </code>
              <button
                onClick={() => copy(secret, "secret")}
                className="text-[12.5px] font-semibold px-3.5 py-2 rounded-[6px] border border-border text-ink hover:bg-surface transition-colors shrink-0"
              >
                {copiedField === "secret" ? "Copied ✓" : "Copy"}
              </button>
            </div>
          ) : (
            <div className="text-[13px] text-muted">Loading...</div>
          )}
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-slate mb-1.5">X-Api-Key header</label>
          <p className="text-[12.5px] text-muted">
            Use one of your organization&apos;s API keys — see{" "}
            <a href="/settings/api-keys" className="text-primary hover:underline">
              API Keys
            </a>
            .
          </p>
        </div>

        {isOwner && (
          <div className="pt-1">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="text-[12.5px] font-medium text-critical hover:bg-critical-subtle/40 px-3 py-1.5 rounded-[6px] transition-colors disabled:opacity-50"
            >
              {regenerating ? "Regenerating..." : "Regenerate secret"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-border rounded-[8px] p-5">
        <div className="text-[13px] font-semibold mb-3">Setup instructions</div>
        <ol className="text-[12.5px] text-slate space-y-2 list-decimal list-inside">
          <li>In Datadog, go to Integrations → Webhooks → New.</li>
          <li>Paste the Webhook URL above.</li>
          <li>
            Add custom headers as JSON:{" "}
            <code className="bg-surface border border-border rounded-[4px] px-1.5 py-0.5 text-[11.5px]">
              {`{"X-Webhook-Secret": "...", "X-Api-Key": "..."}`}
            </code>
          </li>
          <li>
            Set the payload to:{" "}
            <code className="bg-surface border border-border rounded-[4px] px-1.5 py-0.5 text-[11.5px]">
              {`{"title": "$EVENT_TITLE", "alert_type": "$ALERT_TYPE", "tags": "$TAGS"}`}
            </code>
          </li>
          <li>Attach this webhook to a monitor&apos;s notification message.</li>
        </ol>
      </div>
    </div>
  );
}