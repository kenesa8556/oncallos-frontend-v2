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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, [messages, sending]);

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setError("");
    setSending(true);
    setInput("");
    requestAnimationFrame(autoGrow);

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="bg-white border border-border rounded-[8px] flex flex-col h-[70vh] sm:h-[560px] max-h-[80vh]">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 flex flex-col gap-3.5 chat-scroll">
        {!loaded && <div className="text-[13px] text-muted text-center py-6">Loading conversation...</div>}

        {loaded && messages.length === 0 && (
          <div className="text-[13px] text-muted text-center py-6 max-w-[380px] mx-auto">
            Ask anything about this incident — root cause, next steps, or how similar issues were resolved before.
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 sm:gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                m.role === "user" ? "bg-primary-subtle text-primary" : "bg-teal/15 text-teal"
              }`}
            >
              {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
            </div>
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-3.5 py-2.5 rounded-[10px] text-[13px] leading-[1.6] whitespace-pre-wrap break-words ${
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
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-teal/15 text-teal">
              <Bot size={12} />
            </div>
            <div className="px-3.5 py-2.5 rounded-[10px] rounded-tl-[2px] bg-surface border border-border text-[13px] text-muted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted/60 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted/60 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted/60 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-4 py-2 text-[12px] text-critical bg-critical-subtle/40 border-t border-critical/30 shrink-0">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="border-t border-border p-2.5 sm:p-3 flex items-end gap-2 shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoGrow();
          }}
          onKeyDown={handleKeyDown}
          disabled={sending}
          rows={1}
          placeholder="Ask about this incident..."
          className="flex-1 bg-surface border border-border rounded-[8px] px-3 py-2.5 text-[13px] text-ink leading-[1.4] resize-none focus:outline-none focus:border-primary transition-colors disabled:opacity-60 max-h-[160px] chat-scroll"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="w-[38px] h-[38px] shrink-0 rounded-[8px] bg-primary-hover text-white flex items-center justify-center hover:bg-[#0891E0] transition-colors disabled:opacity-50"
          aria-label="Send"
        >
          <Send size={15} />
        </button>
      </form>

      <style jsx global>{`
        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .chat-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 3px;
        }
        .chat-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
        }
        .chat-scroll:hover {
          scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
        }
      `}</style>
    </div>
  );
}