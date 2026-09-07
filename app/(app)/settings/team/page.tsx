"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useOrg } from "../../../lib/OrgContext";

interface Member {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}
export default function TeamSettingsPage() {
  const { orgId, userRole } = useOrg();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const isOwner = userRole === "owner";

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setToken(session.access_token);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/members`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      setError("Could not load team members.");
      return;
    }
    setMembers(await res.json());
  }

  useEffect(() => {
    load();
  }, [orgId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInviting(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/members`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    setInviting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? "Could not add this member.");
      return;
    }
    setEmail("");
    load();
  }

  async function handleRemove(userId: string) {
    setRemoving(userId);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/members/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setRemoving(null);

    if (!res.ok) {
      setError("Could not remove this member.");
      return;
    }
    setMembers((prev) => prev?.filter((m) => m.user_id !== userId) ?? null);
  }

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[19px] font-bold tracking-tight mb-1">Team</h1>
      <p className="text-[13px] text-muted mb-6">People with access to this organization.</p>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      {isOwner && (
        <form onSubmit={handleInvite} className="bg-white border border-border rounded-[8px] p-5 mb-6">
          <label className="block text-[12.5px] font-medium text-slate mb-1.5">Add a member by email</label>
          <p className="text-[12px] text-muted mb-3">They must already have an OnCallOS account.</p>
          <div className="flex gap-2.5 flex-wrap">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="teammate@company.com"
              className="flex-1 min-w-[200px] bg-surface border border-border rounded-[6px] px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={inviting}
              className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors disabled:opacity-50"
            >
              {inviting ? "Adding..." : "Add member"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-border rounded-[8px] overflow-hidden">
        {members === null && !error && (
          <div className="px-5 py-8 text-center text-[13px] text-muted">Loading team...</div>
        )}

        {members?.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border-subtle last:border-b-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-[28px] h-[28px] rounded-full bg-purple text-surface flex items-center justify-center text-[11px] font-bold shrink-0">
                {member.user_id.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{member.email}</div>
                <div className="text-[11px] font-mono text-muted uppercase">{member.role}</div>
              </div>
            </div>

            {isOwner && member.role !== "owner" && (
              <button
                onClick={() => handleRemove(member.user_id)}
                disabled={removing === member.user_id}
                className="text-[12.5px] font-medium text-critical hover:bg-critical-subtle/40 px-3 py-1.5 rounded-[6px] transition-colors disabled:opacity-50 shrink-0"
              >
                {removing === member.user_id ? "Removing..." : "Remove"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}