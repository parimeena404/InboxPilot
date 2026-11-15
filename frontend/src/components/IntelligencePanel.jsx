import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, CalendarClock, Repeat2, Eye, AlarmClock, RefreshCcw, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "@/components/bits";
import api from "@/lib/api";
import { parseDate } from "@/lib/format";
import { format } from "date-fns";
import { useUI } from "@/lib/ui";

function BriefingCard({ briefing, source, onRefresh, refreshing }) {
    return (
        <div className="ai-tint border ai-border rounded-2xl p-4" data-testid="briefing-card">
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-dark">
                    <Sparkles size={14} />
                    AI Daily Briefing
                </span>
                <button
                    data-testid="briefing-refresh-btn"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-white/70 disabled:opacity-50"
                >
                    <RefreshCcw size={12} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "Updating…" : "Refresh"}
                </button>
            </div>
            {!briefing && <p className="text-sm text-slate-400">Briefing will appear here.</p>}
            {briefing && (
                <>
                    <p className="text-sm font-bold text-ink-900 leading-snug text-balance">{briefing.headline}</p>
                    {briefing.greeting_line && <p className="mt-1 text-xs font-medium text-brand-dark">{briefing.greeting_line}</p>}
                    <div className="mt-2 space-y-2">
                        {(briefing.paragraphs || []).map((p, i) => (
                            <p key={i} className="text-[13px] leading-relaxed text-slate-600">
                                {p}
                            </p>
                        ))}
                    </div>
                    {briefing.urgent?.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-500">Urgent matters</p>
                            {briefing.urgent.map((u, i) => (
                                <div key={i} className="rounded-lg bg-white/80 border border-red-100 px-2.5 py-1.5">
                                    <p className="text-xs font-semibold text-ink-900 truncate">{u.subject}</p>
                                    <p className="text-[11px] text-slate-500">{u.why}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {briefing.focus?.length > 0 && (
                        <div className="mt-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">Today's focus</p>
                            <ul className="space-y-1">
                                {briefing.focus.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600">
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {source === "ai" && (
                        <p className="mt-3 text-[10px] font-medium text-slate-400">Generated live by Pilot · not from the sender</p>
                    )}
                </>
            )}
        </div>
    );
}

function PanelRow({ icon: Icon, label, count, children, testId }) {
    return (
        <div className="card-base shadow-soft p-4" data-testid={testId}>
            <div className="flex items-center gap-2 mb-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Icon size={13} />
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</span>
                {count > 0 && <span className="ml-auto font-mono-num text-[11px] font-semibold text-slate-400">{count}</span>}
            </div>
            {children}
        </div>
    );
}

export default function IntelligencePanel() {
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();
    const { openAssistant } = useUI();

    const load = () => api.get("/intelligence").then((d) => setData(d.data)).catch(() => {});
    useEffect(() => {
        load();
    }, []);

    const refresh = async () => {
        setRefreshing(true);
        try {
            const payload = (await api.post("/briefing/refresh")).data;
            setData((d) => ({ ...d, briefing: payload, briefing_source: "ai" }));
        } catch (e) {
            // keep old briefing on failure
        } finally {
            setRefreshing(false);
        }
    };

    const open = (id) => navigate(`/mail/${id}`);

    return (
        <div className="space-y-4" data-testid="intelligence-panel">
            <BriefingCard
                briefing={data?.briefing}
                source={data?.briefing_source}
                onRefresh={refresh}
                refreshing={refreshing}
            />

            <PanelRow icon={CalendarClock} label="Upcoming Meetings" count={data?.meetings?.length} testId="panel-meetings">
                {!data?.meetings?.length && <p className="text-xs text-slate-400">No upcoming meetings.</p>}
                <div className="space-y-1">
                    {data?.meetings?.map((m) => (
                        <button
                            key={m.email_id}
                            data-testid={`meeting-${m.email_id}`}
                            onClick={() => open(m.email_id)}
                            className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 transition-colors"
                        >
                            <p className="text-[13px] font-semibold text-ink-900 truncate">{m.title}</p>
                            <p className="text-[11px] text-slate-400">
                                {format(parseDate(m.start), "EEE d MMM · HH:mm")} {m.location && `· ${m.location}`}
                            </p>
                        </button>
                    ))}
                </div>
            </PanelRow>

            <PanelRow icon={Repeat2} label="Pending Follow-ups" count={data?.followups?.length} testId="panel-followups">
                {!data?.followups?.length && <p className="text-xs text-slate-400">Nothing pending.</p>}
                <div className="space-y-1">
                    {data?.followups?.map((f) => (
                        <button
                            key={f.email_id}
                            data-testid={`followup-${f.email_id}`}
                            onClick={() => open(f.email_id)}
                            className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 transition-colors"
                        >
                            <p className="text-[13px] font-semibold text-ink-900 truncate">{f.subject}</p>
                            <p className="text-[11px] text-slate-400 truncate">{f.sender_name} · waiting on a reply</p>
                        </button>
                    ))}
                </div>
            </PanelRow>

            <PanelRow icon={Eye} label="Needs Review" count={data?.needs_review?.length} testId="panel-review">
                {!data?.needs_review?.length && <p className="text-xs text-slate-400">Nothing needs review.</p>}
                <div className="space-y-1">
                    {data?.needs_review?.map((r) => (
                        <button
                            key={r.email_id}
                            data-testid={`review-${r.email_id}`}
                            onClick={() => open(r.email_id)}
                            className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 transition-colors"
                        >
                            <p className="text-[13px] font-semibold text-ink-900 truncate">{r.subject}</p>
                            <p className="text-[11px] text-slate-400 truncate line-clamp-2">{r.reason}</p>
                        </button>
                    ))}
                </div>
            </PanelRow>

            <PanelRow icon={AlarmClock} label="Important Deadlines" count={data?.deadlines?.length} testId="panel-deadlines">
                {!data?.deadlines?.length && <p className="text-xs text-slate-400">No deadlines ahead.</p>}
                <div className="space-y-1">
                    {data?.deadlines?.map((d) => (
                        <button
                            key={d.email_id}
                            data-testid={`deadline-${d.email_id}`}
                            onClick={() => open(d.email_id)}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50 transition-colors"
                        >
                            <span className="flex-1 min-w-0">
                                <span className="block text-[13px] font-semibold text-ink-900 truncate">{d.subject}</span>
                                <span className="block text-[11px] text-slate-400">{d.deadline_label}</span>
                            </span>
                            <ArrowUpRight size={13} className="text-slate-300" />
                        </button>
                    ))}
                </div>
            </PanelRow>
        </div>
    );
}
