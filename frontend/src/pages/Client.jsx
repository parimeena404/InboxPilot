import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, CalendarClock, AlertTriangle, Inbox, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Logo, { LogoMark } from "@/components/Logo";
import { Avatar, PriorityBadge, Empty } from "@/components/bits";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { greetingFor, todayLabel, fullDate, shortDate, deadlineLabel, parseDate } from "@/lib/format";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, RefreshCcw } from "lucide-react";

function SummaryChip({ label, value, tone }) {
    const tones = {
        amber: "bg-amber-50 border-amber-200 text-amber-700",
        red: "bg-red-50 border-red-200 text-red-700",
        slate: "bg-slate-50 border-slate-200 text-slate-600",
    };
    return (
        <div data-testid={`summary-chip-${label.toLowerCase().replace(/\s+/g, "-")}`} className={`rounded-2xl border px-5 py-3.5 ${tones[tone]}`}>
            <p className="font-mono-num text-3xl font-semibold leading-none">{value}</p>
            <p className="mt-1.5 text-xs font-semibold opacity-80">{label}</p>
        </div>
    );
}

function AttentionCard({ em, onReview, onDelegate, busy }) {
    return (
        <article
            data-testid={`attention-card-${em.id}`}
            className="card-base shadow-soft hover:shadow-lift transition-all duration-200 hover:-translate-y-0.5 p-6 fade-up flex flex-col gap-4"
        >
            <div className="flex items-start gap-4">
                <Avatar item={em} size={46} unread={em.unread} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[15px] font-bold text-ink-900 truncate">{em.sender_name}</p>
                        <PriorityBadge priority={em.priority} small />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono-num mt-0.5">{fullDate(em.received_at)}</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold tracking-tight text-ink-900 text-balance" data-testid={`attention-subject-${em.id}`}>
                    {em.subject}
                </h3>
                <div className="mt-2.5 rounded-xl bg-brand-soft/70 border border-brand-border p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-dark">
                        <Sparkles size={11} />
                        What this is about
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{em.ai_summary}</p>
                </div>
                <p className="mt-2.5 text-[13px] leading-relaxed text-slate-500">
                    <span className="font-semibold text-slate-600">Why your response is required: </span>
                    {em.classification_reason}
                </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {em.deadline && (
                    <span data-testid="card-deadline" className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                        <CalendarClock size={12} />
                        Deadline · {deadlineLabel(em)}
                    </span>
                )}
                {em.meeting && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                        <CalendarClock size={12} />
                        {format(parseDate(em.meeting.start), "EEE d MMM · HH:mm")}
                    </span>
                )}
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                    data-testid={`review-email-btn-${em.id}`}
                    onClick={onReview}
                    className="h-11 flex-1 rounded-xl bg-ink-900 text-white text-sm font-bold hover:bg-ink-800 transition-colors"
                >
                    Review Email
                </button>
                <button
                    data-testid={`delegate-email-btn-${em.id}`}
                    onClick={onDelegate}
                    disabled={busy}
                    className="h-11 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-brand hover:text-brand-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} className="text-brand" />}
                    Ask Assistant to Handle
                </button>
            </div>
        </article>
    );
}

export default function ClientCenter() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        if (user === null) navigate("/login", { replace: true });
        if (user && user.role !== "client") navigate("/", { replace: true });
    }, [user, navigate]);

    const load = () => api.get("/client/summary").then((d) => setData(d.data)).catch(() => {});
    useEffect(() => {
        if (user?.role === "client") load();
    }, [user]);

    const delegate = async (em) => {
        setBusyId(em.id);
        try {
            await api.patch(`/emails/${em.id}`, { responsibility: "assistant", handled: true });
            toast.success(`${em.sender_name} — Pilot will take it from here.`);
            await load();
        } catch {
            toast.error("Could not delegate. Please try again.");
        } finally {
            setBusyId(null);
        }
    };

    if (!user || user.role !== "client") return null;

    return (
        <div className="min-h-screen bg-background" data-testid="client-center">
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 md:px-8">
                    <Logo size={34} />
                    <div className="ml-auto flex items-center gap-2">
                        <button data-testid="client-notifications-btn" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                            <Inbox size={18} />
                            {data?.pending_responses > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white font-mono-num">
                                    {data.pending_responses}
                                </span>
                            )}
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button data-testid="client-profile-btn" className="rounded-full">
                                    <Avatar item={{ sender_name: user.name, tint: "slate" }} size={36} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <p className="text-sm font-bold text-ink-900">{user.name}</p>
                                    <p className="text-xs font-normal text-slate-400">{user.email}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuItem data-testid="client-refresh" onClick={load}>
                                    <RefreshCcw size={14} className="mr-2" />
                                    Refresh
                                </DropdownMenuItem>
                                <DropdownMenuItem data-testid="client-logout" onClick={logout} className="text-red-600">
                                    <LogOut size={14} className="mr-2" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12 space-y-10">
                {/* Section 1 — personal attention summary */}
                <section className="fade-up" data-testid="client-hero">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-dark">{todayLabel()}</p>
                    <h1 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight text-ink-900 text-balance">
                        {greetingFor()}, {user.name.split(" ")[0]}. <span className="text-slate-300">Your attention, prioritized.</span>
                    </h1>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
                        Here are the conversations that need your personal response. Everything else is already
                        being handled.
                    </p>
                    <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
                        {!data ? (
                            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[84px] rounded-2xl" />)
                        ) : (
                            <>
                                <SummaryChip label="Pending Responses" value={data.pending_responses} tone="amber" />
                                <SummaryChip label="Urgent Decisions" value={data.urgent_decisions} tone="red" />
                                <SummaryChip label="Upcoming Deadlines" value={data.upcoming_deadlines} tone="slate" />
                            </>
                        )}
                    </div>
                </section>

                {/* Section 2 — emails requiring attention */}
                <section data-testid="attention-section">
                    <h2 className="text-lg font-bold tracking-tight text-ink-900">
                        Needs your response
                        {data && <span className="ml-2 font-mono-num text-sm font-semibold text-slate-400">{data.attention.length}</span>}
                    </h2>
                    <div className="mt-4 grid gap-5 md:grid-cols-2">
                        {!data &&
                            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
                        {data?.attention.length === 0 && (
                            <div className="md:col-span-2">
                                <Empty
                                    icon={CheckCircle2}
                                    title="You're all caught up"
                                    hint="No conversation is waiting on a personal response. Pilot has the rest covered."
                                />
                            </div>
                        )}
                        {data?.attention.map((em, i) => (
                            <AttentionCard
                                key={em.id}
                                em={em}
                                busy={busyId === em.id}
                                onReview={() => navigate(`/client/review/${em.id}`)}
                                onDelegate={() => delegate(em)}
                            />
                        ))}
                    </div>
                </section>

                {/* Section 3 + 4 */}
                <section className="grid gap-5 md:grid-cols-2 pb-16" data-testid="client-secondary">
                    <div className="card-base shadow-soft p-5" data-testid="recently-handled">
                        <h3 className="text-sm font-bold text-ink-900">Recently handled</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Delegated or completed — no action needed.</p>
                        <div className="mt-3 divide-y divide-slate-100">
                            {data?.handled.map((em) => (
                                <div key={em.id} data-testid={`handled-${em.id}`} className="flex items-center gap-3 py-2.5">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                                        <CheckCircle2 size={13} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[13px] font-semibold text-slate-600">{em.subject}</p>
                                        <p className="text-[11px] text-slate-400 truncate">{em.sender_name}</p>
                                    </div>
                                </div>
                            ))}
                            {data && !data.handled.length && <p className="py-3 text-xs text-slate-400">Nothing yet.</p>}
                        </div>
                    </div>

                    <div className="card-base shadow-soft p-5" data-testid="upcoming-events">
                        <h3 className="text-sm font-bold text-ink-900">Upcoming events &amp; deadlines</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Pulled from your conversations by Pilot.</p>
                        <div className="mt-3 space-y-1">
                            {data?.events.map((ev, i) => {
                                const d = parseDate(ev.start);
                                return (
                                    <button
                                        key={`${ev.kind}-${ev.email_id}-${i}`}
                                        data-testid={`client-event-${i}`}
                                        onClick={() => navigate(`/client/review/${ev.email_id}`)}
                                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50 transition-colors"
                                    >
                                        <span className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border ${ev.kind === "deadline" ? "border-red-100 bg-red-50 text-red-600" : "border-sky-100 bg-sky-50 text-sky-700"}`}>
                                            <span className="font-mono-num text-[15px] font-bold leading-none">{d ? format(d, "d") : "–"}</span>
                                            <span className="text-[9px] font-bold uppercase">{d ? format(d, "MMM") : ""}</span>
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[13px] font-semibold text-ink-900">{ev.title}</span>
                                            <span className="block text-[11px] text-slate-400">
                                                {ev.kind === "deadline" ? "Deadline" : "Meeting"} · {d ? format(d, "EEE HH:mm") : ""} {ev.location && `· ${ev.location}`}
                                            </span>
                                        </span>
                                        <ArrowRight size={13} className="shrink-0 text-slate-300" />
                                    </button>
                                );
                            })}
                            {data && !data.events.length && <p className="py-3 text-xs text-slate-400">Nothing scheduled.</p>}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
