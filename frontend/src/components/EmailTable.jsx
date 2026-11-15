import { useNavigate } from "react-router-dom";
import { Archive, MoreHorizontal, CornerUpLeft, UserCheck, CheckCircle2, ArchiveRestore } from "lucide-react";
import { Avatar, PriorityBadge, RespBadge, StarToggle, Empty } from "@/components/bits";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { dayTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const RESP_OPTIONS = [
    { value: "assistant", label: "Assistant to reply", icon: CornerUpLeft },
    { value: "client", label: "Client to reply", icon: UserCheck },
    { value: "none", label: "No reply needed", icon: CheckCircle2 },
];

export default function EmailTable({ emails = [], selectedId = null, onPatch = () => {}, emptyHint }) {
    const navigate = useNavigate();

    if (!emails.length) {
        return <Empty icon={Archive} title="Nothing here" hint={emptyHint || "No conversations match this view."} />;
    }

    return (
        <div data-testid="email-table">
            <div className="hidden lg:grid grid-cols-[minmax(150px,180px)_minmax(0,1fr)_150px_92px] gap-4 border-b border-slate-200/80 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                <span>Sender</span>
                <span>Conversation</span>
                <span>Classification</span>
                <span className="text-right">Received</span>
            </div>

            <div className="divide-y divide-slate-100">
                {emails.map((em, i) => {
                    const selected = selectedId === em.id;
                    return (
                        <div
                            key={em.id}
                            data-testid={`email-row-${em.id}`}
                            onClick={() => navigate(`/mail/${em.id}`)}
                            style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                            className={cn(
                                "group relative grid grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(150px,180px)_minmax(0,1fr)_150px_92px] items-center gap-3 lg:gap-4 px-4 py-3 cursor-pointer transition-colors duration-150 fade-up",
                                selected ? "bg-brand-soft/70" : "hover:bg-slate-50",
                                em.unread && "bg-brand-soft/30",
                            )}
                        >
                            {em.unread && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-r-full bg-brand" />
                            )}

                            <div className="hidden lg:flex items-center gap-2.5 min-w-0">
                                <Avatar item={em} unread={em.unread} />
                                <div className="min-w-0">
                                    <p className={cn("truncate text-[13px]", em.unread ? "font-bold text-ink-900" : "font-medium text-slate-700")}>
                                        {em.sender_name}
                                    </p>
                                    <p className="truncate text-[11px] text-slate-400">{em.sender_email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 min-w-0">
                                <div className="lg:hidden">
                                    <Avatar item={em} unread={em.unread} size={34} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className={cn("truncate text-sm", em.unread ? "font-bold text-ink-900" : "font-semibold text-slate-700")}>
                                            {em.subject}
                                        </p>
                                        {em.starred && <span className="shrink-0 text-amber-500">★</span>}
                                        {em.important && (
                                            <span className="shrink-0 rounded bg-rose-50 border border-rose-100 px-1 text-[9px] font-bold uppercase tracking-wide text-rose-600">
                                                Important
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-xs text-slate-400 mt-0.5">{em.preview}</p>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 lg:hidden">
                                        <RespBadge responsibility={em.responsibility} small />
                                        <PriorityBadge priority={em.priority} small />
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
                                <RespBadge responsibility={em.responsibility} short small />
                                <PriorityBadge priority={em.priority} small />
                            </div>

                            <div className="flex items-center justify-end gap-1">
                                <span className="hidden lg:block text-[11px] text-slate-400 font-mono-num whitespace-nowrap group-hover:hidden">
                                    {dayTime(em.received_at)}
                                </span>
                                <div className="hidden lg:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <StarToggle
                                        starred={em.starred}
                                        testId={`star-${em.id}`}
                                        onClick={() => onPatch(em.id, { starred: !em.starred })}
                                    />
                                    <button
                                        data-testid={`archive-${em.id}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onPatch(em.id, { archived: !em.archived });
                                        }}
                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                        title={em.archived ? "Restore" : "Archive"}
                                    >
                                        {em.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                                    </button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                data-testid={`resp-menu-${em.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                title="Change responsibility"
                                            >
                                                <MoreHorizontal size={15} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                            {RESP_OPTIONS.map((opt) => (
                                                <DropdownMenuItem
                                                    key={opt.value}
                                                    data-testid={`resp-option-${opt.value}`}
                                                    onClick={() => onPatch(em.id, { responsibility: opt.value })}
                                                    className={cn("gap-2", em.responsibility === opt.value && "bg-brand-soft text-brand-dark font-semibold")}
                                                >
                                                    <opt.icon size={14} />
                                                    {opt.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <span className="lg:hidden text-[11px] text-slate-400 font-mono-num">{dayTime(em.received_at)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
