import { Star } from "lucide-react";
import { initialsOf, tintOf, PRIORITY_META, RESPONSIBILITY_META } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Avatar({ item, size = 38, unread = false }) {
    const tint = tintOf(item);
    return (
        <div className="relative shrink-0">
            <div
                className="rounded-full flex items-center justify-center font-semibold select-none"
                style={{
                    width: size,
                    height: size,
                    background: tint.bg,
                    color: tint.fg,
                    fontSize: size * 0.36,
                }}
            >
                {initialsOf(item?.sender_name || item?.from_name || "?")}
            </div>
            {unread && (
                <span
                    data-testid="unread-dot"
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand border-2 border-white"
                />
            )}
        </div>
    );
}

export function PriorityBadge({ priority, small = false }) {
    const meta = PRIORITY_META[priority] || PRIORITY_META.normal;
    return (
        <span
            data-testid={`priority-badge-${priority}`}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-semibold",
                small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
            )}
            style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
            {meta.label}
        </span>
    );
}

export function RespBadge({ responsibility, short = false, small = false }) {
    const meta = RESPONSIBILITY_META[responsibility] || RESPONSIBILITY_META.none;
    return (
        <span
            data-testid={`resp-badge-${responsibility}`}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
                small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
            )}
            style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
        >
            {meta.short ? null : null}
            {short ? meta.short : meta.label}
        </span>
    );
}

export function KpiCard({ label, value, icon: Icon, hint, hintTone = "slate", testId, delay = 0 }) {
    const toneMap = {
        slate: "text-slate-500",
        teal: "text-brand-dark",
        amber: "text-amber-600",
        red: "text-red-600",
        sky: "text-sky-600",
    };
    return (
        <div
            data-testid={testId}
            className="card-base shadow-soft hover:shadow-lift transition-all duration-200 hover:-translate-y-0.5 p-4 flex flex-col gap-3 fade-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-500">{label}</span>
                {Icon && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Icon size={15} strokeWidth={2} />
                    </span>
                )}
            </div>
            <div className="flex items-end gap-2">
                <span className="font-mono-num text-3xl font-semibold tracking-tight text-ink-900 leading-none">{value}</span>
                {hint && (
                    <span className={cn("text-[11px] font-semibold mb-0.5", toneMap[hintTone])}>{hint}</span>
                )}
            </div>
        </div>
    );
}

export function StarToggle({ starred, onClick, testId, size = 16 }) {
    return (
        <button
            data-testid={testId}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 hover:bg-amber-50",
                starred ? "text-amber-500" : "text-slate-300 hover:text-amber-500",
            )}
            title={starred ? "Unstar" : "Star"}
        >
            <Star size={size} fill={starred ? "currentColor" : "none"} strokeWidth={2} />
        </button>
    );
}

export function SectionHeader({ title, hint, action = null }) {
    return (
        <div className="flex items-center justify-between gap-4 mb-3">
            <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-ink-900 tracking-tight">{title}</h2>
                {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
            </div>
            {action}
        </div>
    );
}

export function Empty({ icon: Icon, title, hint }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center" data-testid="empty-state">
            {Icon && (
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Icon size={22} />
                </span>
            )}
            <p className="text-sm font-semibold text-slate-600">{title}</p>
            {hint && <p className="text-xs text-slate-400 max-w-xs">{hint}</p>}
        </div>
    );
}

export function TypingDots() {
    return (
        <span className="inline-flex items-center gap-1 py-2" data-testid="typing-indicator">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-brand pulse-soft"
                    style={{ animationDelay: `${i * 180}ms` }}
                />
            ))}
        </span>
    );
}

export function AIBadge({ label = "AI generated" }) {
    return (
        <span
            data-testid="ai-generated-badge"
            className="inline-flex items-center gap-1 rounded-md bg-brand-soft border border-brand-border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-dark"
        >
            {label}
        </span>
    );
}
