"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
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
          <h1 className="text-[19px] font-bold tracking-tight mb-1">Sign in</h1>
          <p className="text-[13px] text-muted mb-6">Welcome back to your incident feed.</p>

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
            <div>
              <label className="block text-[12.5px] font-medium text-slate mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface border border-border rounded-[6px] px-3 py-2.5 text-[13.5px] text-ink focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
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
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-muted mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}