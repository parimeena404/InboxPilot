import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Check,
  MessageSquare,
  Calendar,
  AlertTriangle,
  RotateCcw,
  FileCheck,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge, Button, Modal, Avatar } from '@/components/ui';
import type { Conversation } from '@/types';
import { useNavigate } from 'react-router-dom';

const ClientWorkspace: React.FC = () => {
  const {
    conversations,
    markClientHandled,
    reclassify,
    setRole,
    showToastMessage,
  } = useStore();
  const navigate = useNavigate();

  const [activeModalConv, setActiveModalConv] = useState<Conversation | null>(null);

  // Filter only client conversations that are not archived
  const clientConversations = conversations.filter(
    (c) => c.classification === 'client' && !c.isArchived
  );

  const handleHandled = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    markClientHandled(id);
    showToastMessage('Decision approved and marked handled', 'success');
    if (activeModalConv?.id === id) {
      setActiveModalConv(null);
    }
  };

  const handleDelegate = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    reclassify(id, 'assistant');
    showToastMessage('Delegated back to Executive Assistant (Alex Morgan)', 'info');
    if (activeModalConv?.id === id) {
      setActiveModalConv(null);
    }
  };

  return (
    <div className="min-h-screen bg-canvas p-4 md:p-8 pb-24 max-w-5xl mx-auto">
      {/* ── CLIENT EXECUTIVE BANNER (DARK INK SURFACE) ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ink rounded-3xl p-6 md:p-9 text-white mb-8 shadow-panel relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold mb-3 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Executive Decision Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight heading-serif">
              Decisions Awaiting Your Input
            </h1>
            <p className="text-white/70 text-sm mt-2 leading-relaxed">
              InboxPilot has filtered out 25+ routine administrative threads. Only matters requiring your personal signature, term approval, or executive discretion are presented below.
            </p>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div className="text-left md:text-right">
              <div className="text-3xl font-extrabold text-amber-400">
                {clientConversations.length}
              </div>
              <div className="text-xs text-white/60 font-medium">Pending Decision{clientConversations.length !== 1 ? 's' : ''}</div>
            </div>

            <Button
              variant="secondary"
              onClick={() => {
                setRole('assistant');
                navigate('/dashboard');
              }}
              className="text-xs whitespace-nowrap bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Switch to Assistant View
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── DECISION CARDS ── */}
      {clientConversations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-3xl border border-border p-12 text-center max-w-lg mx-auto my-12 shadow-card"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 text-success mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-txt-primary heading-serif">Inbox Zero Decisions</h2>
          <p className="text-sm text-txt-secondary mt-2 mb-6 leading-relaxed">
            All executive sign-offs and sensitive decisions are resolved. Your assistant (Alex Morgan) is managing day-to-day coordination.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setRole('assistant');
              navigate('/dashboard');
            }}
          >
            Switch to Assistant Workspace
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-txt-secondary uppercase tracking-wider px-1">
            <span>Pending Approvals ({clientConversations.length})</span>
            <span>Sorted by Impact</span>
          </div>

          <AnimatePresence>
            {clientConversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <motion.div
                  key={conv.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-surface rounded-2xl border border-border hover:border-amber-300 transition-all p-6 shadow-card hover:shadow-card-hover cursor-pointer group relative overflow-hidden"
                  onClick={() => setActiveModalConv(conv)}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                    <div className="flex-1">
                      {/* Badge row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Executive Sign-Off Needed
                        </span>
                        <span className="text-xs font-semibold text-txt-primary">
                          {lastMsg?.from.name}
                        </span>
                        <span className="text-xs text-txt-secondary">
                          • {new Date(conv.lastActivity).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Subject */}
                      <h3 className="text-lg font-bold text-txt-primary group-hover:text-accent transition-colors heading-serif">
                        {conv.subject}
                      </h3>

                      {/* Why input is needed */}
                      <div className="mt-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
                        <p className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Executive Rationale:
                        </p>
                        <p className="text-amber-800 leading-relaxed">
                          {conv.aiInsights.reasoning}
                        </p>
                      </div>

                      {/* Assistant note */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-txt-secondary">
                        <Avatar name="Alex Morgan" size="sm" />
                        <span>
                          <strong className="text-txt-primary">Alex's Note:</strong> "{conv.aiInsights.suggestedAction}"
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => handleHandled(conv.id, e)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Mark Handled
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleDelegate(conv.id, e)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 text-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-txt-secondary" />
                        Delegate to Alex
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={Boolean(activeModalConv)}
        onClose={() => setActiveModalConv(null)}
        title={activeModalConv?.subject || 'Review Decision'}
        size="lg"
      >
        {activeModalConv && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Why this requires your personal input:
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {activeModalConv.aiInsights.reasoning}
              </p>
            </div>

            {/* Message thread preview */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {activeModalConv.messages.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl border border-border bg-canvas/70">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-txt-primary">{m.from.name}</span>
                    <span className="text-txt-secondary text-[11px]">
                      {new Date(m.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-txt-primary whitespace-pre-line leading-relaxed">
                    {m.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <Button
                variant="secondary"
                onClick={(e) => handleDelegate(activeModalConv.id, e)}
                className="text-xs"
              >
                Delegate to Assistant
              </Button>
              <Button
                variant="primary"
                onClick={(e) => handleHandled(activeModalConv.id, e)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700"
              >
                Approve & Mark Handled
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientWorkspace;
