import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'

interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
  actionLink?: {
    label: string
    to: string
  }
}

const suggestedPrompts = [
  'Summarize today\'s highest-priority emails',
  'What decisions is David Sterling currently waiting on?',
  'Draft a polite follow-up to Marcus Webb regarding the Term Sheet',
  'Show upcoming meetings for next week',
  'Which emails can I safely archive or ignore?',
]

const AICopilot: React.FC = () => {
  const navigate = useNavigate()
  const { conversations, selectConversation } = useStore()

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Good day, Alex. I am your InboxPilot executive copilot. I continuously monitor communications, extract action items, and keep the client aligned. How can I assist you with the inbox right now?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText
    if (!text.trim()) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    // Generate intelligent AI response based on real store state
    setTimeout(() => {
      const lower = text.toLowerCase()
      let reply = ''
      let actionLink: ChatMessage['actionLink'] = undefined

      if (lower.includes('summar') || lower.includes('brief') || lower.includes('today')) {
        const clientCount = conversations.filter((c) => c.classification === 'client' && !c.isArchived).length
        const highPriority = conversations.filter((c) => c.priority === 'high' && !c.isArchived).length
        reply = `Here is your executive briefing:\n\n• There are ${clientCount} conversations waiting for David's personal decision (notably the Series B Term Sheet from Apex Ventures and the Landlord Lease Settlement).\n• You have ${highPriority} high-priority threads in your active inbox.\n• 1 incoming flight itinerary (UA 412 SFO-JFK) is confirmed for Oct 12 with ground transport arranged.`
        actionLink = { label: 'Go to Assistant Priority View', to: '/inbox?filter=action' }
      } else if (lower.includes('marcus') || lower.includes('term sheet') || lower.includes('apex')) {
        reply = `Here is a suggested draft for Marcus Webb (Apex Ventures):\n\n"Hi Marcus,\n\nDavid has reviewed the revised Series B Term Sheet. We agree in principle with Section 4 (Founder Vesting), subject to counsel confirming the double-trigger acceleration language. We expect executed signatures back to you tomorrow morning by 11 AM EST.\n\nBest regards,\nAlex Morgan (for David Sterling)"`
        actionLink = { label: 'Open Term Sheet Thread', to: '/inbox' }
      } else if (lower.includes('decision') || lower.includes('david') || lower.includes('client')) {
        const clientItems = conversations.filter((c) => c.classification === 'client' && !c.isArchived)
        const titles = clientItems.slice(0, 3).map((c) => `• "${c.subject}" (${c.messages[0]?.from.name})`).join('\n')
        reply = `David Sterling currently has ${clientItems.length} decisions waiting for his input:\n\n${titles}\n\nWould you like me to ping him on WhatsApp or prepare a concise decision memo?`
        actionLink = { label: 'Open Client Workspace', to: '/client' }
      } else if (lower.includes('meeting') || lower.includes('schedule') || lower.includes('calendar')) {
        reply = `Upcoming calendar events extracted from your messages:\n\n1. Oct 11: Series B Partner Sync (11:00 AM)\n2. Oct 12: Flight UA 412 SFO-JFK (8:30 AM)\n3. Oct 15: Q3 Board of Directors Meeting (2:00 PM – 5:00 PM)\n4. Oct 16: VIP Client Dinner at Quince (7:30 PM)`
        actionLink = { label: 'View Calendar & Meetings', to: '/meetings' }
      } else if (lower.includes('archive') || lower.includes('ignore') || lower.includes('receipt') || lower.includes('clean')) {
        const noreplyCount = conversations.filter((c) => c.classification === 'noreply' && !c.isArchived).length
        reply = `I have classified ${noreplyCount} messages as "No Reply Needed". These include Stripe payment confirmations, AWS monthly invoices, GitHub security bots, and Substack newsletters. You can safely bulk-archive them with one click.`
        actionLink = { label: 'View No-Reply Items', to: '/inbox?filter=noreply' }
      } else {
        reply = `I analyzed your request against all 28 conversations in the workspace. I found 3 relevant threads matching "${text}". I can help you draft a response, adjust the classification status, or highlight action items for the client.`
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionLink,
        },
      ])
      setIsTyping(false)
    }, 650)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-txt-primary flex items-center gap-2">
              Executive AI Copilot
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Online & Context-Aware
              </span>
            </h1>
            <p className="text-xs text-txt-secondary">
              Natural language assistant with access to all 28 mailbox threads and schedules.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            setMessages([
              {
                id: 'welcome',
                sender: 'ai',
                text: 'Chat history cleared. How can I assist you with your inbox?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="text-xs inline-flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-txt-primary text-white'
                  : 'bg-primary text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-txt-primary text-white rounded-tr-none'
                  : 'bg-surface border border-border text-txt-primary rounded-tl-none shadow-xs'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {msg.actionLink && (
                <div className="mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => navigate(msg.actionLink!.to)}
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-primary hover:underline"
                  >
                    <span>{msg.actionLink.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div
                className={`text-[10px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-white/60 text-right' : 'text-txt-secondary'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-surface border border-border rounded-2xl p-3 px-4 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested chips */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-xs px-3 py-1.5 rounded-full bg-white border border-border hover:border-primary/40 text-txt-secondary hover:text-txt-primary whitespace-nowrap transition-colors flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Copilot to draft replies, extract decisions, or summarize..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-border bg-white text-sm text-txt-primary placeholder:text-txt-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 p-2 bg-primary text-white rounded-xl disabled:opacity-30 hover:bg-primary-hover transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default AICopilot
