import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Inbox, AlertCircle, UserCheck, CornerUpLeft, Clock, Sparkles, TrendingUp, ArrowRight,
} from "lucide-react";
import { KpiCard, SectionHeader } from "@/components/bits";
import EmailTable from "@/components/EmailTable";
import IntelligencePanel from "@/components/IntelligencePanel";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { greetingFor, todayLabel } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export default function Overview() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [emails, setEmails] = useState(null);

    useEffect(() => {
        api.get("/stats").then((d) => setStats(d.data)).catch(() => {});
        api.get("/emails", { params: { category: "all", page_size: 12 } })
            .then((d) => setEmails(d.data.items))
            .catch(() => setEmails([]));
    }, []);

    const patch = async (id, body) => {
        try {
            const { data } = await api.patch(`/emails/${id}`, body);
            setEmails((list) => list.map((e) => (e.id === id ? data : e)));
            api.get("/stats").then((d) => setStats(d.data)).catch(() => {});
        } catch {
            // row stays as-is on failure
        }
    };

    return (
        <div className="mx-auto max-w-[1500px] space-y-6" data-testid="overview-page">
            {/* Section 1 — welcome + daily briefing */}
            <section className="fade-up" data-testid="welcome-section">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-ink-900" data-testid="greeting-title">
                            {greetingFor()}, {user?.name?.split(" ")[0]}.
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">{todayLabel()}</p>
                    </div>
                    <button
                        data-testid="goto-mail-btn"
                        onClick={() => navigate("/mail?category=action")}
                        className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-brand hover:text-brand-dark transition-colors"
                    >
                        Triage inbox
                        <ArrowRight size={13} />
                    </button>
                </div>
            </section>

            {/* Section 2 — KPI cards */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" data-testid="kpi-section">
                {!stats &&
                    Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)}
                {stats && (
                    <>
                        <KpiCard testId="kpi-total" label="Total Emails" value={stats.total_emails} icon={Inbox} hint={`+${stats.fresh_today} today`} hintTone="teal" delay={0} />
                        <KpiCard testId="kpi-unread" label="Unread" value={stats.unread} icon={AlertCircle} hint={stats.unread > 0 ? "needs scan" : "all clear"} hintTone={stats.unread > 0 ? "amber" : "slate"} delay={40} />
                        <KpiCard testId="kpi-action" label="Action Required" value={stats.action_required} icon={TrendingUp} hint="triage first" hintTone="red" delay={80} />
                        <KpiCard testId="kpi-client" label="Client Attention" value={stats.client_attention} icon={UserCheck} hint="waiting on you" hintTone="amber" delay={120} />
                        <KpiCard testId="kpi-assistant" label="Assistant Pending" value={stats.assistant_pending} icon={CornerUpLeft} hint="owned by Pilot" hintTone="teal" delay={160} />
                        <KpiCard testId="kpi-waiting" label="Waiting for Response" value={stats.waiting} icon={Clock} hint="tracked" hintTone="slate" delay={200} />
                    </>
                )}
            </section>

            {/* Section 3 + 4 — priority inbox table + intelligence panel */}
            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" data-testid="inbox-section">
                <div className="card-base shadow-soft overflow-hidden order-2 xl:order-1">
                    <div className="border-b border-slate-200/80 px-4 py-3.5">
                        <SectionHeader
                            title="Priority Inbox"
                            hint="Newest first · newest unread highlighted"
                            action={
                                <button
                                    data-testid="open-all-mail-btn"
                                    onClick={() => navigate("/mail")}
                                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-brand-dark hover:bg-brand-soft transition-colors"
                                >
                                    Open mail workspace
                                    <ArrowRight size={13} />
                                </button>
                            }
                        />
                    </div>
                    {!emails && (
                        <div className="space-y-2 p-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 rounded-xl" />
                            ))}
                        </div>
                    )}
                    {emails && <EmailTable emails={emails} onPatch={patch} />}
                </div>

                <div className="order-1 xl:order-2" data-testid="right-intelligence-column">
                    <IntelligencePanel />
                </div>
            </section>
        </div>
    );
}
