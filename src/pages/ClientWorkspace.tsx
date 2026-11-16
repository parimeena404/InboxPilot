import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Eye,
  Check,
  MessageSquare,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Badge, Button, Modal, Avatar } from '@/components/ui'
import type { Conversation } from '@/types'
import { useNavigate } from 'react-router-dom'

const ClientWorkspace: React.FC = () => {
  const {
    conversations,
    markClientHandled,
    reclassify,
    setRole,
    showToastMessage,
  } = useStore()
  const navigate = useNavigate()

  const [activeModalConv, setActiveModalConv] = useState<Conversation | null>(null)

  // Filter only client conversations that are not archived
  const clientConversations = conversations.filter(
    (c) => c.classification === 'client' && !c.isArchived
  )

  const handleHandled = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    markClientHandled(id)
    showToastMessage('Marked as handled by client', 'success')
    if (activeModalConv?.id === id) {
      setActiveModalConv(null)
    }
  }

  const handleDelegate = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    reclassify(id, 'assistant')
    showToastMessage('Delegated to Executive Assistant', 'info')
    if (activeModalConv?.id === id) {
      setActiveModalConv(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24">
      {/* Client header banner */}
      <div className="bg-gradient-to-r from-[#151B2D] to-[#252F48] rounded-3xl p-6 md:p-8 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-3 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Executive Client Workspace
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Decisions Awaiting Your Input
            </h1>
            <p className="text-white/70 text-sm mt-1 max-w-xl">
              InboxPilot filters out logistics, notifications, and scheduling, surfacing only
              high-impact decisions, term sheets, and authorizations that require your personal authority.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-3xl font-extrabold text-amber-400">
                {clientConversations.length}
              </div>
              <div className="text-xs text-white/60">Pending Decisions</div>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setRole('assistant')
                navigate('/dashboard')
              }}
              className="text-xs whitespace-nowrap bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Switch to Assistant View
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decision cards grid */}
      {clientConversations.length === 0 ? (
        <div className="bg-surface rounded-3xl border border-border p-12 text-center max-w-md mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-txt-primary">All Caught Up!</h2>
          <p className="text-sm text-txt-secondary mt-2 mb-6">
            There are no decisions or approvals requiring your personal attention at this moment.
            Your assistant is managing routine correspondence.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setRole('assistant')
              navigate('/dashboard')
            }}
          >
            Review Assistant Workspace
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-txt-secondary uppercase tracking-wider px-1">
            <span>High-Priority Client Decisions ({clientConversations.length})</span>
            <span>Sorted by Urgency</span>
          </div>

          <AnimatePresence>
            {clientConversations.map((conv) => (
              <motion.div
                key={conv.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-surface rounded-2xl border border-border hover:border-primary/40 transition-all p-5 shadow-xs hover:shadow-md cursor-pointer group"
                onClick={() => setActiveModalConv(conv)}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Client Action Required
                      </span>
                      <span className="text-xs font-semibold text-txt-primary">
                        {conv.messages[conv.messages.length - 1]?.from.name}
                      </span>
                      <span className="text-xs text-txt-secondary">
                        • {new Date(conv.lastActivity).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-txt-primary group-hover:text-primary transition-colors">
                      {conv.subject}
                    </h3>

                    <p className="text-xs text-txt-secondary mt-1.5 line-clamp-2 leading-relaxed">
                      {conv.aiInsights.summary}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/5 text-primary text-xs font-medium">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{conv.aiInsights.suggestedAction}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => handleHandled(conv.id, e)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Handled
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => handleDelegate(conv.id, e)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 text-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-txt-secondary" />
                      Delegate to Assistant
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Why this requires your personal input:
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {activeModalConv.aiInsights.reasoning}
              </p>
            </div>

            {/* Message thread preview */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activeModalConv.messages.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-border bg-gray-50/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-txt-primary">{m.from.name}</span>
                    <span className="text-txt-secondary">
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
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
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
  )
}

export default ClientWorkspace
