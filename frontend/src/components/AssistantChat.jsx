import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, Send, Copy, Paperclip, X, Check } from "lucide-react";
import { toast } from "sonner";
import { TypingDots } from "@/components/bits";
import api, { sse } from "@/lib/api";
import { cn } from "@/lib/utils";

const GENERAL_CHIPS = ["Brief me on today's inbox", "What's blocked on clients?", "Summarize unread threads"];
const EMAIL_CHIPS = ["Summarize this conversation", "Why is it classified this way?", "Any follow-ups I'm missing?"];

export default function AssistantChat({ sessionId = "general", emailContext = null, onClearContext = null, className, style }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const scrollRef = useRef(null);
    const effectiveSession = emailContext ? `email-${emailContext.id}` : sessionId;

    const scrollDown = useCallback(() => {
        requestAnimationFrame(() => {
            const el = scrollRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
    }, []);

    useEffect(() => {
        let live = true;
        api.get("/assistant/messages", { params: { session_id: effectiveSession } })
            .then((d) => live && setMessages(d.data.items || []))
            .catch(() => {});
        return () => {
            live = false;
        };
    }, [effectiveSession]);

    useEffect(scrollDown, [messages.length, streaming, scrollDown]);

    const send = async (text) => {
        const message = (text ?? input).trim();
        if (!message || streaming) return;
        setInput("");
        setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content: message }]);
        setStreaming(true);
        const assistantId = `local-a-${Date.now()}`;
        setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

        await sse(
            "/assistant/chat",
            { session_id: effectiveSession, message, email_id: emailContext?.id || null },
            {
                onDelta: (delta) =>
                    setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: x.content + delta } : x))),
                onError: (err) => {
                    toast.error(err);
                    setMessages((m) => m.filter((x) => x.id !== assistantId));
                },
            },
        );
        setStreaming(false);
        scrollDown();
    };

    const copy = async (msg) => {
        try {
            await navigator.clipboard.writeText(msg.content);
            setCopiedId(msg.id);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopiedId(null), 1500);
        } catch {
            toast.error("Could not copy");
        }
    };

    const chips = emailContext ? EMAIL_CHIPS : GENERAL_CHIPS;

    return (
        <div className={cn("flex min-h-0 flex-col", className)} style={style} data-testid="assistant-chat">
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scrollbar-slim px-4 py-4 space-y-4"
                data-testid="assistant-messages"
            >
                {emailContext && (
                    <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-soft px-3 py-2" data-testid="assistant-context-indicator">
                        <Sparkles size={14} className="shrink-0 text-brand-dark" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-dark">Context</p>
                            <p className="truncate text-xs font-semibold text-ink-900">{emailContext.subject}</p>
                        </div>
                        {onClearContext && (
                            <button data-testid="assistant-clear-context" onClick={onClearContext} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                )}

                {!messages.length && !emailContext && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4" data-testid="assistant-welcome">
                        <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                            <Sparkles size={15} className="text-brand" />
                            Hi, I'm Pilot
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                            I can summarize conversations, explain why an email was classified a certain way, surface
                            follow-ups and draft replies. Attach an email for grounded answers.
                        </p>
                    </div>
                )}

                {messages.map((m) => (
                    <div key={m.id} data-testid={`assistant-msg-${m.role}`} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                        {m.role === "user" ? (
                            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[13px] leading-relaxed text-white whitespace-pre-wrap">
                                {m.content}
                            </div>
                        ) : (
                            <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-brand-border bg-brand-soft/60 px-3.5 py-2.5">
                                <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-brand-dark">
                                    <Sparkles size={11} />
                                    Pilot · AI generated
                                </div>
                                {m.content ? (
                                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-800">{m.content}</p>
                                ) : (
                                    <TypingDots />
                                )}
                                {m.content && !streaming && (
                                    <button
                                        data-testid="assistant-copy-btn"
                                        onClick={() => copy(m)}
                                        className="mt-2 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-ink-900"
                                    >
                                        {copiedId === m.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                        {copiedId === m.id ? "Copied" : "Copy"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="border-t border-slate-200/80 p-3 space-y-2.5">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-slim pb-0.5" data-testid="assistant-chips">
                    {chips.map((c) => (
                        <button
                            key={c}
                            data-testid={`assistant-chip-${c.slice(0, 18).replace(/\s+/g, "-").toLowerCase()}`}
                            onClick={() => send(c)}
                            disabled={streaming}
                            className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-brand hover:text-brand-dark transition-colors disabled:opacity-50"
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <form
                    className="flex items-end gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        send();
                    }}
                >
                    <textarea
                        data-testid="assistant-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                        rows={1}
                        placeholder={emailContext ? `Ask about “${emailContext.subject}”…` : "Ask Pilot anything…"}
                        className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-brand focus:bg-white"
                    />
                    <button
                        type="submit"
                        data-testid="assistant-send"
                        disabled={streaming || !input.trim()}
                        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-all hover:bg-brand-dark disabled:opacity-40"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
