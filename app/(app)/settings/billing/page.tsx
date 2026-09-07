"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { supabase } from "../../../lib/supabase";
import { useOrg } from "../../../lib/OrgContext";
import CheckoutForm from "../../../components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PLANS = [
  { id: "pro", name: "Pro", price: "$99", seats: "6 seats" },
  { id: "ultra", name: "Ultra", price: "$100", seats: "20 seats" },
  { id: "max", name: "Max", price: "$130", seats: "100 seats" },
];

export default function BillingSettingsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { orgId, orgPlan, userRole } = useOrg();
  const [error, setError] = useState("");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
const [loadingPortal, setLoadingPortal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  const isOwner = userRole === "owner";
  const isFree = orgPlan === "free";

  async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

 async function handleSubscribe(plan: string) {
  setError("");
  setLoadingPlan(plan);
  const session = await getSession();
  if (!session) {
    setLoadingPlan(null);
    return;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/billing/subscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan }),
  });

  setLoadingPlan(null);
  if (!res.ok) {
    setError("Could not start checkout. Please try again.");
    return;
  }

  const data = await res.json();
  setSelectedPlan(plan);
  setClientSecret(data.clientSecret);
}

  async function handlePortal() {
  setError("");
  setLoadingPortal(true);
  const session = await getSession();
  if (!session) {
    setLoadingPortal(false);
    return;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/${orgId}/billing/portal`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  setLoadingPortal(false);
  if (!res.ok) {
    setError("Could not open the billing portal.");
    return;
  }

  const data = await res.json();
  window.location.href = data.url;
}
  if (subscribed) {
    return (
      <div className="max-w-[560px]">
        <div className="bg-success-subtle/40 border border-success/30 rounded-[8px] p-6 text-center">
          <div className="text-[15px] font-semibold text-success mb-1">You&apos;re on Pro now</div>
          <p className="text-[13px] text-muted">Refresh the page to see your updated plan reflected everywhere.</p>
        </div>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <div className="max-w-[440px]">
          <h1 className="text-[19px] font-bold tracking-tight mb-1">
            Upgrade to {PLANS.find((p) => p.id === selectedPlan)?.name}
          </h1>
          <p className="text-[13px] text-muted mb-6">
            {PLANS.find((p) => p.id === selectedPlan)?.price}/month · {PLANS.find((p) => p.id === selectedPlan)?.seats}
          </p>
      <div className="bg-white border border-border rounded-[8px] p-6">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onSuccess={() => setSubscribed(true)} />
          </Elements>
        </div>
        <button
          onClick={() => setClientSecret(null)}
          className="text-[12.5px] text-muted hover:text-ink mt-3 transition-colors"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[560px]">
      <h1 className="text-[19px] font-bold tracking-tight mb-1">Billing</h1>
      <p className="text-[13px] text-muted mb-6">Manage your organization&apos;s plan and payment method.</p>

      {error && (
        <div className="mb-5 text-[13px] text-critical bg-critical-subtle/40 border border-critical/30 rounded-[6px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-[8px] p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="text-[11.5px] font-mono text-muted uppercase mb-1">Current plan</div>
            <div className="text-[22px] font-bold font-mono uppercase text-primary">{orgPlan}</div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-success-subtle text-success">
            Active
          </span>
        </div>

        {!isOwner && (
          <div className="text-[12.5px] text-muted bg-surface border border-border rounded-[6px] px-3 py-2">
            Only the organization owner can manage billing.
          </div>
        )}

       {isOwner && isFree && (
          <div className="grid sm:grid-cols-3 gap-3">
            {PLANS.map((p) => (
  <div key={p.id} className="border border-border rounded-[8px] p-4 flex flex-col">
    <div className="text-[13px] font-semibold">{p.name}</div>
    <div className="text-[20px] font-bold mt-1">
      {p.price}
      <span className="text-[12px] font-normal text-muted">/mo</span>
    </div>
    <div className="text-[11.5px] text-muted mb-4">{p.seats}</div>
    <button
      onClick={() => handleSubscribe(p.id)}
      disabled={loadingPlan !== null}
      className="mt-auto text-[12.5px] font-semibold px-3 py-2 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors disabled:opacity-50"
    >
              {loadingPlan === p.id ? "Starting..." : `Choose ${p.name}`}
            </button>
          </div>
        ))}
          </div>
      )}

        {isOwner && !isFree && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePortal}
              disabled={loadingPortal}
              className="text-[13px] font-semibold px-4 py-2.5 rounded-[6px] border border-border text-ink hover:bg-surface transition-colors disabled:opacity-50"
            >
              {loadingPortal ? "Opening..." : "Manage subscription, cancel, or change plan"}
            </button>
            <p className="text-[12px] text-muted">
              Cancellation, plan changes, and payment method updates are all handled in Stripe&apos;s secure portal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}