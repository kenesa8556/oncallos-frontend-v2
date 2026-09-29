import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ShieldCheck, RotateCcw, KeyRound, ScrollText, BadgeCheck, Blocks } from "lucide-react";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function Home() {
  const user = await getUser();
  return (
    <div className="min-h-screen bg-surface text-ink text-[14px]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface/85 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1180px] mx-auto px-6 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[15px]">
            <div className="w-[22px] h-[22px] rounded-[5px] bg-primary-hover flex items-center justify-center text-[12px] text-white font-mono">
              &gt;_
            </div>
            OnCallOS
          </div>
          <div className="hidden md:flex gap-7 text-[13.5px] text-muted">
            <a href="#pipeline" className="hover:text-ink transition-colors">How it works</a>
            <a href="#trust" className="hover:text-ink transition-colors">Security</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
            <Link href="/docs" className="hover:text-ink transition-colors">Docs</Link>
          </div>
          <div className="flex items-center gap-2.5">
  {user ? (
    <Link
      href="/dashboard"
      className="text-[13.5px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors"
    >
      Dashboard
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="text-[13.5px] font-semibold px-4 py-2.5 rounded-[6px] border border-border text-ink hover:bg-white transition-colors"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="text-[13.5px] font-semibold px-4 py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors"
      >
        Try free
      </Link>
    </>
  )}
</div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-[1180px] mx-auto px-6 pt-[56px] pb-[40px] md:pt-[90px] md:pb-[60px] text-center">
        <div className="flex justify-center gap-3 mb-7">
          <span className="text-[12px] font-mono text-success bg-white border border-border px-3 py-1.5 rounded-full">
            real Railway execution, not simulated
          </span>
          <span className="text-[12px] font-mono text-success bg-white border border-border px-3 py-1.5 rounded-full">
            independent verification
          </span>
        </div>
        <h1 className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] leading-[1.08] max-w-[780px] mx-auto mb-[22px]">
          Resolve incidents with <span className="text-primary">evidence</span>, not <span className="text-orange">guesswork</span>.
        </h1>
        <p className="text-[17px] text-muted max-w-[560px] mx-auto mb-9 px-4">
          OnCallOS diagnoses production incidents against your real history, safely auto-executes the low-risk fixes against your real infrastructure, and escalates the rest — with full context already attached.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14 px-4">
          <Link
            href="/signup"
            className="text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors"
          >
            Try OnCallOS free
          </Link>
          <a
            href="#pipeline"
            className="text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[6px] border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* Dashboard preview */}
        <div className="bg-white border border-border rounded-[10px] max-w-[980px] mx-auto p-1 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
          <div className="bg-surface rounded-[7px] p-[22px] text-left">
            <div className="flex gap-1.5 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-critical" />
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#6A9955]" />
            </div>
            {[
              { id: "INC-3921", title: "Deploy caused error spike — checkout-api", pill: "needs approval", cls: "border-l-warning bg-warning-subtle/40 text-warning" },
              { id: "INC-3920", title: "Stale pricing cache — checkout-api", pill: "auto-resolved", cls: "border-l-success bg-success-subtle/40 text-success" },
              { id: "INC-3919", title: "Traffic spike, 500s — checkout-api", pill: "auto-resolved", cls: "border-l-success bg-success-subtle/40 text-success" },
            ].map((row) => (
              <div key={row.id} className={`flex flex-wrap items-center gap-3 px-3.5 py-2.5 rounded-[6px] border-l-[3px] text-[13px] mb-1.5 ${row.cls}`}>
                <span className="text-muted font-mono text-[11.5px]">{row.id}</span>
                <span className="text-ink">{row.title}</span>
                <span className="ml-auto text-[11px] font-mono px-2.5 py-1 rounded-full bg-black/20">{row.pill}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* What it actually does */}
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border border border-border rounded-[10px] overflow-hidden my-20">
          {[
            { num: "4", color: "text-primary", label: "real remediation tools", desc: "restart, scale, rollback, cache-clear — each a real Railway API call" },
            { num: "100%", color: "text-teal", label: "independently verified", desc: "no action is marked resolved on its own self-report" },
            { num: "0", color: "text-orange", label: "shared secrets across orgs", desc: "every org gets its own webhook secret and credentials" },
          ].map((s) => (
            <div key={s.label} className="bg-white px-7 py-9 text-center">
              <div className={`text-[40px] font-extrabold font-mono mb-1.5 ${s.color}`}>{s.num}</div>
              <div className="text-[13.5px] font-semibold mb-1">{s.label}</div>
              <div className="text-[12.5px] text-muted">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      <section id="pipeline" className="max-w-[1180px] mx-auto px-6 py-10">
        <div className="text-center max-w-[620px] mx-auto mb-[70px]">
          <h2 className="text-[34px] font-extrabold tracking-[-0.02em] mb-3.5">
            From alert to resolution, fully traceable
          </h2>
          <p className="text-muted text-[15.5px]">
            Every incident moves through the same four stages — nothing happens silently, and nothing destructive happens without approval.
          </p>
        </div>

        {[
          {
            n: "01", label: "Detect", title: "Datadog alerts land in seconds",
            body: "Each org connects Datadog with its own unique webhook secret and API key — configured from Settings in under a minute, with copy-paste instructions and a payload template ready to go.",
            code: [
              { t: "comment", v: "// datadog.controller.ts" },
              { t: "mix", v: [["key", "export class "], ["type", "DatadogController"], ["plain", " {"]] },
              { t: "mix", v: [["plain", "  "], ["fn", "@Post"], ["plain", "()"]] },
              { t: "mix", v: [["plain", "  "], ["key", "async "], ["fn", "receiveWebhook"], ["plain", "(payload) {"]] },
              { t: "mix", v: [["plain", "    "], ["comment", "// secret checked against THIS org only"]] },
              { t: "mix", v: [["plain", "    "], ["key", "await "], ["plain", "queue."], ["fn", "add"], ["plain", "(alert);"]] },
              { t: "plain", v: "  }" },
              { t: "plain", v: "}" },
            ],
            reverse: false,
          },
          {
            n: "02", label: "Diagnose", title: "Grounded in your own incident history",
            body: "Before diagnosing anything, OnCallOS retrieves the most similar past incidents — by meaning, not keywords — and picks the correct one of four real tools based on the actual root cause, not just the symptom.",
            diag: true,
            reverse: true,
          },
          {
            n: "03", label: "Resolve", title: "Real Railway actions, snapshot first",
            body: "Low-risk, well-understood fixes execute for real against your connected Railway services — after capturing the exact state needed to undo them. Anything risky goes to a human for approval, every time.",
            code: [
              { t: "comment", v: "// execution.service.ts" },
              { t: "mix", v: [["ctrl", "if "], ["plain", "(risk === "], ["str", "'low'"], ["plain", ") {"]] },
              { t: "mix", v: [["plain", "  "], ["key", "await "], ["fn", "snapshot"], ["plain", "(service);"]] },
              { t: "mix", v: [["plain", "  "], ["key", "await "], ["fn", "runTool"], ["plain", "(diagnosis);"]] },
              { t: "mix", v: [["plain", "} "], ["ctrl", "else "], ["plain", "{"]] },
              { t: "mix", v: [["plain", "  "], ["key", "await "], ["fn", "requestApproval"], ["plain", "(diagnosis);"]] },
              { t: "plain", v: "}" },
            ],
            reverse: false,
          },
          {
            n: "04", label: "Verify", title: "Nothing is marked resolved on trust alone",
            body: "After every action, OnCallOS independently re-checks the real infrastructure state — not the API call's own success flag — before writing a resolution. If verification fails, the incident stays open for a human.",
            matches: true,
            reverse: true,
          },
        ].map((step) => (
          <div
            key={step.n}
            className={`grid md:grid-cols-2 gap-12 items-center py-14 border-b border-border-subtle last:border-b-0 ${
              step.reverse ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div>
              <div className="flex items-baseline gap-2 text-[13px] font-semibold text-primary mb-3">
                <span className="font-mono text-muted">{step.n}</span>
                {step.label}
              </div>
              <h3 className="text-[22px] font-bold tracking-tight mb-3">{step.title}</h3>
              <p className="text-[14.5px] leading-[1.65] text-slate max-w-[440px]">{step.body}</p>
            </div>

            <div className="bg-white border border-border rounded-[8px] p-5">
              {step.code && (
                <div className="font-mono text-[12.5px] leading-[1.8]">
                  {step.code.map((line, i) =>
                    line.t === "comment" ? (
                      <div key={i} className="text-[#6A9955]">{line.v as string}</div>
                    ) : line.t === "plain" ? (
                      <div key={i}>{line.v as string}</div>
                    ) : (
                      <div key={i}>
                        {(line.v as [string, string][]).map(([kind, text], j) => (
                          <span
                            key={j}
                            className={
                              kind === "key" ? "text-purple" :
                              kind === "type" ? "text-teal" :
                              kind === "fn" ? "text-warning" :
                              kind === "str" ? "text-orange" :
                              kind === "ctrl" ? "text-purple" :
                              "text-ink"
                            }
                          >
                            {text}
                          </span>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}

              {step.diag && (
                <div>
                  <div className="text-[11px] font-mono text-muted mb-1">Diagnosis · INC-3921</div>
                  <div className="text-[12px] font-mono text-critical font-semibold mb-2.5">SEV2 — HIGH</div>
                  <p className="text-[13px] leading-[1.6] text-slate mb-4">
                    Error rate spiked immediately after the latest deployment — the code, not load or cache, is the likely cause.
                  </p>
                  <div className="bg-surface border border-border rounded-[6px] p-3">
                    <div className="text-[11px] font-mono text-muted mb-1.5">Recommended action</div>
                    <div className="font-mono text-[12.5px]">
                      <span className="text-warning">rollback_deployment</span>
                      <span className="text-ink">(</span>
                      <span className="text-orange">&quot;checkout-api&quot;</span>
                      <span className="text-ink">)</span>
                    </div>
                  </div>
                </div>
              )}

              {step.matches && (
                <div className="space-y-1.5">
                  {[
                    { label: "Rollback target: SUCCESS, live", pct: "verified", ok: true },
                    { label: "Deployment created after snapshot", pct: "verified", ok: true },
                    { label: "Mutation's own success flag", pct: "not trusted alone", ok: false },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[6px] border-l-[3px] text-[13px] ${
                        m.ok ? "border-l-success bg-success-subtle/40" : "border-l-border"
                      }`}
                    >
                      <span className="text-muted font-mono text-[11px]">check</span>
                      <span>{m.label}</span>
                      <span className={`ml-auto text-[11px] font-mono px-2 py-0.5 rounded-full ${m.ok ? "text-success bg-success-subtle/60" : "text-muted"}`}>
                        {m.pct}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Trust grid */}
      <section id="trust" className="max-w-[1180px] mx-auto px-6 py-[70px]">
        <div className="text-center max-w-[620px] mx-auto mb-[70px]">
          <h2 className="text-[34px] font-extrabold tracking-[-0.02em] mb-3.5">Built for trust, not just speed</h2>
          <p className="text-muted text-[15.5px]">An autonomous system that touches production has to earn every action it takes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { Icon: ShieldCheck, title: "Human approval gates", body: "High-risk or unfamiliar actions always wait for explicit sign-off — never guessed at." },
              { Icon: RotateCcw, title: "Snapshot & rollback", body: "State is captured before every action, so a bad fix can always be undone with one click." },
              { Icon: KeyRound, title: "Scoped credentials", body: "Railway tokens are AES-256-GCM encrypted at rest and validated against the real API before saving." },
              { Icon: ScrollText, title: "Full audit log", body: "Every diagnosis, action, and approval is recorded and reviewable after the fact." },
              { Icon: BadgeCheck, title: "Independent verification", body: "Every action is re-checked against real infrastructure state — never just the API call's own success flag." },
              { Icon: Blocks, title: "Per-org isolation", body: "Each org gets its own Datadog webhook secret and its own connected services — never shared." },
                    ].map((t) => {
                      const Icon = t.Icon;
                      return(
                            <div key={t.title} className="bg-white border border-border rounded-[8px] p-6">
                              <div className="w-8 h-8 rounded-[6px] bg-primary-subtle text-primary flex items-center justify-center text-[15px] mb-4">
                                <Icon size={16} strokeWidth={2} />
                              </div>
                              <h4 className="text-[14.5px] font-semibold mb-1.5">{t.title}</h4>
                              <p className="text-[13px] leading-[1.6] text-slate">{t.body}</p>
                            </div>
                          )})}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1180px] mx-auto px-6 py-20 text-center border-t border-border">
        <h2 className="text-[34px] font-extrabold tracking-[-0.02em] mb-3">Stop getting paged for the same fix twice</h2>
        <p className="text-muted text-[15.5px] mb-8">Connect Datadog and your first Railway service in minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
          <Link href="/signup" className="text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[6px] bg-primary-hover text-white hover:bg-[#0891E0] transition-colors">
            Try OnCallOS free
          </Link>
          <Link href="/docs" className="text-[13.5px] font-semibold px-[18px] py-2.5 rounded-[6px] border border-primary text-primary hover:bg-primary/10 transition-colors">
            Read the docs
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-[1180px] mx-auto px-6 py-12 grid md:grid-cols-5 gap-y-10">
          <div>
            <div className="flex items-center gap-2 font-bold text-[15px] mb-3.5">
              <div className="w-[22px] h-[22px] rounded-[5px] bg-primary-hover flex items-center justify-center text-[12px] text-white font-mono">&gt;_</div>
              OnCallOS
            </div>
            <p className="text-[13px] text-muted max-w-[220px]">Autonomous incident resolution for teams who&apos;d rather sleep.</p>
          </div>
          {[
            { h: "Product", links: [{ l: "How it works", href: "/#pipeline" }, { l: "Security", href: "/#trust" }, { l: "Pricing", href: "/#pricing" }] },
            { h: "Resources", links: [{ l: "Docs", href: "/docs" }] },
          ].map((col) => (
            <div key={col.h}>
              <h5 className="text-[12px] font-semibold text-muted mb-3">{col.h}</h5>
              <div className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <Link key={l.l} href={l.href} className="text-[13px] text-slate hover:text-ink transition-colors">{l.l}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="max-w-[1180px] mx-auto px-6 py-5 border-t border-border-subtle flex items-center justify-between text-[12px] text-muted">
          <span>© 2026 OnCallOS. Portfolio project.</span>
          <span className="font-mono">v0.1.0</span>
        </div>
      </footer>
    </div>
  );
}