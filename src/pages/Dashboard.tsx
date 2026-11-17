import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  MailOpen,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  InboxIcon,
  TrendingUp,
  UserCheck,
  Calendar,
  Focus,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { useStore } from '@/store/useStore';
import type { Conversation, Classification } from '@/types';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function avatarColor(name: string): string {
  const colors = [
    '#635BDB',
    '#3B82F6',
    '#059669',
    '#D97706',
    '#7C3AED',
    '#DB2777',
    '#0891B2',
  ];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function preview(conv: Conversation): string {
  const last = conv.messages[conv.messages.length - 1];
  return last?.body?.slice(0, 75) + (last?.body?.length > 75 ? '…' : '');
}

function hasUnread(conv: Conversation): boolean {
  return conv.messages.some((m) => !m.isRead);
}

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

const classColors: Record<Classification, string> = {
  assistant: '#2563EB',
  client: '#D97706',
  noreply: '#059669',
  review: '#7C3AED',
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const conversations = useStore((s) => s.conversations);
  const selectConversation = useStore((s) => s.selectConversation);
  const reclassify = useStore((s) => s.reclassify);
  const markClientHandled = useStore((s) => s.markClientHandled);
  const showToastMessage = useStore((s) => s.showToastMessage);
  const user = useStore((s) => s.user);

  // Active (non-archived)
  const active = useMemo(
    () => conversations.filter((c) => !c.isArchived),
    [conversations],
  );

  const totalEmails = active.length;
  const unreadCount = useMemo(() => active.filter(hasUnread).length, [active]);
  const requiresAction = useMemo(
    () => active.filter((c) => c.aiInsights.requiresResponse).length,
    [active],
  );
  const waitingForResponse = useMemo(
    () => active.filter((c) => c.aiInsights.requiresResponse && c.classification === 'assistant').length,
    [active],
  );
  const clientCount = useMemo(
    () => active.filter((c) => c.classification === 'client').length,
    [active],
  );
  const assistantCount = useMemo(
    () => active.filter((c) => c.classification === 'assistant').length,
    [active],
  );

  // Priority sorted queue for command center
  const priorityQueue = useMemo(() => {
    return [...active]
      .filter((c) => c.aiInsights.requiresResponse)
      .sort((a, b) => {
        const pA = priorityOrder[a.priority] ?? 2;
        const pB = priorityOrder[b.priority] ?? 2;
        if (pA !== pB) return pA - pB;
        const uA = hasUnread(a) ? 0 : 1;
        const uB = hasUnread(b) ? 0 : 1;
        if (uA !== uB) return uA - uB;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      })
      .slice(0, 5);
  }, [active]);

  // Client pending decisions
  const clientPending = useMemo(() => {
    return active
      .filter((c) => c.classification === 'client')
      .slice(0, 3);
  }, [active]);

  // Meeting signals
  const meetingEmails = useMemo(() => {
    return active.filter(
      (c) =>
        /meet|calendar|schedule|sync|dinner|coffee/i.test(c.subject) ||
        c.messages.some((m) => /meet|calendar|schedule/i.test(m.body)),
    ).slice(0, 3);
  }, [active]);

  // Classification distribution
  const distData = useMemo(() => {
    const counts: Record<Classification, number> = {
      assistant: 0,
      client: 0,
      noreply: 0,
      review: 0,
    };
    active.forEach((c) => counts[c.classification]++);
    return [
      { name: 'Assistant to Reply', value: counts.assistant, color: classColors.assistant },
      { name: 'Client Decisions', value: counts.client, color: classColors.client },
      { name: 'No Reply Needed', value: counts.noreply, color: classColors.noreply },
      { name: 'Needs Review', value: counts.review, color: classColors.review },
    ].filter((d) => d.value > 0);
  }, [active]);

  // AI Briefing copy
  const briefingHeadline = useMemo(() => {
    if (requiresAction === 0) return 'Your inbox is completely caught up.';
    if (clientCount > 0 && assistantCount > 0) {
      return `Your inbox is under control. ${requiresAction} conversations need attention today: ${clientCount} pending client approval and ${assistantCount} ready for assistant execution.`;
    }
    if (clientCount > 0) {
      return `Attention required: ${clientCount} critical decision${clientCount > 1 ? 's are' : ' is'} awaiting client sign-off.`;
    }
    return `Operational status clear: ${assistantCount} scheduling and response task${assistantCount > 1 ? 's can' : ' can'} be resolved immediately.`;
  }, [requiresAction, clientCount, assistantCount]);

  // Recent activity feed
  const recentActivity = useMemo(() => {
    return active
      .slice(0, 5)
      .map((c) => {
        const sender = c.messages[c.messages.length - 1]?.from.name ?? 'Contact';
        return {
          id: c.id,
          title: c.subject,
          sender,
          time: c.lastActivity,
          classification: c.classification,
          priority: c.priority,
        };
      });
  }, [active]);

  function handleOpenConv(id: string) {
    selectConversation(id);
    navigate('/inbox');
  }

  function handleDelegate(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    reclassify(id, 'assistant');
    showToastMessage('Delegated to assistant workspace', 'info');
  }

  function handleApprove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    markClientHandled(id);
    showToastMessage('Marked as approved and handled', 'success');
  }

  return (
    <div className="min-h-screen p-5 md:p-8 space-y-7 max-w-7xl mx-auto">
      {/* ── TOP HEADER: AI COMMAND CENTER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-border/80"
      >
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[11px] font-semibold tracking-wide">
              <Zap className="w-3 h-3" />
              AI Command Center
            </span>
            <span className="text-xs text-txt-secondary">
              Managing desk for <span className="font-semibold text-txt-primary">David Sterling</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-txt-primary heading-serif tracking-tight">
            {getGreeting()}, {user?.name.split(' ')[0] || 'Alex'}
          </h1>
          <p className="text-sm text-txt-secondary mt-0.5">
            Here is your executive communication intelligence brief for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/focus')}
            className="gap-2 shadow-xs"
          >
            <Focus className="w-4 h-4 text-accent" />
            Launch Focus Mode
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/inbox')}
            className="gap-2"
          >
            <Mail className="w-4 h-4" />
            Open Inbox ({unreadCount} unread)
          </Button>
        </div>
      </motion.div>

      {/* ── AI DAILY EXECUTIVE BRIEFING BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="card p-6 border-l-4 border-l-accent relative overflow-hidden bg-gradient-to-r from-white via-white to-accent/[0.03]"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                AI Daily Briefing
              </span>
              <span className="text-[11px] text-txt-secondary/60">
                · Updated just now
              </span>
            </div>
            <p className="text-base md:text-lg font-medium text-txt-primary leading-relaxed">
              "{briefingHeadline}"
            </p>
            <div className="flex items-center gap-4 text-xs text-txt-secondary pt-1 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <strong>{active.filter((c) => c.priority === 'high').length}</strong> High Priority
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <strong>{clientCount}</strong> Client Decisions Needed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <strong>{assistantCount}</strong> Ready for Assistant Action
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <strong>{meetingEmails.length}</strong> Meeting Coordinates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => navigate('/focus')}
              className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-all flex items-center gap-2 shadow-accent/20 shadow-sm"
            >
              Start Focus Session
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── KEY METRIC TILES (REFINED EDITORIAL TOKENS) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Emails',
            value: totalEmails,
            sub: 'Active threads',
            link: '/inbox',
            icon: Mail,
            color: 'text-txt-primary',
            badge: '+3 today',
          },
          {
            label: 'Action Required',
            value: requiresAction,
            sub: 'Pending reply or decision',
            link: '/inbox?filter=action',
            icon: AlertCircle,
            color: 'text-red-600',
            badge: 'Needs Attention',
          },
          {
            label: 'Client Approvals',
            value: clientCount,
            sub: 'Executive sign-off required',
            link: '/client',
            icon: UserCheck,
            color: 'text-amber-600',
            badge: 'High Impact',
          },
          {
            label: 'Assistant Queue',
            value: assistantCount,
            sub: 'Replies ready to dispatch',
            link: '/inbox?filter=assistant',
            icon: Clock,
            color: 'text-blue-600',
            badge: 'Routine Ops',
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            onClick={() => navigate(m.link)}
            className="card p-5 cursor-pointer hover:border-accent/40 group transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-txt-secondary">{m.label}</span>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-txt-primary tracking-tight">
                {m.value}
              </span>
              <span className="text-[11px] text-txt-secondary/70">
                {m.sub}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN 2-COLUMN SECTION: PRIORITY ACTION QUEUE & DECISION RADAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PRIORITY ACTION QUEUE (7 of 12) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-txt-primary">Priority Inbox · Action Queue</h2>
              <p className="text-xs text-txt-secondary">High-urgency items needing immediate handling or routing</p>
            </div>
            <button
              onClick={() => navigate('/inbox')}
              className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline"
            >
              View Full Inbox <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="card overflow-hidden divide-y divide-border/70">
            {priorityQueue.map((conv) => {
              const sender = conv.messages[conv.messages.length - 1]?.from ?? conv.messages[0]?.from;
              const senderName = sender?.name ?? 'Contact';
              const unread = hasUnread(conv);

              return (
                <div
                  key={conv.id}
                  onClick={() => handleOpenConv(conv.id)}
                  className="p-4 hover:bg-canvas/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: avatarColor(senderName) }}
                      >
                        {initials(senderName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[13px] truncate ${unread ? 'font-bold text-txt-primary' : 'font-medium text-txt-primary'}`}>
                            {senderName}
                          </span>
                          <span className="text-[11px] text-txt-secondary">
                            · {formatDistanceToNow(new Date(conv.lastActivity), { addSuffix: true })}
                          </span>
                          {conv.priority === 'high' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" title="High Priority" />
                          )}
                        </div>

                        <p className={`text-[13px] truncate ${unread ? 'font-semibold text-txt-primary' : 'text-txt-primary'}`}>
                          {conv.subject}
                        </p>
                        <p className="text-xs text-txt-secondary line-clamp-1 mt-0.5">
                          {preview(conv)}
                        </p>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <Badge variant={conv.classification} />
                          <span className="text-[11px] text-accent font-medium bg-accent/[0.06] px-2 py-0.5 rounded">
                            Action: {conv.aiInsights.suggestedAction}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleOpenConv(conv.id);
                        }}
                        className="text-xs py-1 px-2.5 opacity-90 group-hover:opacity-100"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {priorityQueue.length === 0 && (
              <div className="p-8 text-center text-sm text-txt-secondary">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                No priority action items. You are caught up!
              </div>
            )}
          </div>

          {/* UPCOMING MEETINGS WIDGET */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold text-txt-primary">Scheduling Signals & Syncs</h3>
              </div>
              <button
                onClick={() => navigate('/meetings')}
                className="text-xs text-accent font-medium hover:underline"
              >
                Calendar View
              </button>
            </div>

            <div className="space-y-2.5">
              {meetingEmails.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleOpenConv(m.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-canvas/70 hover:bg-canvas transition-colors cursor-pointer border border-border/50 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-semibold text-txt-primary truncate">{m.subject}</p>
                    <p className="text-txt-secondary text-[11px] truncate mt-0.5">
                      {m.messages[0]?.from.name} · {m.aiInsights.suggestedAction}
                    </p>
                  </div>
                  <Badge variant="assistant" className="flex-shrink-0">Schedule</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLIENT DECISION RADAR & CLASSIFICATION (5 of 12) */}
        <div className="lg:col-span-5 space-y-4">
          {/* CLIENT DECISIONS RADAR */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-txt-primary">Pending Client Decisions</h2>
              <p className="text-xs text-txt-secondary">Decisions requiring executive sign-off</p>
            </div>
            <button
              onClick={() => navigate('/client')}
              className="text-xs text-amber-700 font-semibold hover:underline"
            >
              Open Client Portal
            </button>
          </div>

          <div className="card p-4 space-y-3">
            {clientPending.map((conv) => (
              <div
                key={conv.id}
                className="p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/40 hover:bg-amber-50/70 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-amber-900 truncate flex-1">
                    {conv.subject}
                  </span>
                  <span className="text-[10px] text-amber-700 font-medium whitespace-nowrap bg-amber-100/80 px-1.5 py-0.5 rounded">
                    Sign-Off Required
                  </span>
                </div>
                <p className="text-xs text-amber-800/80 line-clamp-2 mb-3">
                  {conv.aiInsights.reasoning}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/50">
                  <button
                    onClick={(e) => handleDelegate(conv.id, e)}
                    className="px-2.5 py-1 text-[11px] font-medium text-txt-secondary hover:text-txt-primary bg-white rounded-lg border border-border transition-colors"
                  >
                    Delegate to Asst
                  </button>
                  <button
                    onClick={(e) => handleApprove(conv.id, e)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Approve
                  </button>
                </div>
              </div>
            ))}

            {clientPending.length === 0 && (
              <div className="p-6 text-center text-xs text-txt-secondary">
                No decisions currently awaiting client sign-off.
              </div>
            )}
          </div>

          {/* CLASSIFICATION BREAKDOWN */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-txt-primary mb-3">Inbox Classification Intelligence</h3>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={46}
                      strokeWidth={2}
                      stroke="#FFFFFF"
                    >
                      {distData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}`, 'Emails']}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid #E9E9EC',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2 text-xs flex-1">
                {distData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-txt-secondary">{d.name}</span>
                    </div>
                    <span className="font-semibold text-txt-primary">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT AUDIT ACTIVITY */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-txt-primary mb-3">Recent Communication Feed</h3>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenConv(item.id)}
                  className="flex items-start justify-between gap-3 text-xs cursor-pointer hover:bg-canvas p-1.5 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-txt-primary truncate">{item.title}</p>
                    <p className="text-[11px] text-txt-secondary truncate mt-0.5">
                      From {item.sender}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant={item.classification} />
                    <p className="text-[10px] text-txt-secondary/60 mt-1">
                      {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
