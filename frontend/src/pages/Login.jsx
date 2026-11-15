import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Sparkles, ShieldCheck, CalendarClock, PenLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LogoMark } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FEATURES = [
    { icon: Sparkles, title: "Pilot drafts, files and flags", text: "Every conversation is classified the moment it lands — assistant, client or no reply needed." },
    { icon: ShieldCheck, title: "Only decisions reach the client", text: "A calm approval centre instead of a noisy inbox. Everything else is handled quietly." },
    { icon: CalendarClock, title: "Deadlines and meetings surfaced", text: "Commitments extracted from threads become trackable deadlines and calendar entries." },
    { icon: PenLine, title: "Replies drafted in your voice", text: "Grounded, editable drafts with one click — review, tweak, send." },
];

export default function Login() {
    const { user, login, demoLogin } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("assistant@inboxpilot.app");
    const [password, setPassword] = useState("demo1234");
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) navigate(user.role === "client" ? "/client" : "/", { replace: true });
    }, [user, navigate]);

    const doLogin = async (e) => {
        e.preventDefault();
        setBusy("form");
        setError("");
        try {
            const u = await login(email, password);
            navigate(u.role === "client" ? "/client" : "/", { replace: true });
        } catch (err) {
            setError(apiErrorMessage(err, "Sign in failed. Please try again."));
        } finally {
            setBusy("");
        }
    };

    const doDemo = async (role) => {
        setBusy(role);
        setError("");
        try {
            await demoLogin(role);
            navigate(role === "client" ? "/client" : "/", { replace: true });
        } catch (err) {
            setError(apiErrorMessage(err, "Demo login failed."));
            setBusy("");
        }
    };

    return (
        <div className="min-h-screen flex bg-background" data-testid="login-page">
            {/* Brand panel */}
            <div className="sidebar-shell relative hidden lg:flex flex-col justify-between w-[46%] max-w-[620px] p-12 text-white">
                <div className="flex items-center gap-3">
                    <LogoMark size={40} />
                    <div>
                        <p className="text-xl font-bold tracking-tight">InboxPilot</p>
                        <p className="text-xs text-slate-400">AI Email Workspace</p>
                    </div>
                </div>

                <div className="max-w-md">
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-balance">
                        The inbox that runs itself — and only bothers you when it matters.
                    </h1>
                    <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
                        InboxPilot classifies every conversation the second it arrives, drafts the replies it can,
                        and brings the decisions only a human can make.
                    </p>
                    <div className="mt-10 space-y-5">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="flex gap-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-brand">
                                    <f.icon size={18} />
                                </span>
                                <div>
                                    <p className="text-sm font-bold">{f.title}</p>
                                    <p className="text-[13px] text-slate-400 leading-relaxed">{f.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-slate-500">© 2026 InboxPilot — a demonstration workspace with sample data.</p>
            </div>

            {/* Form panel */}
            <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-[420px] fade-up" data-testid="login-card">
                    <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                        <LogoMark size={38} />
                        <p className="text-xl font-bold tracking-tight text-ink-900">InboxPilot</p>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-ink-900">Sign in</h2>
                    <p className="mt-1 text-sm text-slate-500">Enter the demo workspace with sample data.</p>

                    <div className="mt-6 space-y-2.5">
                        <Button
                            data-testid="demo-assistant-btn"
                            disabled={!!busy}
                            onClick={() => doDemo("assistant")}
                            className="w-full h-12 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-sm font-bold gap-2"
                        >
                            {busy === "assistant" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-brand" />}
                            Enter as Assistant
                        </Button>
                        <Button
                            data-testid="demo-client-btn"
                            disabled={!!busy}
                            onClick={() => doDemo("client")}
                            variant="outline"
                            className="w-full h-12 rounded-xl border-slate-300 text-sm font-bold text-ink-900 hover:bg-slate-50 gap-2"
                        >
                            {busy === "client" ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} className="text-brand-dark" />}
                            Enter as Client
                        </Button>
                    </div>

                    <div className="my-6 flex items-center gap-3">
                        <span className="h-px flex-1 bg-slate-200" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">or sign in with email</span>
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>

                    <form onSubmit={doLogin} className="space-y-3" data-testid="login-form">
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Email</label>
                            <Input
                                data-testid="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 h-11 rounded-xl"
                                placeholder="you@company.com"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500">Password</label>
                            <Input
                                data-testid="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 h-11 rounded-xl"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && (
                            <p data-testid="login-error" className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-[13px] font-medium text-red-600">
                                {error}
                            </p>
                        )}
                        <Button
                            type="submit"
                            data-testid="login-submit"
                            disabled={!!busy}
                            className="w-full h-11 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-bold"
                        >
                            {busy === "form" ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
                        </Button>
                        <p className="text-center text-[11px] text-slate-400 pt-1">
                            Demo accounts: assistant@inboxpilot.app · client@inboxpilot.app — password <span className="font-mono-num font-semibold">demo1234</span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
