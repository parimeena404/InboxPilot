import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Focus,
  FileText,
  Clock,
  Check,
  Tag,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button, Badge } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionLink?: {
    label: string;
    to: string;
  };
}

const generalPrompts = [
  "Summarize today's highest-priority emails",
  'What decisions is David Sterling currently waiting on?',
  'Show upcoming meetings for next week',
  'Which emails can I safely archive or ignore?',
];

export default function AICopilot() {
  const navigate = useNavigate();
  const conversations = useStore((s) => s.conversations);
  const selectedConversationId = useStore((s) => s.selectedConversationId);
  const selectConversation = useStore((s) => s.selectConversation);
  const addReplyMessage = useStore((s) => s.addReplyMessage);
  const showToastMessage = useStore((s) => s.showToastMessage);

  const activeConv = conversations.find((c) => c.id === selectedConversationId) || conversations[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Good day, Alex. I am your InboxPilot Contextual AI Copilot. I continuously monitor communications across your workspace. I currently have context on "${activeConv?.subject || 'Inbox Workspace'}". How can I assist you right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const contextualPrompts = [
    `Summarize "${activeConv?.subject.slice(0, 30)}…"`,
    'Explain why this needs attention',
    'Draft executive response',
    'Extract deadlines & action items',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = '';
      let actionLink: ChatMessage['actionLink'] = undefined;

      if (lower.includes('why') || lower.includes('attention') || lower.includes('reason')) {
        reply = `**Contextual Analysis for "${activeConv?.subject}":**\n\n• **Detected Intent:** ${activeConv?.aiInsights.reasoning}\n• **Classification:** ${activeConv?.classification.toUpperCase()}\n• **Urgency:** ${activeConv?.priority.toUpperCase()} priority\n• **Suggested Action:** ${activeConv?.aiInsights.suggestedAction}`;
        actionLink = { label: 'Open Conversation in Inbox', to: `/inbox` };
      } else if (lower.includes('draft') || lower.includes('respond') || lower.includes('reply')) {
        reply = `Here is a drafted response for "${activeConv?.subject}":\n\n"Thank you for your message. On behalf of David Sterling, I have reviewed the details and will coordinate the requested actions by end of day today. Please let me know if you need any additional documentation in the interim.\n\nBest regards,\nAlex Morgan (for David Sterling)"`;
        actionLink = { label: 'Review & Send in Inbox', to: `/inbox` };
      } else if (lower.includes('deadline') || lower.includes('action') || lower.includes('item')) {
        reply = `**Extracted Action Items & Constraints:**\n\n1. Target sign-off required prior to 4 PM EST.\n2. Review section 4 clauses with legal counsel.\n3. Reply status: ${activeConv?.aiInsights.requiresResponse ? 'Response required' : 'Informational only'}.\n\nSuggested Next Step: ${activeConv?.aiInsights.suggestedAction}`;
      } else if (lower.includes('summar')) {
        reply = `**Executive Summary:**\n\n${activeConv?.aiInsights.summary}\n\n• **Confidence Score:** ${Math.round((activeConv?.aiInsights.confidence || 0.9) * 100)}%\n• **Participants:** ${activeConv?.messages.map((m) => m.from.name).join(', ')}`;
      } else if (lower.includes('decision') || lower.includes('david')) {
        const clientItems = conversations.filter((c) => c.classification === 'client' && !c.isArchived);
        const titles = clientItems.slice(0, 3).map((c) => `• "${c.subject}" (${c.messages[0]?.from.name})`).join('\n');
        reply = `David Sterling currently has ${clientItems.length} decisions waiting for his input:\n\n${titles}\n\nAll items are highlighted in the Executive Client Portal.`;
        actionLink = { label: 'Open Client Portal', to: '/client' };
      } else if (lower.includes('meeting') || lower.includes('schedule') || lower.includes('calendar')) {
        reply = `Upcoming calendar events extracted from your messages:\n\n1. Oct 11: Series B Partner Sync (11:00 AM)\n2. Oct 12: Flight UA 412 SFO-JFK (8:30 AM)\n3. Oct 15: Q3 Board of Directors Meeting (2:00 PM – 5:00 PM)\n4. Oct 16: VIP Client Dinner at Quince (7:30 PM)`;
        actionLink = { label: 'View Calendar & Meetings', to: '/meetings' };
      } else {
        reply = `I processed your inquiry across all active conversations. For "${activeConv?.subject}", current classification is ${activeConv?.classification}. How else can I assist with this thread?`;
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
      ]);
      setIsTyping(false);
    }, 550);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20 flex flex-col h-[calc(100vh-70px)] bg-canvas">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border bg-white p-4 rounded-2xl shadow-card mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-txt-primary flex items-center gap-2">
              Contextual AI Workspace
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Context Active
              </span>
            </h1>
            <p className="text-xs text-txt-secondary truncate mt-0.5">
              Active Context: <strong className="text-txt-primary">{activeConv?.subject}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setMessages([
                {
                  id: 'welcome',
                  sender: 'ai',
                  text: 'Chat history cleared. How can I assist you with your inbox?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }}
            className="text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Context Banner */}
      {activeConv && (
        <div className="mb-3 p-3 rounded-xl bg-accent/[0.04] border border-accent/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="text-txt-secondary truncate">
              Discussing: <strong className="text-txt-primary">{activeConv.subject}</strong> ({activeConv.messages[0]?.from.name})
            </span>
          </div>
          <Badge variant={activeConv.classification} className="flex-shrink-0" />
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-ink text-white'
                  : 'bg-accent text-white'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-ink text-white rounded-tr-none'
                  : 'bg-white border border-border text-txt-primary rounded-tl-none shadow-card'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {msg.actionLink && (
                <div className="mt-3 pt-2.5 border-t border-border">
                  <button
                    onClick={() => navigate(msg.actionLink!.to)}
                    className="inline-flex items-center gap-1.5 font-bold text-xs text-accent hover:underline"
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
            <div className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-border rounded-2xl p-3 px-4 shadow-card">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested chips */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        {(activeConv ? contextualPrompts : generalPrompts).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-3 py-1 rounded-full bg-white border border-border hover:border-accent/40 text-txt-secondary hover:text-txt-primary whitespace-nowrap transition-colors flex-shrink-0 shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Copilot to draft replies, explain classification, or analyze decisions..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-border bg-white text-xs md:text-sm text-txt-primary placeholder:text-txt-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent shadow-card"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 p-1.5 bg-accent text-white rounded-lg disabled:opacity-30 hover:bg-accent-hover transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
