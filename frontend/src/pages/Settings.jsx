import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Link2, Bell, Palette, Info, RefreshCcw, PlugZap, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/bits";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const TABS = [
    { key: "profile", label: "Profile", icon: User },
    { key: "accounts", label: "Connected Accounts", icon: Link2 },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "appearance", label: "Appearance", icon: Palette },
    { key: "about", label: "About", icon: Info },
];

function ProfilePanel() {
    const { user, refresh } = useAuth();
    const [name, setName] = useState(user?.name || "");
    const [title, setTitle] = useState(user?.title || "");
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await api.post("/auth/profile", { name, title });
            await refresh();
            toast.success("Profile saved");
        } catch {
            toast.error("Could not save profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-lg space-y-5" data-testid="profile-panel">
            <div className="flex items-center gap-4">
                <Avatar item={{ sender_name: name, tint: "slate" }} size={64} />
                <div>
                    <p className="text-sm font-bold text-ink-900">{name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-brand-soft border border-brand-border px-2 text-[10px] font-bold uppercase tracking-wide text-brand-dark">
                        {user?.role} demo account
                    </span>
                </div>
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-500">Full name</label>
                <Input data-testid="profile-name-input" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 rounded-xl" />
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-500">Role / title</label>
                <Input data-testid="profile-title-input" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-11 rounded-xl" />
            </div>
            <Button data-testid="profile-save-btn" onClick={save} disabled={saving} className="h-10 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold px-6">
                Save changes
            </Button>
        </div>
    );
}

function AccountsPanel() {
    const [accounts, setAccounts] = useState(null);
    const [syncingId, setSyncingId] = useState(null);

    const load = () => api.get("/accounts").then((d) => setAccounts(d.data.items)).catch(() => {});
    useEffect(load, []);

    const sync = async (id) => {
        setSyncingId(id);
        try {
            const { data } = await api.post(`/accounts/${id}/sync`);
            setAccounts((list) => list.map((a) => (a.id === id ? { ...a, last_sync: data.last_sync } : a)));
            toast.success("Account synchronized");
        } catch {
            toast.error("Sync failed");
        } finally {
            setSyncingId(null);
        }
    };

    return (
        <div className="space-y-3 max-w-2xl" data-testid="accounts-panel">
            <p className="text-sm text-slate-500">
                Mailboxes Pilot monitors and classifies on your behalf.
            </p>
            {!accounts && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
            {accounts?.map((a) => (
                <div
                    key={a.id}
                    data-testid={`account-card-${a.id}`}
                    className="card-base shadow-soft flex flex-wrap items-center gap-4 p-4"
                >
                    <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                        style={{ background: a.color }}
                    >
                        {a.provider[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                            {a.email}
                            {a.primary && (
                                <span className="rounded-full bg-slate-100 border border-slate-200 px-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                    primary
                                </span>
                            )}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs mt-0.5">
                            {a.status === "connected" ? (
                                <>
                                    <CheckCircle2 size={13} className="text-emerald-500" />
                                    <span className="font-semibold text-emerald-600">Connected</span>
                                    <span className="text-slate-400">· synced {timeAgo(a.last_sync)}</span>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle size={13} className="text-amber-500" />
                                    <span className="font-semibold text-amber-600 capitalize">{a.status}</span>
                                    <span className="text-slate-400">· last sync {timeAgo(a.last_sync)}</span>
                                </>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            data-testid={`account-sync-${a.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => sync(a.id)}
                            disabled={syncingId === a.id}
                            className="h-9 rounded-full border-slate-200 text-xs font-bold"
                        >
                            <RefreshCcw size={13} className={`mr-1.5 ${syncingId === a.id ? "animate-spin" : ""}`} />
                            Sync now
                        </Button>
                        <Button
                            data-testid={`account-disconnect-${a.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info("Demo workspace — connections are simulated.")}
                            className="h-9 rounded-full border-slate-200 text-xs font-bold text-slate-500"
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>
            ))}
            <button
                data-testid="account-connect-btn"
                onClick={() => toast.info("Demo workspace — new connections are simulated.")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-5 text-sm font-semibold text-slate-400 hover:border-brand hover:text-brand-dark transition-colors"
            >
                <PlugZap size={16} />
                Connect a new mailbox
            </button>
        </div>
    );
}

function NotificationsPanel() {
    const [items, setItems] = useState({ digest: true, urgentOnly: false, clientPing: true, briefing: true });
    return (
        <div className="max-w-lg space-y-4" data-testid="notifications-panel">
            {[
                ["digest", "Daily briefing at 8:00", "Pilot's morning summary, every workday"],
                ["urgentOnly", "Urgent-only interruptions", "Ping me only for urgent matters"],
                ["clientPing", "Client decision alerts", "When something needs a personal decision"],
                ["briefing", "Weekly digest", "A weekly recap of the workspace"],
            ].map(([key, label, hint]) => (
                <label key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <span>
                        <span className="block text-sm font-bold text-ink-900">{label}</span>
                        <span className="block text-xs text-slate-400">{hint}</span>
                    </span>
                    <Switch data-testid={`notif-${key}`} checked={items[key]} onCheckedChange={(v) => setItems((s) => ({ ...s, [key]: v }))} />
                </label>
            ))}
        </div>
    );
}

function AppearancePanel() {
    return (
        <div className="max-w-lg" data-testid="appearance-panel">
            <p className="text-sm font-bold text-ink-900">InboxPilot look</p>
            <p className="text-xs text-slate-400 mt-0.5">One polished theme, designed for long reading sessions.</p>
            <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="sidebar-shell h-24 p-3">
                    <div className="h-3 w-24 rounded-full bg-white/20" />
                    <div className="mt-2 h-2 w-36 rounded-full bg-white/10" />
                </div>
                <div className="p-3">
                    <p className="text-xs font-semibold text-ink-900">Executive — deep ink &amp; teal</p>
                    <p className="text-[11px] text-slate-400">Current theme · dark sidebar, warm canvas, teal intelligence</p>
                </div>
            </div>
        </div>
    );
}

function AboutPanel() {
    return (
        <div className="max-w-lg space-y-3" data-testid="about-panel">
            <p className="text-sm font-bold text-ink-900">InboxPilot</p>
            <p className="text-sm leading-relaxed text-slate-500">
                An AI email workspace that classifies conversations, drafts replies and protects your attention.
                This is a demonstration environment with simulated mailboxes and sample data.
            </p>
            <p className="text-xs text-slate-400">Version 1.0.0 · Demo build · © 2026 InboxPilot</p>
        </div>
    );
}

export default function Settings() {
    const [params, setParams] = useSearchParams();
    const tab = params.get("tab") || "profile";

    return (
        <div className="mx-auto max-w-[1100px]" data-testid="settings-page">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Settings</h1>
            <div className="mt-6 flex flex-col md:flex-row gap-6">
                <nav className="flex md:flex-col gap-1 overflow-x-auto scrollbar-slim md:w-56 shrink-0" data-testid="settings-nav">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            data-testid={`settings-tab-${t.key}`}
                            onClick={() => setParams({ tab: t.key })}
                            className={cn(
                                "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap",
                                tab === t.key ? "bg-ink-900 text-white" : "text-slate-600 hover:bg-slate-100",
                            )}
                        >
                            <t.icon size={16} className={tab === t.key ? "text-brand" : "text-slate-400"} />
                            {t.label}
                        </button>
                    ))}
                </nav>
                <div className="card-base shadow-soft flex-1 p-6" data-testid="settings-content">
                    {tab === "profile" && <ProfilePanel />}
                    {tab === "accounts" && <AccountsPanel />}
                    {tab === "notifications" && <NotificationsPanel />}
                    {tab === "appearance" && <AppearancePanel />}
                    {tab === "about" && <AboutPanel />}
                </div>
            </div>
        </div>
    );
}
