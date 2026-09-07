"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-surface text-ink flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] text-center">
          <div className="w-10 h-10 rounded-full bg-success-subtle text-success flex items-center justify-center text-[18px] mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-[19px] font-bold tracking-tight mb-2">Check your email</h1>
          <p className="text-[13.5px] text-muted leading-[1.6]">
            If an account exists for <span className="text-ink">{email}</span>, we sent a link to reset your password.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-[13.5px] font-semibold px-4 py-2.5 rounded-[6px] border border-border text-ink hover:bg-white transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-[19px] font-bold tracking-tight mb-1">Reset your password</h1>
          <p className="text-[13px] text-muted mb-6">We&apos;ll send you a link to set a new one.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[12.5px] font-medium text-slate mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface border border-border rounded-[6px] px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors"
                placeholder="you@company.com"
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
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-muted mt-5">
          <Link href="/login" className="text-primary hover:underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}