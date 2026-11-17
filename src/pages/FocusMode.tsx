import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  SkipForward,
  AlertCircle,
  Clock,
  MessageSquare,
  Zap,
  Star,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge, Button, Avatar } from '@/components/ui';
import type { Conversation } from '@/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const priorityConfig = {
  high: { label: 'High Priority', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle },
  medium: { label: 'Medium Priority', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  low: { label: 'Low Priority', color: 'text-txt-secondary bg-canvas border-border', icon: Star },
};

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function FocusMode() {
  const conversations = useStore((s) => s.conversations);
  const reclassify = useStore((s) => s.reclassify);
  const markClientHandled = useStore((s) => s.markClientHandled);
  const archiveConversation = useStore((s) => s.archiveConversation);
  const addReplyMessage = useStore((s) => s.addReplyMessage);
  const showToastMessage = useStore((s) => s.showToastMessage);

  const actionable = useMemo(() => {
    return conversations
      .filter((c) => !c.isArchived && c.aiInsights.requiresResponse)
      .sort((a, b) => {
        const pa = priorityOrder[a.priority] ?? 2;
        const pb = priorityOrder[b.priority] ?? 2;
        if (pa !== pb) return pa - pb;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      });
  }, [conversations]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const current = actionable[currentIndex] ?? null;
  const total = actionable.length;

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => Math.min(prev + 1, total));
  }, [total]);

  const handleNow = useCallback(() => {
    if (!current) return;
    const reply = `Thank you for your message regarding "${current.subject}". I have reviewed the details and will follow up shortly.\n\nBest regards,\nAlex Morgan`;
    addReplyMessage(current.id, reply);
    showToastMessage('Reply sent — conversation handled', 'success');
    goNext();
  }, [current, addReplyMessage, showToastMessage, goNext]);

  const delegateToClient = useCallback(() => {
    if (!current) return;
    reclassify(current.id, 'client');
    showToastMessage('Delegated to client for decision', 'info');
    goNext();
  }, [current, reclassify, showToastMessage, goNext]);

  const markComplete = useCallback(() => {
    if (!current) return;
    markClientHandled(current.id);
    showToastMessage('Marked as completed', 'success');
    goNext();
  }, [current, markClientHandled, showToastMessage, goNext]);

  const skip = useCallback(() => {
    goNext();
  }, [goNext]);

  // Completed state
  if (currentIndex >= total) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-txt-primary heading-serif mb-2">Focus session complete</h2>
          <p className="text-txt-secondary mb-6">
            {total === 0
              ? 'No actionable conversations right now. Take a break!'
              : `You reviewed ${total} conversation${total !== 1 ? 's' : ''}. Great work!`}
          </p>
          <Button
            variant="primary"
            onClick={() => setCurrentIndex(0)}
            className="mx-auto"
          >
            Start Over
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!current) return null;

  const lastMsg = current.messages[current.messages.length - 1];
  const sender = lastMsg?.from;
  const pri = priorityConfig[current.priority];
  const PriIcon = pri.icon;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-txt-primary">Focus Mode</span>
          </div>
          <span className="text-xs text-txt-secondary">
            {currentIndex + 1} of {total} conversations
          </span>
        </div>
        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current.id}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Priority + Context Header */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden mb-4">
            <div className="p-6 pb-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${pri.color}`}>
                      <PriIcon className="w-3 h-3" />
                      {pri.label}
                    </span>
                    <Badge variant={current.classification} />
                    <span className="text-xs text-txt-secondary">{timeAgo(current.lastActivity)}</span>
                  </div>
                  <h2 className="text-xl font-bold text-txt-primary heading-serif leading-snug">
                    {current.subject}
                  </h2>
                </div>
              </div>

              {/* Sender info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={sender?.name || 'Unknown'} size="sm" />
                <div>
                  <p className="text-sm font-medium text-txt-primary">{sender?.name}</p>
                  <p className="text-xs text-txt-secondary">{sender?.email}</p>
                </div>
              </div>

              {/* AI Reasoning Section */}
              <div className="bg-accent/[0.04] rounded-xl p-4 border border-accent/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-txt-primary">AI Analysis</span>
                  <span className="ml-auto text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                    {Math.round(current.aiInsights.confidence * 100)}% confidence
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Why it matters */}
                  <div>
                    <p className="text-[11px] font-semibold text-txt-secondary uppercase tracking-wider mb-1">Why this needs attention</p>
                    <p className="text-sm text-txt-primary leading-relaxed">{current.aiInsights.reasoning}</p>
                  </div>

                  {/* Summary */}
                  <div>
                    <p className="text-[11px] font-semibold text-txt-secondary uppercase tracking-wider mb-1">Summary</p>
                    <p className="text-sm text-txt-primary leading-relaxed">{current.aiInsights.summary}</p>
                  </div>

                  {/* Suggested Action */}
                  <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-border">
                    <ChevronRight className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-txt-secondary uppercase tracking-wider mb-0.5">Suggested next step</p>
                      <p className="text-sm font-medium text-txt-primary">{current.aiInsights.suggestedAction}</p>
                    </div>
                  </div>

                  {/* Action Items */}
                  {current.aiInsights.actionItems && current.aiInsights.actionItems.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-txt-secondary uppercase tracking-wider mb-1.5">Action items</p>
                      <ul className="space-y-1">
                        {current.aiInsights.actionItems.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-txt-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Latest Message Preview */}
            <div className="border-t border-border px-6 py-4 bg-canvas/50">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-txt-secondary" />
                <span className="text-xs font-semibold text-txt-secondary">Latest message</span>
                <span className="text-xs text-txt-secondary/60">({current.messages.length} total)</span>
              </div>
              <p className="text-sm text-txt-primary leading-relaxed line-clamp-3 whitespace-pre-line">
                {lastMsg?.body}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={handleNow}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-accent text-white hover:bg-accent-hover transition-all shadow-accent/20 shadow-sm hover:shadow-accent"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm font-semibold">Handle Now</span>
            </button>

            <button
              onClick={delegateToClient}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border text-txt-primary hover:border-accent/30 hover:shadow-card-hover transition-all"
            >
              <UserCheck className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold">Delegate</span>
            </button>

            <button
              onClick={markComplete}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border text-txt-primary hover:border-success/30 hover:shadow-card-hover transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-semibold">Complete</span>
            </button>

            <button
              onClick={skip}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border text-txt-secondary hover:text-txt-primary hover:shadow-card-hover transition-all"
            >
              <SkipForward className="w-5 h-5" />
              <span className="text-sm font-semibold">Skip</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
