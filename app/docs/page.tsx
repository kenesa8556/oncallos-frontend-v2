"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const sections = [
  {
    id: "getting-started",
    label: "Getting Started",
    content: (
      <>
        <p className="mb-4">
          OnCallOS connects to your monitoring tool (Datadog) and your infrastructure (Railway), diagnoses incidents as they happen, and safely resolves the low-risk ones automatically.
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li><Link href="/signup" className="text-primary hover:underline">Create an account</Link> — this also creates your organization.</li>
          <li>Go to <b>Settings → API Keys</b> and create your first key.</li>
          <li>Go to <b>Settings → Integrations → Datadog</b> and connect your Datadog account.</li>
          <li>Go to <b>Settings → Execution</b> and connect at least one Railway service.</li>
          <li>Trigger a real Datadog alert and watch it appear on your dashboard.</li>
        </ol>
        <p>Each step is covered in detail below.</p>
      </>
    ),
  },
  {
    id: "connecting-datadog",
    label: "Connecting Datadog",
    content: (
      <>
        <p className="mb-4">
          Each organization gets its own unique webhook URL and secret — never shared with other organizations on OnCallOS.
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>In OnCallOS, go to <b>Settings → Integrations → Datadog</b>. You&apos;ll see your webhook URL and a unique secret.</li>
          <li>In Datadog, go to <b>Integrations → Webhooks → New</b>.</li>
          <li>Paste your OnCallOS webhook URL.</li>
          <li>
            Add custom headers as JSON:
            <pre className="bg-surface border border-border rounded-[6px] px-3 py-2.5 mt-2 text-[12.5px] font-mono overflow-x-auto">
{`{
  "X-Webhook-Secret": "<your webhook secret>",
  "X-Api-Key": "<your API key>"
}`}
            </pre>
          </li>
          <li>
            Set the payload to:
            <pre className="bg-surface border border-border rounded-[6px] px-3 py-2.5 mt-2 text-[12.5px] font-mono overflow-x-auto">
{`{
  "title": "$EVENT_TITLE",
  "alert_type": "$ALERT_TYPE",
  "tags": "$TAGS"
}`}
            </pre>
          </li>
          <li>Save the webhook, then attach it to a monitor&apos;s notification message (e.g. <code className="bg-surface border border-border rounded-[4px] px-1.5 py-0.5 text-[12px] font-mono">@webhook-oncallos</code>).</li>
        </ol>
        <p className="mb-1 font-semibold text-[13.5px]">Tagging services</p>
        <p>
          For OnCallOS to know which service an alert is about, tag your Datadog monitors with <code className="bg-surface border border-border rounded-[4px] px-1.5 py-0.5 text-[12px] font-mono">service:&lt;name&gt;</code>, matching the service name you use in Settings → Execution.
        </p>
      </>
    ),
  },
  {
    id: "connecting-railway",
    label: "Connecting Railway Services",
    content: (
      <>
        <p className="mb-4">
          OnCallOS takes real remediation action against services you explicitly connect — it never touches anything you haven&apos;t authorized.
        </p>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>In Railway, create a <b>Project Access Token</b> scoped to the project you want OnCallOS to manage.</li>
          <li>In OnCallOS, go to <b>Settings → Execution</b> and click <b>Add service</b>.</li>
          <li>Give it a name matching the <code className="bg-surface border border-border rounded-[4px] px-1.5 py-0.5 text-[12px] font-mono">service:</code> tag you use in Datadog, plus your Project Access Token, Service ID, and Environment ID.</li>
          <li>OnCallOS validates the connection against Railway&apos;s real API before saving — if anything&apos;s wrong, you&apos;ll see an error immediately rather than during a real incident.</li>
        </ol>
        <p>You can connect as many named services as you have — each incident is resolved against the specific service it&apos;s tagged for.</p>
      </>
    ),
  },
  {
    id: "how-diagnosis-works",
    label: "How Diagnosis Works",
    content: (
      <>
        <p className="mb-4">
          When an alert arrives, OnCallOS retrieves similar past incidents from your own history (by meaning, not keyword matching) and produces a diagnosis: a root cause, a confidence level, and — where applicable — a specific remediation action.
        </p>
        <p className="mb-2 font-semibold text-[13.5px]">The four remediation actions</p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-semibold">Action</th>
                <th className="py-2 font-semibold">Used when</th>
              </tr>
            </thead>
            <tbody className="text-slate">
              <tr className="border-b border-border-subtle"><td className="py-2 pr-4 font-mono text-[12.5px]">restart_service</td><td className="py-2">A service is crashed or stuck</td></tr>
              <tr className="border-b border-border-subtle"><td className="py-2 pr-4 font-mono text-[12.5px]">scale_replicas</td><td className="py-2">Traffic or load spiked, nothing is broken</td></tr>
              <tr className="border-b border-border-subtle"><td className="py-2 pr-4 font-mono text-[12.5px]">rollback_deployment</td><td className="py-2">Errors began right after a deployment</td></tr>
              <tr><td className="py-2 pr-4 font-mono text-[12.5px]">clear_cache</td><td className="py-2">Stale data is being served</td></tr>
            </tbody>
          </table>
        </div>
        <p>If none of these fit, OnCallOS records its analysis without taking any action, and the incident stays open for you to review.</p>
      </>
    ),
  },
  {
    id: "risk-approvals",
    label: "Risk Rules & Approvals",
    content: (
      <>
        <p className="mb-4">
          Not every action should happen without a human. In <b>Settings → Risk Rules</b>, you configure keywords that mark a recommended action as high-risk.
        </p>
        <ul className="list-disc list-inside space-y-1.5 mb-4">
          <li><b>Low risk</b> — executes immediately, with a snapshot taken first if the action is stateful.</li>
          <li><b>High risk</b> — held in the <b>Approvals</b> queue until an owner or member explicitly approves or rejects it. Nothing runs until then.</li>
        </ul>
        <p>Every approved action goes through the exact same real execution and verification path as an auto-executed one.</p>
      </>
    ),
  },
  {
    id: "verification",
    label: "Verification & Rollback",
    content: (
      <>
        <p className="mb-4">
          OnCallOS never marks an incident resolved based on an action&apos;s own reported success. After a short delay, it independently re-checks the real state of your infrastructure — the actual deployment status, not just whether an API call returned <code className="bg-surface border border-border rounded-[4px] px-1.5 py-0.5 text-[12px] font-mono">true</code>.
        </p>
        <p className="mb-4">
          If verification fails, the incident stays open rather than being silently marked resolved.
        </p>
        <p className="mb-2 font-semibold text-[13.5px]">Rolling back</p>
        <p>
          Every stateful action captures a snapshot beforehand. From an incident&apos;s <b>Snapshots</b> tab, an owner can roll back to the most recent snapshot with one click — this triggers a real, independently-verified rollback, the same as an automated one.
        </p>
      </>
    ),
  },
  {
    id: "team-roles",
    label: "Team & Roles",
    content: (
      <>
        <p className="mb-4">There are two roles in an organization:</p>
        <ul className="list-disc list-inside space-y-1.5 mb-4">
          <li><b>Owner</b> — full access, including billing, connecting infrastructure, regenerating secrets, and approving/rejecting high-risk actions.</li>
          <li><b>Member</b> — can view incidents, use the incident chat, and approve/reject actions, but can&apos;t change billing, credentials, or org settings.</li>
        </ul>
        <p>Invite teammates from <b>Settings → Team</b>.</p>
      </>
    ),
  },
  {
    id: "billing",
    label: "Billing & Limits",
    content: (
      <>
        <p className="mb-4">
          OnCallOS has four plans, each with its own API key limit and monthly incident volume cap. Usage is shown in <b>Settings → Billing</b>, and billing itself is handled entirely through Stripe — OnCallOS never stores your card details.
        </p>
        <p>If you hit your monthly incident limit, new alerts are rejected until the next billing cycle or an upgrade.</p>
      </>
    ),
  },
];

export default function DocsPage() {
  const [active, setActive] = useState(sections[0].id);
  const activeSection = sections.find((s) => s.id === active)!;

  return (
    <div className="min-h-screen bg-surface text-ink text-[14px]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface/85 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1180px] mx-auto px-6 h-[52px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-[15px]">
            <div className="w-[22px] h-[22px] rounded-[5px] bg-primary-hover flex items-center justify-center text-[12px] text-white font-mono">
              &gt;_
            </div>
            OnCallOS
          </Link>
          <Link
            href="/signup"
            className="text-[13.5px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors"
          >
            Try free
          </Link>
        </div>
      </nav>

      <div className="max-w-[1180px] mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden md:block w-[220px] shrink-0">
          <div className="sticky top-[80px]">
            <h5 className="text-[11px] font-mono text-muted uppercase tracking-wider mb-3">Documentation</h5>
            <nav className="flex flex-col gap-0.5">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`text-left text-[13px] px-2.5 py-1.75 rounded-[6px] transition-colors ${
                    active === s.id ? "bg-primary-subtle text-primary font-medium" : "text-slate hover:text-ink hover:bg-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile section picker */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
          <select
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="w-full bg-white border border-border rounded-[8px] px-3.5 py-3 text-[13.5px] font-medium shadow-lg"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-[720px] pb-20">
          <div className="flex items-center gap-1.5 text-[12px] text-muted mb-3">
            <span>Docs</span>
            <ChevronRight size={12} />
            <span className="text-ink">{activeSection.label}</span>
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight mb-6">{activeSection.label}</h1>
          <div className="text-[14px] leading-[1.7] text-ink">{activeSection.content}</div>
        </main>
      </div>
    </div>
  );
}