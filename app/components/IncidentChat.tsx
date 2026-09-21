"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useOrg } from "../lib/OrgContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function IncidentChat({ incidentId }: { incidentId: string }) {
  const { orgId } = useOrg();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setToken(session.access_token);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/incidents/${incidentId}/chat`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-Organization-Id": orgId,
      },
    });

    if (res.ok) setMessages(await res.json());
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, [incidentId, orgId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setSending(true);
    setInput("");

    // Optimistically show the user's message immediately
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text, created_at: new Date().toISOString() }]);

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/incidents/${incidentId}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-Id": orgId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    setSending(false);

    if (!res.ok) {
      setError("Could not send message. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }

    const assistantMessage = await res.json();
    setMessages((prev) => [...prev, assistantMessage]);
  }

  return (
    <div className="bg-white border border-border rounded-[8px] flex flex-col h-[480px]">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {!loaded && <div className="text-[13px] text-muted text-center py-6">Loading conversation...</div>}

        {loaded && messages.length === 0 && (
          <div className="text-[13px] text-muted text-center py-6">
            Ask anything about this incident — root cause, next steps, or how similar issues were resolved before.
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                m.role === "user" ? "bg-primary-subtle text-primary" : "bg-teal/15 text-teal"
              }`}
            >
              {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
            </div>
            <div
              className={`max-w-[75%] px-3.5 py-2.5 rounded-[10px] text-[13px] leading-[1.5] ${
                m.role === "user"
                  ? "bg-primary-hover text-white rounded-tr-[2px]"
                  : "bg-surface border border-border rounded-tl-[2px]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-teal/15 text-teal">
              <Bot size={12} />
            </div>
            <div className="px-3.5 py-2.5 rounded-[10px] rounded-tl-[2px] bg-surface border border-border text-[13px] text-muted">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-4 py-2 text-[12px] text-critical bg-critical-subtle/40 border-t border-critical/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          placeholder="Ask about this incident..."
          className="flex-1 bg-surface border border-border rounded-[6px] px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="w-[38px] h-[38px] shrink-0 rounded-[6px] bg-primary-hover text-white flex items-center justify-center hover:bg-[#0891E0] transition-colors disabled:opacity-50"
          aria-label="Send"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}