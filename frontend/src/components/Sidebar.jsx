import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Inbox, CornerUpLeft, UserCheck, CheckCircle2, AlertCircle,
    Clock, Star, Calendar, Archive, Sparkles, Link2, Settings, ChevronsLeft, ChevronsRight, CircleUser,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useUI } from "@/lib/ui";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

function useCounts() {
    const location = useLocation();
    const [counts, setCounts] = useState(null);
    useEffect(() => {
        let live = true;
        api.get("/stats")
            .then((d) => live && setCounts(d.data.counts))
            .catch(() => {});
        return () => {
            live = false;
        };
    }, [location.pathname, location.search]);
    return counts;
}

export function SidebarContent({ collapsed = false, onNavigate }) {
    const counts = useCounts();
    const { openAssistant } = useUI();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const activeCategory = params.get("category") || (location.pathname === "/mail" ? "all" : null);

    const c = (key) => (counts ? counts[key] ?? 0 : "");

    const groups = [
        {
            label: "Workspace",
            items: [
                { to: "/", exact: true, icon: LayoutDashboard, label: "Overview", testId: "nav-overview" },
                { to: "/mail?category=all", icon: Inbox, label: "All Emails", count: c("all"), testId: "nav-all-emails", active: activeCategory === "all" },
                { to: "/mail?category=assistant", icon: CornerUpLeft, label: "Assistant to Reply", count: c("assistant"), testId: "nav-assistant-reply", active: activeCategory === "assistant" },
                { to: "/mail?category=client", icon: UserCheck, label: "Client to Reply", count: c("client"), testId: "nav-client-reply", active: activeCategory === "client" },
                { to: "/mail?category=no_reply", icon: CheckCircle2, label: "No Reply Needed", count: c("no_reply"), testId: "nav-no-reply", active: activeCategory === "no_reply" },
            ],
        },
        {
            label: "Management",
            items: [
                { to: "/mail?category=action", icon: AlertCircle, label: "Action Required", count: c("action"), tone: "text-red-500", testId: "nav-action-required", active: activeCategory === "action" },
                { to: "/mail?category=waiting", icon: Clock, label: "Waiting for Response", count: c("waiting"), testId: "nav-waiting", active: activeCategory === "waiting" },
                { to: "/mail?category=important", icon: Star, label: "Important", count: c("important"), tone: "text-amber-500", testId: "nav-important", active: activeCategory === "important" },
                { to: "/mail?category=meetings", icon: Calendar, label: "Meetings & Appointments", count: c("meetings"), testId: "nav-meetings", active: activeCategory === "meetings" },
                { to: "/mail?category=archived", icon: Archive, label: "Archived", count: c("archived"), testId: "nav-archived", active: activeCategory === "archived" },
            ],
        },
    ];

    return (
        <div className="flex h-full flex-col" data-testid="sidebar">
            <div className={cn("flex items-center pt-5 pb-2", collapsed ? "justify-center px-2" : "px-5")}>
                <NavLink to="/" data-testid="sidebar-logo" onClick={onNavigate}>
                    {collapsed ? <Logo showWord={false} size={34} /> : <Logo size={34} light subtitle="northwindstudio.com" />}
                </NavLink>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-slim px-3 pb-4">
                {groups.map((group) => (
                    <div key={group.label}>
                        {!collapsed && <div className="sidebar-group-label">{group.label}</div>}
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.label}
                                    data-testid={item.testId}
                                    to={item.to}
                                    end={item.exact}
                                    onClick={onNavigate}
                                    className={({ isActive }) =>
                                        cn("sidebar-link", (item.active || (isActive && !item.to.includes("?"))) && "active",
                                            collapsed && "justify-center px-0")
                                    }
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon size={17} strokeWidth={2} className="shrink-0" />
                                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                                    {!collapsed && item.count !== "" && item.count !== 0 && item.count !== undefined && (
                                        <span className="font-mono-num text-[11px] font-semibold text-slate-400 bg-slate-500/10 rounded-full px-2 py-0.5">
                                            {item.count}
                                        </span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-0.5 border-t border-slate-500/10 px-3 py-3">
                <button
                    data-testid="nav-ai-assistant"
                    onClick={() => {
                        openAssistant();
                        onNavigate?.();
                    }}
                    className={cn("sidebar-link w-full text-left", collapsed && "justify-center px-0")}
                >
                    <Sparkles size={17} className="text-brand" />
                    {!collapsed && <span className="flex-1">AI Assistant</span>}
                    {!collapsed && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-brand-fg">Pilot</span>
                    )}
                </button>
                <NavLink data-testid="nav-accounts" to="/settings?tab=accounts" onClick={onNavigate}
                    className={({ isActive }) => cn("sidebar-link", isActive && "active", collapsed && "justify-center px-0")}>
                    <Link2 size={17} />
                    {!collapsed && <span className="flex-1">Connected Accounts</span>}
                </NavLink>
                <NavLink data-testid="nav-settings" to="/settings" onClick={onNavigate}
                    className={({ isActive }) => cn("sidebar-link", isActive && !location.search.includes("tab=accounts") && "active", collapsed && "justify-center px-0")}>
                    <Settings size={17} />
                    {!collapsed && <span className="flex-1">Settings</span>}
                </NavLink>
                <NavLink data-testid="nav-profile" to="/settings?tab=profile" onClick={onNavigate}
                    className={({ isActive }) => cn("sidebar-link", isActive && "active", collapsed && "justify-center px-0")}>
                    <CircleUser size={17} />
                    {!collapsed && (
                        <span className="flex-1 truncate">
                            {user?.name?.split(" ")[0] || "Profile"}
                            <span className="block text-[11px] font-normal text-slate-500 -mt-0.5">User Profile</span>
                        </span>
                    )}
                </NavLink>
            </div>
        </div>
    );
}

export default function Sidebar({ collapsed, onToggle }) {
    return (
        <aside
            className={cn(
                "sidebar-shell hidden md:flex flex-col fixed inset-y-0 left-0 z-30 transition-[width] duration-200",
                collapsed ? "w-[76px]" : "w-[264px]",
            )}
            data-testid="assistant-sidebar"
        >
            <SidebarContent collapsed={collapsed} />
            <button
                data-testid="sidebar-collapse-btn"
                onClick={onToggle}
                className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md hover:text-ink-900 transition-colors"
            >
                {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
            </button>
        </aside>
    );
}

export { useCounts };
