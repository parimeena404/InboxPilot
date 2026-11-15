import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AssistantPanel from "@/components/AssistantPanel";
import { cn } from "@/lib/utils";

const TITLES = {
    "/": "Overview",
    "/mail": "All Emails",
    "/assistant": "AI Assistant",
    "/settings": "Settings",
};

export default function AssistantLayout() {
    const { user } = useAuth();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem("ip-sidebar-collapsed") === "1");

    useEffect(() => {
        localStorage.setItem("ip-sidebar-collapsed", collapsed ? "1" : "0");
    }, [collapsed]);

    if (user === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex items-center gap-3 text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-brand pulse-soft" />
                    <span className="text-sm font-medium">Loading InboxPilot…</span>
                </div>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "assistant") return <Navigate to="/client" replace />;

    const isMail = location.pathname.startsWith("/mail");
    const params = new URLSearchParams(location.search);
    const title = isMail && params.get("category")
        ? params.get("category").replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : TITLES[location.pathname] || "InboxPilot";

    return (
        <div className="min-h-screen bg-background" data-testid="assistant-layout">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
            <div className={cn("transition-[padding] duration-200", collapsed ? "md:pl-[76px]" : "md:pl-[264px]")}>
                <TopBar title={title} />
                <main className="p-4 md:p-6" data-testid="page-content">
                    <Outlet />
                </main>
            </div>
            <AssistantPanel />
        </div>
    );
}
