import { useMemo } from 'react';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { useStore } from '@/store/useStore';
import type { Conversation, Classification } from '@/types';
import Badge from '@/components/ui/Badge';

// ── helpers ──────────────────────────────────────────────────────────

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
    '#6558E8',
    '#E85858',
    '#58A6E8',
    '#E8A858',
    '#58E89A',
    '#C758E8',
    '#E85889',
    '#58D5E8',
  ];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function preview(conv: Conversation): string {
  const last = conv.messages[conv.messages.length - 1];
  return last?.body?.slice(0, 60) + (last?.body?.length > 60 ? '…' : '');
}

function hasUnread(conv: Conversation): boolean {
  return conv.messages.some((m) => !m.isRead);
}

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

const classColors: Record<Classification, string> = {
  assistant: '#3B82F6',
  client: '#F59E0B',
  noreply: '#22C55E',
  review: '#8B5CF6',
};

// ── animation variants ──────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' },
  }),
};

// ── component ───────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const conversations = useStore((s) => s.conversations);
  const selectConversation = useStore((s) => s.selectConversation);

  // ── derived data ──────────────────────────────────────────────────

  const active = useMemo(
    () => conversations.filter((c) => !c.isArchived),
    [conversations],
  );

  const totalEmails = active.length;

  const unreadCount = useMemo(
    () => active.filter(hasUnread).length,
    [active],
  );

  const requiresAction = useMemo(
    () =>
      active.filter((c) =>
        ['assistant', 'client', 'review'].includes(c.classification),
      ).length,
    [active],
  );

  const waitingForResponse = useMemo(
    () =>
      active.filter(
        (c) =>
          c.aiInsights.requiresResponse && c.classification === 'assistant',
      ).length,
    [active],
  );

  const prioritySorted = useMemo(() => {
    return [...active]
      .sort((a, b) => {
        const pA = priorityOrder[a.priority] ?? 2;
        const pB = priorityOrder[b.priority] ?? 2;
        if (pA !== pB) return pA - pB;
        const uA = hasUnread(a) ? 0 : 1;
        const uB = hasUnread(b) ? 0 : 1;
        if (uA !== uB) return uA - uB;
        return (
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime()
        );
      })
      .slice(0, 8);
  }, [active]);

  // classification distribution
  const distData = useMemo(() => {
    const counts: Record<Classification, number> = {
      assistant: 0,
      client: 0,
      noreply: 0,
      review: 0,
    };
    active.forEach((c) => counts[c.classification]++);
    return [
      { name: 'Assistant', value: counts.assistant, color: classColors.assistant },
      { name: 'Client', value: counts.client, color: classColors.client },
      { name: 'No-Reply', value: counts.noreply, color: classColors.noreply },
      { name: 'Review', value: counts.review, color: classColors.review },
    ].filter((d) => d.value > 0);
  }, [active]);

  // AI briefing derived data
  const clientCount = useMemo(
    () => active.filter((c) => c.classification === 'client').length,
    [active],
  );
  const assistantCount = useMemo(
    () => active.filter((c) => c.classification === 'assistant').length,
    [active],
  );
  const meetingEmails = useMemo(
    () =>
      active.filter(
        (c) =>
          /meet|calendar|schedule|sync/i.test(c.subject) ||
          c.messages.some((m) => /meet|calendar|schedule/i.test(m.body)),
      ),
    [active],
  );

  const keyDevelopments = useMemo(() => {
    const highPri = active.filter((c) => c.priority === 'high');
    const bullets: string[] = [];
    if (highPri.length > 0)
      bullets.push(
        `${highPri.length} high-priority email${highPri.length > 1 ? 's' : ''} need${highPri.length === 1 ? 's' : ''} immediate attention`,
      );
    if (clientCount > 0)
      bullets.push(
        `${clientCount} email${clientCount > 1 ? 's' : ''} flagged for client decision`,
      );
    const starred = active.filter((c) => c.isStarred).length;
    if (starred > 0) bullets.push(`${starred} starred conversation${starred > 1 ? 's' : ''} in your inbox`);
    if (bullets.length === 0) bullets.push('Your inbox is looking manageable today');
    return bullets.slice(0, 3);
  }, [active, clientCount]);

  const recommendedAction = useMemo(() => {
    const first = prioritySorted[0];
    if (!first) return "You're all caught up!";
    if (first.priority === 'high')
      return `Start with "${first.subject}" — it's high priority and ${hasUnread(first) ? 'unread' : 'needs a reply'}.`;
    return `Review your ${unreadCount} unread email${unreadCount !== 1 ? 's' : ''} first, then tackle action items.`;
  }, [prioritySorted, unreadCount]);

  // recent activity from conversations
  const recentActivity = useMemo(() => {
    type Activity = {
      id: string;
      icon: typeof Mail;
      text: string;
      time: string;
      badge?: Classification;
    };
    const items: Activity[] = [];

    // latest 4 classified
    [...active]
      .sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime(),
      )
      .slice(0, 4)
      .forEach((c) => {
        const sender = c.messages[c.messages.length - 1]?.from.name ?? 'Unknown';
        items.push({
          id: `class-${c.id}`,
          icon: InboxIcon,
          text: `Email classified as`,
          time: c.lastActivity,
          badge: c.classification,
        });
        items.push({
          id: `new-${c.id}`,
          icon: Mail,
          text: `New email from ${sender}`,
          time: c.lastActivity,
        });
      });

    // add an "account synced" event
    items.push({
      id: 'sync',
      icon: RefreshCw,
      text: 'Account synced successfully',
      time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    });

    // dedupe & limit
    return items.slice(0, 6);
  }, [active]);

  // ── handlers ──────────────────────────────────────────────────────

  function handleSelectConversation(id: string) {
    selectConversation(id);
    navigate('/inbox');
  }

  // ── metric cards config ───────────────────────────────────────────

  const metrics = [
    {
      label: 'Total Emails',
      value: totalEmails,
      delta: '+3 from yesterday',
      Icon: Mail,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      link: '/inbox',
    },
    {
      label: 'Unread',
      value: unreadCount,
      delta: '+5 from yesterday',
      Icon: MailOpen,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      link: '/inbox?filter=unread',
    },
    {
      label: 'Requires Action',
      value: requiresAction,
      delta: '+2 from yesterday',
      Icon: AlertCircle,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      link: '/inbox?filter=action',
    },
    {
      label: 'Waiting for Response',
      value: waitingForResponse,
      delta: '+1 from yesterday',
      Icon: Clock,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
      link: '/inbox?filter=waiting',
    },
  ];

  // ── render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8" style={{ backgroundColor: '#F7F8FC' }}>
      {/* ── Welcome ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#20243A' }}>
          {getGreeting()}, Alex
        </h1>
        <p className="mt-1" style={{ color: '#777D91' }}>
          Here's what needs your attention today
        </p>
      </motion.div>

      {/* ── Metric Cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            onClick={() => navigate(m.link)}
            className="relative rounded-xl p-5 shadow-sm cursor-pointer hover:border-[#6558E8]/40 hover:shadow-md transition-all"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E9EAF1' }}
          >
            <div className={`absolute top-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center ${m.iconBg}`}>
              <m.Icon className={`w-5 h-5 ${m.iconColor}`} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#20243A' }}>
              {m.value}
            </p>
            <p className="text-sm mt-1" style={{ color: '#777D91' }}>
              {m.label}
            </p>
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#22C55E' }}>
              <TrendingUp className="w-3 h-3" />
              {m.delta}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Two-Column: Priority Inbox + AI Briefing ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT — Priority Inbox (3/5 = 60%) */}
        <motion.div
          className="lg:col-span-3 rounded-xl shadow-sm"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E9EAF1' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #E9EAF1' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#20243A' }}>
              Priority Inbox
            </h2>
            <button
              onClick={() => navigate('/inbox')}
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: '#6558E8' }}
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ul className="divide-y" style={{ borderColor: '#E9EAF1' }}>
            {prioritySorted.map((conv) => {
              const sender =
                conv.messages[conv.messages.length - 1]?.from ??
                conv.messages[0]?.from;
              const senderName = sender?.name ?? 'Unknown';
              const unread = hasUnread(conv);

              return (
                <li
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className="flex items-start gap-3 px-6 py-3.5 cursor-pointer transition-colors hover:bg-gray-50/60"
                >
                  {/* avatar */}
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ backgroundColor: avatarColor(senderName) }}
                  >
                    {initials(senderName)}
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm truncate ${unread ? 'font-semibold' : 'font-medium'}`}
                        style={{ color: '#20243A' }}
                      >
                        {senderName}
                      </span>

                      {/* priority dot */}
                      {conv.priority === 'high' && (
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      )}
                      {conv.priority === 'medium' && (
                        <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                      )}
                    </div>

                    <p
                      className={`text-sm truncate ${unread ? 'font-semibold' : ''}`}
                      style={{ color: '#20243A' }}
                    >
                      {conv.subject}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: '#777D91' }}>
                      {preview(conv)}
                    </p>
                  </div>

                  {/* right side */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[11px] whitespace-nowrap" style={{ color: '#777D91' }}>
                      {formatDistanceToNow(new Date(conv.lastActivity), { addSuffix: true })}
                    </span>
                    <Badge variant={conv.classification}>
                      {conv.classification}
                    </Badge>
                  </div>
                </li>
              );
            })}

            {prioritySorted.length === 0 && (
              <li className="px-6 py-10 text-center text-sm" style={{ color: '#777D91' }}>
                No conversations yet
              </li>
            )}
          </ul>
        </motion.div>

        {/* RIGHT — AI Daily Briefing (2/5 = 40%) */}
        <motion.div
          className="lg:col-span-2 rounded-xl shadow-sm"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E9EAF1' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid #E9EAF1' }}>
            <Sparkles className="w-5 h-5" style={{ color: '#6558E8' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#20243A' }}>
              AI Daily Briefing
            </h2>
          </div>

          <div className="px-6 py-4 space-y-5 text-sm" style={{ color: '#20243A' }}>
            {/* Key Developments */}
            <div>
              <h3 className="font-semibold mb-1.5">Key Developments</h3>
              <ul className="space-y-1 list-disc list-inside" style={{ color: '#777D91' }}>
                {keyDevelopments.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ backgroundColor: '#FFF3DE' }}>
                <p className="text-lg font-bold" style={{ color: '#D97706' }}>
                  {clientCount}
                </p>
                <p className="text-xs" style={{ color: '#92400E' }}>
                  Needs Client Attention
                </p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#E9F1FF' }}>
                <p className="text-lg font-bold" style={{ color: '#3B82F6' }}>
                  {assistantCount}
                </p>
                <p className="text-xs" style={{ color: '#1E40AF' }}>
                  Pending Replies
                </p>
              </div>
            </div>

            {/* Upcoming */}
            <div>
              <h3 className="font-semibold mb-1">Upcoming</h3>
              <p className="text-xs" style={{ color: '#777D91' }}>
                {meetingEmails.length > 0
                  ? `${meetingEmails.length} meeting-related email${meetingEmails.length > 1 ? 's' : ''}: ${meetingEmails.slice(0, 2).map((m) => `"${m.subject}"`).join(', ')}`
                  : 'No upcoming meetings detected'}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="rounded-lg p-3" style={{ backgroundColor: '#F2EAFE' }}>
              <h3 className="font-semibold text-xs mb-1" style={{ color: '#6558E8' }}>
                Recommended Action
              </h3>
              <p className="text-xs" style={{ color: '#4C1D95' }}>
                {recommendedAction}
              </p>
            </div>

            {/* Classification Chart */}
            {distData.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Classification Breakdown</h3>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={22}
                          outerRadius={38}
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
                            border: '1px solid #E9EAF1',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs" style={{ color: '#777D91' }}>
                    {distData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: d.color }}
                        />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Recent Activity ─────────────────────────────── */}
      <motion.div
        className="rounded-xl shadow-sm"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E9EAF1' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #E9EAF1' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#20243A' }}>
            Recent Activity
          </h2>
        </div>

        <ul className="divide-y" style={{ borderColor: '#E9EAF1' }}>
          {recentActivity.map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <motion.li
                key={item.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex items-center gap-4 px-6 py-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#F7F8FC' }}
                >
                  <ItemIcon className="w-4 h-4" style={{ color: '#6558E8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: '#20243A' }}>
                    {item.text}
                    {item.badge && (
                      <span className="ml-1.5 inline-block">
                        <Badge variant={item.badge}>{item.badge}</Badge>
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: '#777D91' }}>
                  {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                </span>
              </motion.li>
            );
          })}

          {recentActivity.length === 0 && (
            <li className="px-6 py-8 text-center text-sm" style={{ color: '#777D91' }}>
              No recent activity
            </li>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
