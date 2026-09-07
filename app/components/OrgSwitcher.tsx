"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { setActiveOrg } from "../actions/org";

export default function OrgSwitcher({
  orgId,
  orgName,
  orgPlan,
  orgList,
}: {
  orgId: string;
  orgName: string;
  orgPlan: string;
  orgList: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const initials = orgName.slice(0, 2).toUpperCase();

  function handleSelect(id: string) {
    setOpen(false);
    if (id === orgId) return;
    startTransition(async () => {
      await setActiveOrg(id);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        className="w-full flex items-center gap-2.5 bg-[#2D2D30] border border-border rounded-[7px] px-2.5 py-2 text-left hover:bg-[#2A2D2E] transition-colors disabled:opacity-60"
      >
        <div className="w-[22px] h-[22px] rounded-[5px] bg-primary-hover flex items-center justify-center text-[11px] font-bold text-white shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold truncate">{orgName}</div>
          <div className="text-[10.5px] text-muted font-mono uppercase">{orgPlan} plan</div>
        </div>
        {isPending ? (
          <Loader2 size={13} className="animate-spin text-muted/70 shrink-0" />
        ) : (
          <ChevronDown size={13} className="text-muted/70 shrink-0" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-border rounded-[7px] overflow-hidden z-20 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
            {orgList.map((o) => (
              <button
                key={o.id}
                onClick={() => handleSelect(o.id)}
                className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors flex items-center justify-between ${
                  o.id === orgId ? "text-primary bg-primary-subtle" : "text-ink hover:bg-surface"
                }`}
              >
                {o.name}
                {o.id === orgId && <Check size={13} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}