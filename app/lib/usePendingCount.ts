"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function usePendingCount(orgId: string | null | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!orgId) {
      setCount(0);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/diagnoses/pending`, {
          headers: { Authorization: `Bearer ${token}`, "X-Organization-Id": orgId! },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setCount(Array.isArray(json) ? json.length : 0);
      } catch {
        /* keep last count */
      }
    }

    load();
    const t = setInterval(load, 30000);
    window.addEventListener("approvals-changed", load);
    return () => {
      cancelled = true;
      clearInterval(t);
      window.removeEventListener("approvals-changed", load);
    };
  }, [orgId]);

  return count;
}