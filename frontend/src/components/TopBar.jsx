import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, Sparkles, LogOut, Settings, RefreshCcw, UserCog, Link2 } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar } from "@/components/bits";
import { SidebarContent } from "@/components/Sidebar";
import { useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import api from "@/lib/api";
import { initialsOf } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default function TopBar({ title }) {
    const { user, logout, demoLogin } = useAuth();
    const { openAssistant } = useUI();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawer, setDrawer] = useState(false);
    const [q, setQ] = useState("");
    const [alerts, setAlerts] = useState(null);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        api.get("/intelligence").then((d) => setAlerts(d.data)).catch(() => {});
        api.get("/accounts").then((d) => setAccounts(d.data.items)).catch(() => {});
    }, [location]);

    const alertCount = alerts ? (alerts.needs_review?.length || 0) + (alerts.deadlines?.length || 0) : 0;
    const connected = accounts.filter((a) => a.status === "connected").length;
    const otherRole = user?.role === "client" ? "assistant" : "client";

    const switchRole = async () => {
        await demoLogin(otherRole);
        navigate(otherRole === "client" ? "/client" : "/");
    };

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 md:px-6 backdrop-blur-xl">
            <button
                data-testid="mobile-menu-btn"
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                onClick={() => setDrawer(true)}
            >
                <Menu size={20} />
            </button>

            <h1 className="text-base md:text-lg font-bold tracking-tight text-ink-900 truncate" data-testid="topbar-title">
                {title}
            </h1>

            <form
                className="ml-auto hidden sm:block"
                onSubmit={(e) => {
                    e.preventDefault();
                    navigate(`/mail?q=${encodeURIComponent(q)}&category=all`);
                }}
            >
                <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        data-testid="global-search-input"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search mail…"
                        className="h-9 w-44 lg:w-72 rounded-full border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm outline-none transition-all duration-200 focus:w-56 lg:focus:w-80 focus:border-brand focus:bg-white"
                    />
                </div>
            </form>

            <Button
                data-testid="ask-pilot-btn"
                onClick={() => openAssistant()}
                className="hidden md:inline-flex h-9 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold gap-2 px-4"
            >
                <Sparkles size={15} className="text-brand" />
                Ask Pilot
            </Button>

            <div
                data-testid="accounts-status-chip"
                className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                title="Connected accounts"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {connected} accounts synced
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <button
                        data-testid="notifications-btn"
                        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <Bell size={18} />
                        {alertCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white font-mono-num">
                                {alertCount}
                            </span>
                        )}
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-2">
                    <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-slate-400">Needs attention</p>
                    {!alerts && <p className="px-2 py-3 text-sm text-slate-400">Loading…</p>}
                    {alerts?.needs_review?.slice(0, 3).map((n) => (
                        <button
                            key={n.email_id}
                            data-testid={`alert-review-${n.email_id}`}
                            className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                            onClick={() => navigate(`/mail/${n.email_id}`)}
                        >
                            <p className="text-sm font-semibold text-ink-900 truncate">{n.subject}</p>
                            <p className="text-xs text-slate-400 truncate">Review requested · {n.sender_name}</p>
                        </button>
                    ))}
                    {alerts?.deadlines?.slice(0, 3).map((d) => (
                        <button
                            key={d.email_id}
                            data-testid={`alert-deadline-${d.email_id}`}
                            className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                            onClick={() => navigate(`/mail/${d.email_id}`)}
                        >
                            <p className="text-sm font-semibold text-ink-900 truncate">{d.subject}</p>
                            <p className="text-xs text-red-500 font-medium truncate">Deadline · {d.deadline_label}</p>
                        </button>
                    ))}
                </PopoverContent>
            </Popover>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button data-testid="profile-menu-btn" className="rounded-full outline-none ring-brand focus:ring-2">
                        <Avatar item={{ sender_name: user?.name || "", tint: "slate" }} size={36} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="flex items-center gap-3">
                        <Avatar item={{ sender_name: user?.name || "", tint: "slate" }} size={40} />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-ink-900">{user?.name}</p>
                            <p className="truncate text-xs font-normal text-slate-400">{user?.email}</p>
                            <p className="mt-0.5 inline-block rounded-full bg-brand-soft border border-brand-border px-1.5 text-[10px] font-bold uppercase tracking-wide text-brand-dark">
                                {user?.role}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="menu-switch-role" onClick={switchRole}>
                        <UserCog size={15} className="mr-2" />
                        Switch to {otherRole} demo
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="menu-accounts" onClick={() => navigate("/settings?tab=accounts")}>
                        <Link2 size={15} className="mr-2" />
                        Connected accounts
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid="menu-settings" onClick={() => navigate("/settings")}>
                        <Settings size={15} className="mr-2" />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="menu-logout" onClick={logout} className="text-red-600">
                        <LogOut size={15} className="mr-2" />
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={drawer} onOpenChange={setDrawer}>
                <SheetContent side="left" className="sidebar-shell p-0 w-[280px] border-0">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <SidebarContent onNavigate={() => setDrawer(false)} />
                </SheetContent>
            </Sheet>
        </header>
    );
}
