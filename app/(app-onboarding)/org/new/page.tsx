"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function NewOrgPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Could not create organization.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-surface text-ink flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-[15px] mb-8">
          <div className="w-[22px] h-[22px] rounded-[5px] bg-primary-hover flex items-center justify-center text-[12px] text-white font-mono">
            &gt;_
          </div>
          OnCallOS
        </Link>

        <div className="bg-white border border-border rounded-[8px] p-7">
          <h1 className="text-[19px] font-bold tracking-tight mb-1">Create your organization</h1>
          <p className="text-[13px] text-muted mb-6">You&apos;ll be its owner, with full access to billing and team settings.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[12.5px] font-medium text-slate mb-1.5">Organization name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-surface border border-border rounded-[6px] px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors"
                placeholder="Acme Inc."
              />
            </div>

            {error && (
              <div className="text-[12.5px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 text-[13.5px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create organization"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}