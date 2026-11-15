export function LogoMark({ size = 36 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#0F172A" />
            <path d="M15 41 L32 15 L49 41" stroke="#14B8A6" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 50 H44" stroke="#F8FAFC" strokeWidth="5" strokeLinecap="round" />
        </svg>
    );
}

export default function Logo({ size = 36, light = false, showWord = true, subtitle = null }) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <LogoMark size={size} />
            {showWord && (
                <div className="min-w-0 leading-tight">
                    <div className={`font-bold tracking-tight ${light ? "text-white" : "text-ink-900"}`} style={{ fontSize: size * 0.5 }}>
                        InboxPilot
                    </div>
                    {subtitle && <div className="text-xs text-slate-400 truncate">{subtitle}</div>}
                </div>
            )}
        </div>
    );
}
