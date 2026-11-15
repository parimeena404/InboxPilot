import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Filter, ArrowLeft } from "lucide-react";
import EmailTable from "@/components/EmailTable";
import ConversationView from "@/components/ConversationView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
    { key: "all", label: "All Emails" },
    { key: "assistant", label: "Assistant to Reply" },
    { key: "client", label: "Client to Reply" },
    { key: "no_reply", label: "No Reply Needed" },
    { key: "action", label: "Action Required" },
    { key: "waiting", label: "Waiting for Response" },
    { key: "important", label: "Important" },
    { key: "meetings", label: "Meetings & Appointments" },
    { key: "archived", label: "Archived" },
];

export default function Mail() {
    const { emailId } = useParams();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const category = params.get("category") || "all";
    const q = params.get("q") || "";

    const [search, setSearch] = useState(q);
    const [priority, setPriority] = useState("all");
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => setSearch(q), [q]);
    useEffect(() => setPage(1), [category, q, priority, unreadOnly]);

    const load = useCallback(() => {
        setLoading(true);
        api.get("/emails", {
            params: { category, q, priority: priority === "all" ? "" : priority, unread_only: unreadOnly, page, page_size: 25 },
        })
            .then((d) => setData(d.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [category, q, priority, unreadOnly, page]);

    useEffect(load, [load]);

    const patch = async (id, body) => {
        try {
            const { data: updated } = await api.patch(`/emails/${id}`, body);
            setData((d) => (d ? { ...d, items: d.items.map((e) => (e.id === id ? updated : e)), counts: { ...d.counts } } : d));
            load();
        } catch {}
    };

    const setCat = (key) => {
        const next = new URLSearchParams(params);
        next.set("category", key);
        next.delete("q");
        setParams(next);
    };

    const total = data?.total || 0;
    const pages = Math.max(1, Math.ceil(total / 25));

    return (
        <div className="mx-auto max-w-[1500px]">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-2.5" data-testid="mail-toolbar">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const next = new URLSearchParams(params);
                        if (search) next.set("q", search);
                        else next.delete("q");
                        setParams(next);
                    }}
                    className="relative flex-1 min-w-[200px] max-w-sm"
                >
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        data-testid="mail-search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search conversations…"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand"
                    />
                </form>

                <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger data-testid="priority-filter" className="h-10 w-[150px] rounded-xl bg-white">
                        <Filter size={13} className="text-slate-400" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 h-10 text-xs font-semibold text-slate-600">
                    <Switch data-testid="unread-toggle" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
                    Unread only
                </label>
            </div>

            {/* Split pane */}
            <div className={cn("grid gap-4", emailId ? "lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]" : "grid-cols-1")}>
                {/* Left column: category nav + list */}
                <div className={cn("space-y-3", emailId && "hidden lg:block")} data-testid="mail-list-pane">
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-slim pb-1" data-testid="mail-categories">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.key}
                                data-testid={`mail-category-${c.key}`}
                                onClick={() => setCat(c.key)}
                                className={cn(
                                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                                    category === c.key
                                        ? "border-ink-900 bg-ink-900 text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                                )}
                            >
                                {c.label}
                                {data?.counts?.[c.key] ? (
                                    <span className="ml-1.5 font-mono-num text-[10px] opacity-70">{data.counts[c.key]}</span>
                                ) : null}
                            </button>
                        ))}
                    </div>

                    <div className="card-base shadow-soft overflow-hidden">
                        {loading && !data ? (
                            <div className="p-4 space-y-2">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-14 rounded-xl shimmer" />
                                ))}
                            </div>
                        ) : (
                            <EmailTable
                                emails={data?.items || []}
                                selectedId={emailId}
                                onPatch={patch}
                                counts={data?.counts}
                                emptyHint="Try a different category or clear the search."
                            />
                        )}

                        {data && total > 0 && (
                            <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-2.5" data-testid="mail-pagination">
                                <span className="text-xs text-slate-400 font-mono-num">
                                    {total} conversation{total !== 1 ? "s" : ""} · page {page}/{pages}
                                </span>
                                <div className="flex gap-1.5">
                                    <Button
                                        data-testid="pagination-prev"
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="h-8 rounded-full px-3"
                                    >
                                        <ChevronLeft size={14} />
                                    </Button>
                                    <Button
                                        data-testid="pagination-next"
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= pages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="h-8 rounded-full px-3"
                                    >
                                        <ChevronRight size={14} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column: conversation (desktop split) */}
                {emailId && (
                    <div className="card-base shadow-soft overflow-hidden sticky top-[72px] max-h-[calc(100vh-96px)] hidden lg:block" data-testid="mail-detail-pane">
                        <ConversationView emailId={emailId} variant="assistant" />
                    </div>
                )}
            </div>

            {/* Mobile full-screen conversation */}
            {emailId && (
                <div className="lg:hidden fixed inset-0 z-40 bg-white" data-testid="mobile-conversation">
                    <div className="flex h-full flex-col pt-12">
                        <button
                            data-testid="mobile-conversation-back"
                            onClick={() => navigate("/mail")}
                            className="absolute left-4 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <ConversationView emailId={emailId} variant="assistant" />
                    </div>
                </div>
            )}
        </div>
    );
}
