import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "basketo-ai-chat";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [initialMessages] = useState<UIMessage[]>(() => loadMessages());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, setMessages, error, clearError } = useChat({
    id: "basketo-assistant",
    messages: initialMessages,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open, messages.length, status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    clearError();
    setRequestError(null);
    try {
      await sendMessage({ text });
    } catch (error) {
      console.error("[assistant] Request failed:", error);
      setRequestError(error instanceof Error ? error.message : "The assistant request failed.");
    }
  }

  function clear() {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen((v) => !v)}
        className="bk-ai-launcher fixed bottom-18 right-4 sm:bottom-6 sm:right-6 z-40 grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-xl hover:shadow-emerald-600/30 transition-all active:scale-95"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bk-ai-panel fixed bottom-24 right-4 sm:bottom-24 sm:right-6 z-50 flex h-[560px] max-h-[75vh] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-linear-to-r from-emerald-50 via-white to-amber-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl gradient-leaf text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold">Basketo Assistant</div>
                  <div className="text-xs text-muted-foreground">Catalog + project expert</div>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clear}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 bk-ai-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-3 py-6 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-emerald-600 bk-ai-welcome-icon" />
                  <p className="text-sm text-muted-foreground">
                    Hi! I&apos;m your Basketo concierge — ask me about products, prices, delivery,
                    refunds, your account, or anything about the project.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "Show top-rated groceries",
                      "Compare smartphones under ₹30,000",
                      "How does Basketo store account data?",
                      "Explain the project's tech stack",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage({ text: s })}
                        className="bk-ai-suggestion-chip rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                const tools = m.parts.filter((p) => p.type.startsWith("tool-"));
                return (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === "user"
                          ? "bk-ai-message-user shadow-md shadow-emerald-900/10"
                            : "bk-ai-message-assistant border border-slate-100 bg-slate-50 text-foreground shadow-sm"
                      }`}
                    >
                      {tools.length > 0 && m.role !== "user" && (
                        <div className="mb-1 text-xs italic opacity-70">🔎 Searching catalog…</div>
                      )}
                      {text && (
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-a:text-primary">
                          <ReactMarkdown>{text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(error || requestError) && (
                <div className="rounded-2xl bk-ai-error-banner p-3 text-xs" role="alert">
                  <p className="font-bold">The assistant could not respond.</p>
                  <p className="mt-1 break-words">{requestError || error?.message}</p>
                  <p className="mt-1 text-rose-800">
                    Check that the server has a valid GEMINI_API_KEY or LOVABLE_API_KEY and restart it.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setRequestError(null);
                    }}
                    className="bk-ai-dismiss-btn mt-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-3 py-2 text-sm bk-ai-typing-indicator">
                    <span className="bk-ai-typing-dot" />
                    <span className="bk-ai-typing-dot" />
                    <span className="bk-ai-typing-dot" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for a product, price, or category..."
                aria-label="Ask the Basketo shopping assistant"
                className="h-10 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
