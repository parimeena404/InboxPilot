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

function preview(body: string, len = 50): string {
  const stripped = body.replace(/\n/g, ' ').trim();
  return stripped.length > len ? stripped.slice(0, len) + '…' : stripped;
}

const priorityDot: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
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
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'priority', label: 'Priority' },
];

const CLASSIFICATION_FILTER: { value: string; label: string }[] = [
  { value: 'all', label: 'All Classifications' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'client', label: 'Client' },
  { value: 'noreply', label: 'No Reply' },
  { value: 'review', label: 'Review' },
];

const priorityWeight: Record<string, number> = { high: 0, medium: 1, low: 2 };

// URL filter → quick filter mapping
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
      return {}; // handled separately
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

    // search: combine local input and global TopBar search
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
      // mark read on select
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

  // ── confidence bar color ──
  function confidenceColor(v: number) {
    if (v >= 0.85) return 'bg-green-500';
    if (v >= 0.7) return 'bg-yellow-400';
    return 'bg-red-400';
  }

  // ───────────────────────── render ──────────────────────────

  return (
    <div className="flex h-full overflow-hidden">
      {/* ────── Email List Panel ────── */}
      <div
        className={`flex flex-col border-r border-[#E9EAF1] bg-white ${
          selectedConversation ? 'w-[55%]' : 'w-full'
        } transition-all duration-200`}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-4 border-b border-[#E9EAF1]">
          <div className="flex items-center gap-3 flex-wrap">
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
              placeholder="Search emails…"
              className="flex-1 max-w-sm"
            />

            {/* Sort */}
            <DropdownMenu
              trigger={
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                  <ChevronDown className="w-3 h-3" />
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
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  {CLASSIFICATION_FILTER.find((c) => c.value === classificationFilter)?.label}
                  <ChevronDown className="w-3 h-3" />
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
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Bulk actions bar */}
          {selectMode && selectedIds.size > 0 && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={selectAll}
                className="flex items-center gap-1.5 text-xs text-[#777D91] hover:text-[#20243A]"
              >
                {selectedIds.size === filtered.length ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                {selectedIds.size === filtered.length ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-xs text-[#777D91]">
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
        <div className="flex-1 overflow-y-auto">
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

      {/* ────── Conversation Preview Panel ────── */}
      <AnimatePresence mode="wait">
        {selectedConversation ? (
          <motion.div
            key={selectedConversation.id}
            className="w-[45%] flex flex-col bg-[#F7F8FC] overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Preview Header */}
            <div className="flex items-start justify-between gap-3 p-5 bg-white border-b border-[#E9EAF1]">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-[#20243A] truncate">
                  {selectedConversation.subject}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant={selectedConversation.classification}>
                    {selectedConversation.classification}
                  </Badge>
                  {selectedConversation.priority !== 'low' && (
                    <span
                      className={`w-2 h-2 rounded-full ${priorityDot[selectedConversation.priority]}`}
                    />
                  )}
                  <span className="text-xs text-[#777D91]">
                    {selectedConversation.messages.length} message
                    {selectedConversation.messages.length !== 1 && 's'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleStar(selectedConversation.id)}
                  className="p-1.5 rounded-lg hover:bg-[#F7F8FC] transition-colors"
                >
                  <Star
                    className={`w-4.5 h-4.5 ${
                      selectedConversation.isStarred
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-[#777D91]'
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
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <DropdownMenu
                  trigger={
                    <button className="p-1.5 rounded-lg hover:bg-[#F7F8FC] transition-colors">
                      <MoreHorizontal className="w-4.5 h-4.5 text-[#777D91]" />
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
            <div className="flex-1 overflow-y-auto">
              {/* AI Insights Card */}
              <div className="m-4 p-4 bg-white rounded-xl border border-[#E9EAF1]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#6558E8]" />
                  <span className="text-sm font-semibold text-[#20243A]">AI Insights</span>
                </div>

                {/* Confidence meter */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#777D91]">Confidence</span>
                    <span className="font-medium text-[#20243A]">
                      {Math.round(selectedConversation.aiInsights.confidence * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E9EAF1] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${confidenceColor(
                        selectedConversation.aiInsights.confidence,
                      )}`}
                      style={{
                        width: `${selectedConversation.aiInsights.confidence * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={selectedConversation.aiInsights.classification}>
                    {selectedConversation.aiInsights.classification}
                  </Badge>
                </div>

                <p className="text-xs text-[#777D91] mb-2">
                  {selectedConversation.aiInsights.reasoning}
                </p>
                <div className="text-xs space-y-1">
                  <p>
                    <span className="font-medium text-[#20243A]">Suggested: </span>
                    <span className="text-[#777D91]">
                      {selectedConversation.aiInsights.suggestedAction}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-[#20243A]">Summary: </span>
                    <span className="text-[#777D91]">
                      {selectedConversation.aiInsights.summary}
                    </span>
                  </p>
                </div>

                {/* Quick Classification Switcher */}
                <div className="mt-3 pt-3 border-t border-[#E9EAF1]">
                  <p className="text-[11px] font-semibold text-[#777D91] mb-2 uppercase tracking-wider">
                    Change Classification:
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['assistant', 'client', 'noreply', 'review'] as Classification[]).map((cls) => (
                      <button
                        key={cls}
                        onClick={() => {
                          reclassify(selectedConversation.id, cls);
                          showToastMessage(`Reclassified as ${cls}`, 'success');
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg transition-all border ${
                          selectedConversation.classification === cls
                            ? 'border-[#6558E8] bg-[#6558E8]/10 font-bold shadow-xs'
                            : 'border-[#E9EAF1] bg-white opacity-70 hover:opacity-100 hover:border-gray-300'
                        }`}
                      >
                        <Badge variant={cls} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div className="px-4 pb-4 space-y-1">
                {selectedConversation.messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFD]'
                    } border border-[#E9EAF1]`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Avatar name={msg.from.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-[#20243A]">
                          {msg.from.name}
                        </span>
                        <span className="text-xs text-[#777D91] ml-2">
                          {timeAgo(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[#20243A] whitespace-pre-line leading-relaxed">
                      {msg.body}
                    </p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-[#777D91]">
                        <Paperclip className="w-3.5 h-3.5" />
                        {msg.attachments.map((a) => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Composer */}
            <div className="border-t border-[#E9EAF1] bg-white p-4">
              {selectedConversation.clientName && (
                <p className="text-xs text-[#777D91] mb-2">
                  Reply as <span className="font-medium text-[#20243A]">{selectedConversation.clientName}</span>
                </p>
              )}
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={3}
                className="w-full resize-none rounded-xl border border-[#E9EAF1] p-3 text-sm text-[#20243A] placeholder-[#777D91] focus:outline-none focus:ring-2 focus:ring-[#6558E8]/30 focus:border-[#6558E8] transition-colors"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  {/* Tone selector */}
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        tone === t
                          ? 'border-[#6558E8] bg-[#6558E8]/5 text-[#6558E8] font-medium'
                          : 'border-[#E9EAF1] text-[#777D91] hover:bg-[#F7F8FC]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                  <Button variant="ghost" size="sm" onClick={handleAiSuggest} className="ml-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Suggest
                  </Button>
                </div>
                <Button variant="primary" size="sm" onClick={handleSend}>
                  <Send className="w-3.5 h-3.5" />
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="hidden lg:flex w-[45%] items-center justify-center bg-[#F7F8FC]">
            <EmptyState
              icon={Mail}
              title="Select a conversation"
              description="Choose an email from the list to view its details."
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
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#E9EAF1] transition-colors group ${
          isSelected
            ? 'bg-[#6558E8]/5'
            : 'hover:bg-[#F7F8FC]'
        }`}
        onClick={onClick}
      >
        {/* Checkbox / Unread dot */}
        {selectMode ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCheck();
            }}
            className="flex-shrink-0"
          >
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-[#6558E8]" />
            ) : (
              <Square className="w-4 h-4 text-[#777D91]" />
            )}
          </button>
        ) : (
          <div className="w-2 flex-shrink-0">
            {isUnread && <div className="w-2 h-2 rounded-full bg-[#6558E8]" />}
          </div>
        )}

        {/* Avatar */}
        <Avatar name={lastMsg.from.name} size="sm" />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm truncate ${
                isUnread ? 'font-semibold text-[#20243A]' : 'text-[#20243A]'
              }`}
            >
              {lastMsg.from.name}
            </span>
            <span className="text-xs text-[#777D91] flex-shrink-0">
              {timeAgo(conv.lastActivity)}
            </span>
          </div>
          <p
            className={`text-sm truncate ${
              isUnread ? 'font-semibold text-[#20243A]' : 'text-[#20243A]'
            }`}
          >
            {conv.subject}
          </p>
          <p className="text-xs text-[#777D91] truncate">{preview(lastMsg.body)}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {conv.priority !== 'low' && (
            <span className={`w-2 h-2 rounded-full ${priorityDot[conv.priority]}`} />
          )}
          <Badge variant={conv.classification}>{conv.classification}</Badge>
          {hasAttachments && (
            <Paperclip className="w-3.5 h-3.5 text-[#777D91]" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
          >
            <Star
              className={`w-4 h-4 ${
                conv.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-[#777D91]'
              }`}
            />
          </button>
        </div>
      </motion.div>
    );
  },
);

EmailRow.displayName = 'EmailRow';

export default Inbox;
