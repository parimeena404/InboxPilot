import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import AssistantChat from "@/components/AssistantChat";
import { Avatar } from "@/components/bits";
import api from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function AssistantPage() {
    const [recent, setRecent] = useState([]);
    const [context, setContext] = useState(null);

    useEffect(() => {
        api.get("/emails", { params: { category: "all", page_size: 8 } })
            .then((d) => setRecent(d.data.items))
            .catch(() => {});
    }, []);

    return (
        <div className="mx-auto max-w-[1200px]" data-testid="assistant-page">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] h-[calc(100vh-140px)]">
                <div className="card-base shadow-soft overflow-hidden flex flex-col min-h-0">
                    <div className="flex items-center gap-2.5 border-b border-slate-200/80 px-4 py-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft border border-brand-border text-brand-dark">
                            <Sparkles size={15} />
                        </span>
                        <div>
                            <p className="text-sm font-bold text-ink-900">Pilot — AI Assistant</p>
                            <p className="text-[11px] text-slate-400">Workspace-wide · grounded in the attached conversation when one is selected</p>
                        </div>
                    </div>
                    <AssistantChat className="flex-1" emailContext={context} onClearContext={() => setContext(null)} />
                </div>

                <div className="hidden lg:flex card-base shadow-soft flex-col overflow-hidden min-h-0" data-testid="context-picker">
                    <div className="border-b border-slate-200/80 px-4 py-3">
                        <p className="text-sm font-bold text-ink-900">Attach a conversation</p>
                        <p className="text-[11px] text-slate-400">Pilot reads it before answering.</p>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-slim p-2 space-y-0.5">
                        {recent.map((em) => (
                            <button
                                key={em.id}
                                data-testid={`context-email-${em.id}`}
                                onClick={() => setContext({ id: em.id, subject: em.subject })}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                                    context?.id === em.id ? "bg-brand-soft border border-brand-border" : "hover:bg-slate-50 border border-transparent",
                                )}
                            >
                                <Avatar item={em} size={30} />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px] font-semibold text-ink-900">{em.subject}</span>
                                    <span className="block text-[11px] text-slate-400 truncate">
                                        {em.sender_name} · {timeAgo(em.received_at)}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
