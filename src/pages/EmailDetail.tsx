import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Archive,
  Mail,
  MailOpen,
  Sparkles,
  Send,
  User,
  Paperclip,
  CheckCircle,
  Clock,
  Tag,
  Share2,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Badge, Button, Avatar } from '@/components/ui'
import type { Classification } from '@/types'

const EmailDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    conversations,
    toggleStar,
    archiveConversation,
    markAsUnread,
    reclassify,
    addReplyMessage,
    showToastMessage,
  } = useStore()

  const conversation = conversations.find((c) => c.id === id)
  const [replyText, setReplyText] = useState('')
  const [tone, setTone] = useState<'professional' | 'concise' | 'friendly'>('professional')

  if (!conversation) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
        <Mail className="w-12 h-12 text-txt-secondary mb-4 opacity-40" />
        <h3 className="text-lg font-semibold text-txt-primary">Email not found</h3>
        <p className="text-sm text-txt-secondary mt-1 mb-4">
          This conversation may have been deleted or does not exist.
        </p>
        <Button variant="secondary" onClick={() => navigate('/inbox')}>
          Back to Inbox
        </Button>
      </div>
    )
  }

  const handleGenerateReply = () => {
    let suggested = ''
    if (tone === 'concise') {
      suggested = `Hi,\n\nReceived and noted. We will review and provide feedback by end of day tomorrow.\n\nBest,\nAlex (for David Sterling)`
    } else if (tone === 'friendly') {
      suggested = `Hi there,\n\nThanks so much for reaching out! David has reviewed this and asked me to follow up. Let's schedule a time next week that works best for everyone.\n\nWarm regards,\nAlex Morgan`
    } else {
      suggested = `Dear Colleague,\n\nThank you for following up regarding "${conversation.subject}". On behalf of David Sterling, I have reviewed the details provided. We would like to confirm our participation and coordinate next steps.\n\nPlease let me know if additional documentation is required.\n\nSincerely,\nAlex Morgan\nExecutive Assistant to David Sterling`
    }
    setReplyText(suggested)
  }

  const handleSendReply = () => {
    if (!replyText.trim()) return
    addReplyMessage(conversation.id, replyText)
    setReplyText('')
    showToastMessage('Reply sent successfully (simulated)', 'success')
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
      {/* Top navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-txt-secondary hover:text-txt-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to inbox
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStar(conversation.id)}
            className={`p-2 rounded-xl border border-border hover:bg-gray-50 transition-colors ${
              conversation.isStarred ? 'text-amber-500 fill-amber-500' : 'text-txt-secondary'
            }`}
            title="Star conversation"
          >
            <Star className={`w-4 h-4 ${conversation.isStarred ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => {
              archiveConversation(conversation.id)
              showToastMessage('Conversation archived', 'info')
              navigate('/inbox')
            }}
            className="p-2 rounded-xl border border-border hover:bg-gray-50 text-txt-secondary hover:text-txt-primary transition-colors"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              markAsUnread(conversation.id)
              showToastMessage('Marked as unread', 'info')
              navigate('/inbox')
            }}
            className="p-2 rounded-xl border border-border hover:bg-gray-50 text-txt-secondary hover:text-txt-primary transition-colors"
            title="Mark unread"
          >
            <MailOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={conversation.classification} />
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                conversation.priority === 'high'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : conversation.priority === 'medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {conversation.priority.toUpperCase()} PRIORITY
            </span>
            {conversation.labels?.map((label) => (
              <span
                key={label}
                className="text-xs px-2 py-0.5 bg-gray-100 text-txt-secondary rounded-md"
              >
                {label}
              </span>
            ))}
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-txt-primary">
            {conversation.subject}
          </h1>
        </div>

        {/* AI Insight banner */}
        <div className="p-5 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-b border-border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  AI Intelligence & Recommendation
                </span>
                <span className="text-xs text-txt-secondary font-medium">
                  {Math.round(conversation.aiInsights.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm font-medium text-txt-primary mb-1">
                {conversation.aiInsights.suggestedAction}
              </p>
              <p className="text-xs text-txt-secondary">
                {conversation.aiInsights.reasoning}
              </p>
              {conversation.aiInsights.actionItems && conversation.aiInsights.actionItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <span className="text-xs font-semibold text-txt-primary block mb-1.5">
                    Extracted Action Items:
                  </span>
                  <ul className="space-y-1">
                    {conversation.aiInsights.actionItems.map((item, idx) => (
                      <li key={idx} className="text-xs text-txt-secondary flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reclassification options */}
        <div className="px-6 py-3 bg-gray-50/50 border-b border-border flex flex-wrap items-center justify-between text-xs text-txt-secondary gap-2">
          <span>Reclassify responsibility:</span>
          <div className="flex items-center gap-1.5">
            {(['assistant', 'client', 'noreply', 'review'] as Classification[]).map((cls) => (
              <button
                key={cls}
                onClick={() => {
                  reclassify(conversation.id, cls)
                  showToastMessage(`Reclassified to ${cls}`, 'success')
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  conversation.classification === cls
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white border border-border hover:bg-gray-50 text-txt-primary'
                }`}
              >
                {cls === 'assistant' ? 'Assistant' : cls === 'client' ? 'Client' : cls === 'noreply' ? 'No Reply' : 'Review'}
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="divide-y divide-border">
          {conversation.messages.map((message) => (
            <div key={message.id} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={message.from.name} size="md" />
                  <div>
                    <div className="font-semibold text-txt-primary text-sm flex items-center gap-2">
                      {message.from.name}
                      <span className="font-normal text-xs text-txt-secondary">
                        &lt;{message.from.email}&gt;
                      </span>
                    </div>
                    <div className="text-xs text-txt-secondary mt-0.5">
                      To: {message.to.map((t) => t.name).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-txt-secondary whitespace-nowrap">
                  {new Date(message.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="text-sm text-txt-primary whitespace-pre-line leading-relaxed pl-12">
                {message.body}
              </div>

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-4 pl-12 flex flex-wrap gap-2">
                  {message.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-gray-50 text-xs text-txt-primary"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-txt-secondary" />
                      <span className="font-medium">{att.name}</span>
                      <span className="text-txt-secondary">({att.size})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="p-6 bg-gray-50/70 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
              Reply on behalf of {conversation.clientName || 'David Sterling'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-txt-secondary">Tone:</span>
              {(['professional', 'concise', 'friendly'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    tone === t
                      ? 'bg-primary text-white font-medium'
                      : 'bg-white border border-border text-txt-secondary hover:text-txt-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={handleGenerateReply}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors ml-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Draft
              </button>
            </div>
          </div>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply or use AI Draft above..."
            rows={5}
            className="w-full p-4 rounded-xl border border-border bg-white text-sm text-txt-primary placeholder:text-txt-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none mb-3"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-txt-secondary">
              Simulated sending • Response will update thread state locally
            </span>
            <Button
              variant="primary"
              onClick={handleSendReply}
              className="inline-flex items-center gap-2"
              disabled={!replyText.trim()}
            >
              <Send className="w-4 h-4" />
              Send Response
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailDetail
