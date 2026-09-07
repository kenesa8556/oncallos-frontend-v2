"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useOrg } from "../../../lib/OrgContext";
import UsageCard from "../../../components/UsageCard";

export default function OrganizationSettingsPage() {
  const { orgId, orgName, orgPlan, userRole } = useOrg();
  const [name, setName] = useState(orgName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(orgName);
  }, [orgName]);

  const isOwner = userRole === "owner";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Could not update organization.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-[560px]">
      <h1 className="text-[19px] font-bold tracking-tight mb-1">Organization</h1>
      <p className="text-[13px] text-muted mb-6">Basic details about your organization.</p>

      <form onSubmit={handleSave} className="bg-white border border-border rounded-[8px] p-6">
        <div className="mb-5">
          <label className="block text-[12.5px] font-medium text-slate mb-1.5">Organization name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isOwner}
            required
            className="w-full bg-surface border border-border rounded-[6px] px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[12.5px] font-medium text-slate mb-1.5">Plan</label>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] font-mono uppercase px-2.5 py-1 rounded-full bg-primary-subtle text-primary">
              {orgPlan}
            </span>
            <span className="text-[12px] text-muted">Manage in Billing settings</span>
          </div>
        </div>

        {!isOwner && (
          <div className="mb-4 text-[12.5px] text-muted bg-surface border border-border rounded-[6px] px-3 py-2">
            Only the organization owner can edit these settings.
          </div>
        )}

        {error && (
          <div className="mb-4 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
            {error}
          </div>
        )}

        {isOwner && (
          <button
            type="submit"
            disabled={saving || name === orgName}
            className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
          </button>
        )}
      </form>
      <div className="mt-6">
        <UsageCard />
      </div>
    </div>
  );
}