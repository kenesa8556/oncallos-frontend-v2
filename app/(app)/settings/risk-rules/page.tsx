"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useOrg } from "../../../lib/OrgContext";

export default function RiskRulesSettingsPage() {
  const { orgId, userRole } = useOrg();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);

  const isOwner = userRole === "owner";

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setToken(session.access_token);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/risk-rules`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      setError("Could not load risk rules.");
      return;
    }
    const data = await res.json();
    setKeywords(data.high_risk_keywords);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, [orgId]);

  function addKeyword(e: React.FormEvent) {
    e.preventDefault();
    const kw = newKeyword.trim().toLowerCase();
    if (!kw || keywords.includes(kw)) {
      setNewKeyword("");
      return;
    }
    setKeywords((prev) => [...prev, kw]);
    setNewKeyword("");
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  async function handleSave() {
    setError("");
    setSaving(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/risk-rules`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ high_risk_keywords: keywords }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Could not save risk rules.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-[560px]">
      <h1 className="text-[19px] font-bold tracking-tight mb-1">Risk Rules</h1>
      <p className="text-[13px] text-muted mb-6">
        Actions whose recommended fix mentions any of these words require human approval before executing. Everything else runs automatically.
      </p>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-[8px] p-6">
        {!loaded && !error && <div className="text-[13px] text-muted">Loading...</div>}

        {loaded && (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {keywords.length === 0 && (
                <p className="text-[13px] text-muted">
                  No high-risk keywords set — every action will auto-execute.
                </p>
              )}
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1.5 text-[12.5px] font-mono px-2.5 py-1 rounded-full bg-warning-subtle text-warning"
                >
                  {kw}
                  {isOwner && (
                    <button
                      onClick={() => removeKeyword(kw)}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={`Remove ${kw}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isOwner && (
              <>
                <form onSubmit={addKeyword} className="flex gap-2.5 mb-5">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="e.g. delete, drop, terminate"
                    className="flex-1 bg-surface border border-border rounded-[6px] px-3 py-2 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="submit"
                    className="text-[12.5px] font-semibold px-3.5 py-2 rounded-[6px] border border-border text-ink hover:bg-surface transition-colors"
                  >
                    Add
                  </button>
                </form>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
                </button>
              </>
            )}

            {!isOwner && (
              <div className="text-[12.5px] text-muted bg-surface border border-border rounded-[6px] px-3 py-2">
                Only the organization owner can edit risk rules.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}