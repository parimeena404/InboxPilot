import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Star,
  Paperclip,
  Archive,
  MailOpen,
  MoreHorizontal,
  Sparkles,
  Send,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  Tag,
  ChevronDown,
  CheckCircle2,
  Clock,
  ShieldAlert,
  HelpCircle,
  FileText,
  User,
  ArrowRight,
  Info,
} from 'lucide-react';
import useStore from '@/store/useStore';
import type { Conversation, Classification } from '@/types';
import {
  Badge,
  SearchInput,
  Avatar,
  SegmentedControl,
  EmptyState,
  DropdownMenu,
  ConfirmDialog,
  Button,
} from '@/components/ui';

// ───────────────────────── helpers ──────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function preview(body: string, len = 65): string {
  const stripped = body.replace(/\n/g, ' ').trim();
  return stripped.length > len ? stripped.slice(0, len) + '…' : stripped;
}

const priorityDot: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: '',
};

const TONES = ['Professional', 'Friendly', 'Concise'] as const;

const mockReplies: Record<string, string> = {
  Professional:
    'Thank you for your message. I have reviewed the details and will follow up with the necessary information shortly. Please let me know if you require anything further in the meantime.',
  Friendly:
    "Hey! Thanks for reaching out — I've had a look at everything and it all looks great. I'll get back to you with more details soon. Let me know if there's anything else I can help with!",
  Concise:
    'Acknowledged. Will review and respond with next steps by end of day.',
};

// ───────────────────────── sort / filter maps ──────────────────────────

type Tab = 'all' | 'unread' | 'important' | 'action';
type SortBy = 'newest' | 'oldest' | 'priority';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priority', label: 'Priority' },
];

const CLASSIFICATION_FILTER: { value: string; label: string }[] = [
  { value: 'all', label: 'All Classifications' },
  { value: 'assistant', label: 'Assistant to Reply' },
  { value: 'client', label: 'Client to Reply' },
  { value: 'noreply', label: 'No Reply Needed' },
  { value: 'review', label: 'Needs Review' },
];

const priorityWeight: Record<string, number> = { high: 0, medium: 1, low: 2 };

function mapUrlFilter(f: string | null): { tab?: Tab; classification?: string } {
  if (!f) return {};
  switch (f) {
    case 'important':
      return { tab: 'important' };
    case 'action':
      return { tab: 'action' };
    case 'assistant':
    case 'client':
    case 'noreply':
    case 'review':
      return { classification: f };
    case 'archived':
      return {};
    default:
      return {};
  }
}

// ───────────────────────── Component ──────────────────────────

const Inbox: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlFilter = searchParams.get('filter');
  const mapped = useMemo(() => mapUrlFilter(urlFilter), [urlFilter]);

  // Store
  const conversations = useStore((s) => s.conversations);
  const selectedConversationId = useStore((s) => s.selectedConversationId);
  const selectConversation = useStore((s) => s.selectConversation);
  const toggleStar = useStore((s) => s.toggleStar);
  const archiveConversation = useStore((s) => s.archiveConversation);
  const markAsRead = useStore((s) => s.markAsRead);
  const markAsUnread = useStore((s) => s.markAsUnread);
  const reclassify = useStore((s) => s.reclassify);
  const showToastMessage = useStore((s) => s.showToastMessage);
  const addReplyMessage = useStore((s) => s.addReplyMessage);
  const storeSearchQuery = useStore((s) => s.searchQuery);
  const setStoreSearchQuery = useStore((s) => s.setSearchQuery);
  const user = useStore((s) => s.user);

  // Local state
  const [activeTab, setActiveTab] = useState<Tab>(mapped.tab ?? 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [classificationFilter, setClassificationFilter] = useState(
    mapped.classification ?? 'all',
  );
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [showDecisionTrail, setShowDecisionTrail] = useState(true);

  // Sync with URL query parameter changes
  useEffect(() => {
    if (!urlFilter) {
      setActiveTab('all');
      setClassificationFilter('all');
    } else if (urlFilter === 'important' || urlFilter === 'action' || urlFilter === 'unread') {
      setActiveTab(urlFilter as Tab);
      setClassificationFilter('all');
    } else if (urlFilter === 'assistant' || urlFilter === 'client' || urlFilter === 'noreply' || urlFilter === 'review') {
      setActiveTab('all');
      setClassificationFilter(urlFilter);
    } else if (urlFilter === 'waiting') {
      setActiveTab('action');
      setClassificationFilter('assistant');
    } else if (urlFilter === 'completed') {
      setActiveTab('all');
      setClassificationFilter('noreply');
    }
  }, [urlFilter]);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [tone, setTone] = useState<(typeof TONES)[number]>('Professional');

  // ── derived data ──

  const filtered = useMemo(() => {
    let list = conversations.filter((c) => {
      if (urlFilter === 'archived') return c.isArchived;
      if (urlFilter === 'completed') return !c.isArchived && !c.aiInsights.requiresResponse;
      return !c.isArchived;
    });

    // tab filter
    if (activeTab === 'unread') {
      list = list.filter((c) => c.messages.some((m) => !m.isRead));
    } else if (activeTab === 'important') {
      list = list.filter((c) => c.isStarred);
    } else if (activeTab === 'action') {
      list = list.filter((c) => c.aiInsights.requiresResponse);
    }

    // classification
    if (classificationFilter !== 'all') {
      list = list.filter((c) => c.classification === classificationFilter);
    }

    // search
    const q = (searchQuery || storeSearchQuery).toLowerCase().trim();
    if (q) {
      list = list.filter(
        (c) =>
          c.subject.toLowerCase().includes(q) ||
          c.labels?.some((l) => l.toLowerCase().includes(q)) ||
          c.messages.some(
            (m) =>
              m.from.name.toLowerCase().includes(q) ||
              m.from.email.toLowerCase().includes(q) ||
              m.body.toLowerCase().includes(q),
          ),
      );
    }

    // sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'newest')
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      if (sortBy === 'oldest')
        return new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime();
      return (priorityWeight[a.priority] ?? 2) - (priorityWeight[b.priority] ?? 2);
    });

    return list;
  }, [conversations, activeTab, classificationFilter, searchQuery, storeSearchQuery, sortBy, urlFilter]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const tabOptions = useMemo(
    () => [
      { value: 'all', label: 'All', count: conversations.filter((c) => !c.isArchived).length },
      {
        value: 'unread',
        label: 'Unread',
        count: conversations.filter(
          (c) => !c.isArchived && c.messages.some((m) => !m.isRead),
        ).length,
      },
      {
        value: 'important',
        label: 'Important',
        count: conversations.filter((c) => !c.isArchived && c.isStarred).length,
      },
      {
        value: 'action',
        label: 'Needs Action',
        count: conversations.filter(
          (c) => !c.isArchived && c.aiInsights.requiresResponse,
        ).length,
      },
    ],
    [conversations],
  );

  // ── callbacks ──

  const handleSelect = useCallback(
    (id: string) => {
      selectConversation(id);
      const conv = conversations.find((c) => c.id === id);
      if (conv && conv.messages.some((m) => !m.isRead)) {
        markAsRead(id);
      }
    },
    [selectConversation, markAsRead, conversations],
  );

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  }, [filtered, selectedIds.size]);

  const bulkArchive = useCallback(() => {
    selectedIds.forEach((id) => archiveConversation(id));
    showToastMessage(`${selectedIds.size} conversations archived`, 'success');
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [selectedIds, archiveConversation, showToastMessage]);

  const bulkMarkRead = useCallback(() => {
    selectedIds.forEach((id) => markAsRead(id));
    showToastMessage(`${selectedIds.size} conversations marked read`, 'success');
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [selectedIds, markAsRead, showToastMessage]);

  const handleSend = useCallback(() => {
    if (!replyText.trim() || !selectedConversation) return;
    addReplyMessage(selectedConversation.id, replyText);
    showToastMessage('Reply sent (simulated)', 'success');
    setReplyText('');
  }, [replyText, selectedConversation, addReplyMessage, showToastMessage]);

  const handleAiSuggest = useCallback(() => {
    if (!selectedConversation) return;
    let reply = mockReplies[tone];
    if (tone === 'Professional') {
      reply = `Thank you for following up regarding "${selectedConversation.subject}". On behalf of ${selectedConversation.clientName || 'David Sterling'}, I have reviewed the details and will coordinate the requested actions shortly. Please let me know if you need anything further.\n\nBest regards,\nAlex Morgan`;
    } else if (tone === 'Friendly') {
      reply = `Hi! Thanks so much for reaching out about "${selectedConversation.subject}". Everything looks great on our end, and I'll get back to you with next steps soon!\n\nWarm regards,\nAlex`;
    } else {
      reply = `Acknowledged regarding "${selectedConversation.subject}". Reviewed and confirmed on our end. Will follow up by end of day.`;
    }
    setReplyText(reply);
  }, [tone, selectedConversation]);

  function confidenceColor(v: number) {
    if (v >= 0.85) return 'bg-emerald-500';
    if (v >= 0.7) return 'bg-amber-400';
    return 'bg-red-400';
  }

  // Generate decision trail evidence
  const decisionTrail = useMemo(() => {
    if (!selectedConversation) return null;
    const insights = selectedConversation.aiInsights;
    const isClient = selectedConversation.classification === 'client';
    const isAssistant = selectedConversation.classification === 'assistant';

    return {
      intent: isClient
        ? 'Executive Sign-Off & Capital Decision'
        : isAssistant
        ? 'Operational Scheduling & Information Dispatch'
        : selectedConversation.classification === 'noreply'
        ? 'Informational Receipt / Automated Notification'
        : 'Ambiguous Intent - Requires Human Discretion',
      signals: [
        `High semantic relevance to ${isClient ? 'financial/governance policy' : 'administrative scheduling'}`,
        `Direct recipient authority matches ${isClient ? 'David Sterling (Executive)' : 'Alex Morgan (Assistant)'}`,
        `Urgency score evaluated at ${Math.round(insights.confidence * 100)}% threshold`,
      ],
      keyPhrases: [
        `"${selectedConversation.subject}"`,
        `"${insights.suggestedAction}"`,
      ],
      personalDecisionRequired: isClient,
      suggestedAction: insights.suggestedAction,
      confidence: insights.confidence,
      originalClassification: selectedConversation.classification,
      humanAuditStatus: 'Automated AI classification verified by rule set v2.4',
    };
  }, [selectedConversation]);

  return (
    <div className="flex h-full overflow-hidden bg-canvas">
      {/* ────── Email List Panel ────── */}
      <div
        className={`flex flex-col border-r border-border bg-white ${
          selectedConversation ? 'w-[52%]' : 'w-full'
        } transition-all duration-200`}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-2.5 p-3.5 border-b border-border bg-white">
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <SegmentedControl
              options={tabOptions}
              value={activeTab}
              onChange={(v) => setActiveTab(v as Tab)}
            />
          </div>

          <div className="flex items-center gap-2">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Filter current view…"
              className="flex-1 max-w-xs text-xs"
            />

            {/* Sort */}
            <DropdownMenu
              trigger={
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs py-1.5">
                  <ArrowUpDown className="w-3 h-3 text-txt-secondary" />
                  {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                  <ChevronDown className="w-2.5 h-2.5 text-txt-secondary" />
                </Button>
              }
              items={SORT_OPTIONS.map((s) => ({
                label: s.label,
                onClick: () => setSortBy(s.value),
              }))}
            />

            {/* Classification filter */}
            <DropdownMenu
              trigger={
                <Button variant="secondary" size="sm" className="gap-1.5 text-xs py-1.5">
                  <Filter className="w-3 h-3 text-txt-secondary" />
                  {CLASSIFICATION_FILTER.find((c) => c.value === classificationFilter)?.label}
                  <ChevronDown className="w-2.5 h-2.5 text-txt-secondary" />
                </Button>
              }
              items={CLASSIFICATION_FILTER.map((c) => ({
                label: c.label,
                onClick: () => setClassificationFilter(c.value),
              }))}
            />

            {/* Select mode toggle */}
            <Button
              variant={selectMode ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                setSelectMode(!selectMode);
                setSelectedIds(new Set());
              }}
              className="p-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Bulk actions bar */}
          {selectMode && selectedIds.size > 0 && (
            <motion.div
              className="flex items-center gap-2 pt-1 border-t border-border/60"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={selectAll}
                className="flex items-center gap-1.5 text-xs text-txt-secondary hover:text-txt-primary"
              >
                {selectedIds.size === filtered.length ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                {selectedIds.size === filtered.length ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-xs text-txt-secondary">
                {selectedIds.size} selected
              </span>
              <Button variant="secondary" size="sm" onClick={bulkMarkRead}>
                <MailOpen className="w-3.5 h-3.5" />
                Mark read
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmArchive(true)}>
                <Archive className="w-3.5 h-3.5" />
                Archive
              </Button>
            </motion.div>
          )}
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No conversations found"
              description="Try adjusting your search or filter criteria."
            />
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((conv) => (
                <EmailRow
                  key={conv.id}
                  conv={conv}
                  isSelected={conv.id === selectedConversationId}
                  selectMode={selectMode}
                  isChecked={selectedIds.has(conv.id)}
                  onToggleCheck={() => toggleSelected(conv.id)}
                  onClick={() => handleSelect(conv.id)}
                  onToggleStar={() => toggleStar(conv.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ────── Conversation Detail & AI Decision Trail Panel ────── */}
      <AnimatePresence mode="wait">
        {selectedConversation ? (
          <motion.div
            key={selectedConversation.id}
            className="w-[48%] flex flex-col bg-canvas overflow-hidden border-l border-border"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Preview Header */}
            <div className="flex items-start justify-between gap-3 p-4 bg-white border-b border-border shadow-xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={selectedConversation.classification}>
                    {selectedConversation.classification}
                  </Badge>
                  {selectedConversation.priority !== 'low' && (
                    <span
                      className={`w-2 h-2 rounded-full ${priorityDot[selectedConversation.priority]}`}
                      title={`${selectedConversation.priority} priority`}
                    />
                  )}
                  <span className="text-[11px] text-txt-secondary">
                    {selectedConversation.messages.length} message{selectedConversation.messages.length !== 1 && 's'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-txt-primary truncate">
                  {selectedConversation.subject}
                </h2>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleStar(selectedConversation.id)}
                  className="p-1.5 rounded-lg hover:bg-canvas transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      selectedConversation.isStarred
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-txt-secondary/60'
                    }`}
                  />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    archiveConversation(selectedConversation.id);
                    showToastMessage('Conversation archived', 'success');
                  }}
                  className="p-1.5"
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <DropdownMenu
                  trigger={
                    <button className="p-1.5 rounded-lg hover:bg-canvas transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-txt-secondary" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Mark unread',
                      icon: Mail,
                      onClick: () => markAsUnread(selectedConversation.id),
                    },
                    {
                      label: 'Reclassify as Assistant',
                      icon: Tag,
                      onClick: () => reclassify(selectedConversation.id, 'assistant'),
                    },
                    {
                      label: 'Reclassify as Client',
                      icon: Tag,
                      onClick: () => reclassify(selectedConversation.id, 'client'),
                    },
                    {
                      label: 'Reclassify as Review',
                      icon: Tag,
                      onClick: () => reclassify(selectedConversation.id, 'review'),
                    },
                    {
                      label: 'Reclassify as No Reply',
                      icon: Tag,
                      onClick: () => reclassify(selectedConversation.id, 'noreply'),
                    },
                  ]}
                />
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ── AI DECISION TRAIL COMPONENT ── */}
              <div className="card p-4 border-l-3 border-l-accent bg-white shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-txt-primary uppercase tracking-wider">
                      AI Decision Trail & Reasoning
                    </span>
                  </div>
                  <button
                    onClick={() => setShowDecisionTrail(!showDecisionTrail)}
                    className="text-[11px] text-accent font-semibold hover:underline"
                  >
                    {showDecisionTrail ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {showDecisionTrail && decisionTrail && (
                  <div className="space-y-3 pt-1 text-xs">
                    {/* Visual Step-by-Step Reasoner */}
                    <div className="space-y-2 border-l-2 border-accent/20 ml-2 pl-3">
                      <div className="relative">
                        <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-white" />
                        <p className="text-[11px] font-semibold text-txt-secondary uppercase">Detected Intent</p>
                        <p className="font-semibold text-txt-primary mt-0.5">{decisionTrail.intent}</p>
                      </div>

                      <div className="relative pt-1">
                        <span className="absolute -left-[19px] top-2 w-2.5 h-2.5 rounded-full bg-accent/60 ring-2 ring-white" />
                        <p className="text-[11px] font-semibold text-txt-secondary uppercase">Contextual Signals & AI Reasoning</p>
                        <p className="text-txt-primary mt-0.5">{selectedConversation.aiInsights.reasoning}</p>
                        <ul className="mt-1 space-y-0.5 text-txt-secondary">
                          {decisionTrail.signals.map((sig, i) => (
                            <li key={i}>• {sig}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="relative pt-1">
                        <span className="absolute -left-[19px] top-2 w-2.5 h-2.5 rounded-full bg-accent/40 ring-2 ring-white" />
                        <p className="text-[11px] font-semibold text-txt-secondary uppercase">Suggested Action</p>
                        <p className="text-txt-primary mt-0.5 font-medium">
                          {selectedConversation.aiInsights.suggestedAction}
                        </p>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="bg-canvas p-2.5 rounded-lg border border-border/60">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-medium text-txt-secondary">
                          Classification Confidence (<Badge variant={selectedConversation.aiInsights.classification} />)
                        </span>
                        <span className="font-bold text-txt-primary">
                          {Math.round(selectedConversation.aiInsights.confidence * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${confidenceColor(selectedConversation.aiInsights.confidence)}`}
                          style={{ width: `${selectedConversation.aiInsights.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Reclassification Toolbar */}
                    <div className="pt-2 border-t border-border/60">
                      <p className="text-[10px] font-bold text-txt-secondary uppercase tracking-wider mb-1.5">
                        Human Verification Override:
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(['assistant', 'client', 'noreply', 'review'] as Classification[]).map((cls) => (
                          <button
                            key={cls}
                            onClick={() => {
                              reclassify(selectedConversation.id, cls);
                              showToastMessage(`Reclassified as ${cls}`, 'success');
                            }}
                            className={`text-[11px] px-2 py-0.5 rounded border transition-all ${
                              selectedConversation.classification === cls
                                ? 'border-accent bg-accent/10 font-bold text-accent'
                                : 'border-border bg-white text-txt-secondary hover:text-txt-primary'
                            }`}
                          >
                            <Badge variant={cls} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Thread */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider px-1">
                  Thread History
                </p>
                {selectedConversation.messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-canvas/80'
                    } border border-border shadow-xs`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Avatar name={msg.from.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[13px] font-semibold text-txt-primary">
                          {msg.from.name}
                        </span>
                        <span className="text-[11px] text-txt-secondary ml-2">
                          {timeAgo(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] text-txt-primary whitespace-pre-line leading-relaxed">
                      {msg.body}
                    </p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs text-txt-secondary bg-canvas p-1.5 rounded-lg border border-border/50">
                        <Paperclip className="w-3.5 h-3.5" />
                        {msg.attachments.map((a) => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Composer */}
            <div className="border-t border-border bg-white p-3.5 shadow-panel">
              {selectedConversation.clientName && (
                <p className="text-[11px] text-txt-secondary mb-1.5">
                  Drafting response for <span className="font-semibold text-txt-primary">{selectedConversation.clientName}</span>
                </p>
              )}
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Draft simulated response…"
                rows={3}
                className="w-full resize-none rounded-xl border border-border p-3 text-xs text-txt-primary placeholder-txt-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
              <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-2 py-0.5 text-[11px] rounded-md border transition-all ${
                        tone === t
                          ? 'border-accent bg-accent/10 text-accent font-semibold'
                          : 'border-border text-txt-secondary hover:bg-canvas'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    onClick={handleAiSuggest}
                    className="ml-1 text-[11px] font-medium text-accent hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Auto-Draft
                  </button>
                </div>

                <Button variant="primary" size="sm" onClick={handleSend} className="text-xs py-1.5 px-3">
                  <Send className="w-3 h-3" />
                  Send Simulated Reply
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="hidden lg:flex w-[48%] items-center justify-center bg-canvas">
            <EmptyState
              icon={Mail}
              title="Select an email conversation"
              description="Review threads, inspect AI classification reasoning, or draft replies."
            />
          </div>
        )}
      </AnimatePresence>

      {/* Bulk archive confirm */}
      <ConfirmDialog
        isOpen={confirmArchive}
        onClose={() => setConfirmArchive(false)}
        onConfirm={bulkArchive}
        title="Archive conversations?"
        message={`Are you sure you want to archive ${selectedIds.size} conversation${
          selectedIds.size !== 1 ? 's' : ''
        }?`}
        confirmLabel="Archive"
      />
    </div>
  );
};

// ───────────────────────── Email Row ──────────────────────────

interface EmailRowProps {
  conv: Conversation;
  isSelected: boolean;
  selectMode: boolean;
  isChecked: boolean;
  onToggleCheck: () => void;
  onClick: () => void;
  onToggleStar: () => void;
}

const EmailRow: React.FC<EmailRowProps> = React.memo(
  ({ conv, isSelected, selectMode, isChecked, onToggleCheck, onClick, onToggleStar }) => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    const isUnread = conv.messages.some((m) => !m.isRead);
    const hasAttachments = conv.messages.some(
      (m) => m.attachments && m.attachments.length > 0,
    );

    return (
      <div
        className={`flex items-start gap-2.5 px-3.5 py-3 cursor-pointer transition-colors group ${
          isSelected
            ? 'bg-accent/[0.06] border-l-2 border-l-accent'
            : isUnread
            ? 'bg-white hover:bg-canvas font-medium'
            : 'hover:bg-canvas/60 text-txt-secondary'
        }`}
        onClick={onClick}
      >
        {/* Checkbox / Dot */}
        {selectMode ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCheck();
            }}
            className="flex-shrink-0 mt-0.5"
          >
            {isChecked ? (
              <CheckSquare className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Square className="w-3.5 h-3.5 text-txt-secondary" />
            )}
          </button>
        ) : (
          <div className="w-2 flex-shrink-0 mt-1.5">
            {isUnread && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
          </div>
        )}

        {/* Avatar */}
        <Avatar name={lastMsg.from.name} size="sm" />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className={`text-[13px] truncate ${
                isUnread ? 'font-bold text-txt-primary' : 'font-medium text-txt-primary'
              }`}
            >
              {lastMsg.from.name}
            </span>
            <span className="text-[11px] text-txt-secondary/70 flex-shrink-0">
              {timeAgo(conv.lastActivity)}
            </span>
          </div>

          <p
            className={`text-xs truncate ${
              isUnread ? 'font-semibold text-txt-primary' : 'text-txt-primary/90'
            }`}
          >
            {conv.subject}
          </p>

          <p className="text-[11px] text-txt-secondary line-clamp-1 mt-0.5">
            {preview(lastMsg.body)}
          </p>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge variant={conv.classification} />
            {conv.priority === 'high' && (
              <span className="text-[10px] text-red-600 font-semibold bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                High
              </span>
            )}
            {hasAttachments && (
              <Paperclip className="w-3 h-3 text-txt-secondary/60" />
            )}
          </div>
        </div>

        {/* Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 flex-shrink-0 mt-0.5"
        >
          <Star
            className={`w-3.5 h-3.5 ${
              conv.isStarred ? 'fill-amber-400 text-amber-400 opacity-100' : 'text-txt-secondary/50'
            }`}
          />
        </button>
      </div>
    );
  },
);

EmailRow.displayName = 'EmailRow';

export default Inbox;
