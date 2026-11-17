import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button, Badge } from '@/components/ui';

interface MeetingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  location: string;
  type: 'video' | 'in-person';
  convId: string;
  priority: 'high' | 'medium' | 'low';
}

const meetingsData: MeetingItem[] = [
  {
    id: 'meet-1',
    title: 'Series B Term Sheet Partner Sync',
    date: 'Tomorrow, Oct 11',
    time: '11:00 AM – 11:45 AM',
    duration: '45 mins',
    attendees: ['David Sterling', 'Marcus Webb (Apex)', 'Elena Rostova'],
    location: 'Zoom Conference ID: 882-192-491',
    type: 'video',
    convId: 'conv-1',
    priority: 'high',
  },
  {
    id: 'meet-2',
    title: 'Q3 Board of Directors Meeting',
    date: 'Thursday, Oct 15',
    time: '2:00 PM – 5:00 PM',
    duration: '3 hours',
    attendees: ['Board Members', 'Alex Morgan', 'General Counsel'],
    location: 'Conference Room 12A & Hybrid Zoom',
    type: 'in-person',
    convId: 'conv-2',
    priority: 'high',
  },
  {
    id: 'meet-3',
    title: 'VP of Engineering Candidate Final Round (Robert Vance)',
    date: 'Monday, Oct 19',
    time: '3:00 PM – 4:00 PM',
    duration: '60 mins',
    attendees: ['David Sterling', 'Robert Vance', 'Jessica Vance'],
    location: 'Google Meet',
    type: 'video',
    convId: 'conv-10',
    priority: 'medium',
  },
  {
    id: 'meet-4',
    title: 'Commercial Lease Settlement Sign-Off',
    date: 'Wednesday, Oct 21',
    time: '10:00 AM – 10:30 AM',
    duration: '30 mins',
    attendees: ['David Sterling', 'Robert Thorne (Landlord Legal)'],
    location: 'In-Person, 100 Montgomery St',
    type: 'in-person',
    convId: 'conv-8',
    priority: 'high',
  },
];

const Meetings: React.FC = () => {
  const navigate = useNavigate();
  const selectConversation = useStore((s) => s.selectConversation);
  const showToastMessage = useStore((s) => s.showToastMessage);

  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  const [search, setSearch] = useState('');

  const filtered = meetingsData.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.attendees.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20 bg-canvas">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              Calendar Intelligence
            </span>
            <span className="text-xs text-txt-secondary">
              Synchronized with David's Google & Outlook accounts
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink heading-serif">
            Executive Schedule & Syncs
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-border rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-txt-secondary hover:text-ink'
              }`}
            >
              Agenda
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-txt-secondary hover:text-ink'
              }`}
            >
              Week Grid
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => showToastMessage('Scheduling assistant invited (simulated)', 'info')}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* AI Extraction Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-white border border-border shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink">4 Calendar Signals Autonomously Extracted from Email</p>
            <p className="text-[11px] text-txt-secondary">
              AI automatically detected dates, attendee names, and Zoom links across incoming messages.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
          Auto-Synced
        </span>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border hover:border-accent/30 transition-all p-5 shadow-card hover:shadow-card-hover"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-canvas border border-border flex flex-col items-center justify-center text-center flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase text-accent">OCT</span>
                    <span className="text-sm font-extrabold text-ink leading-none">
                      {item.date.includes('11') ? '11' : item.date.includes('15') ? '15' : item.date.includes('19') ? '19' : '21'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-ink">{item.title}</span>
                      {item.priority === 'high' && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                          Priority
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-txt-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-txt-secondary" />
                        {item.date} · {item.time} ({item.duration})
                      </span>
                      <span className="flex items-center gap-1">
                        {item.type === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        {item.location}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-txt-secondary">
                      Attendees: <span className="text-txt-primary">{item.attendees.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      selectConversation(item.convId);
                      navigate('/inbox');
                    }}
                    className="text-xs"
                  >
                    View Email Context
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
          <div className="grid grid-cols-5 gap-3 text-center border-b border-border pb-3 mb-4">
            {['Mon, Oct 12', 'Tue, Oct 13', 'Wed, Oct 14', 'Thu, Oct 15', 'Fri, Oct 16'].map((d) => (
              <span key={d} className="text-xs font-bold text-ink uppercase tracking-wider">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-3 min-h-[300px]">
            <div className="p-3 bg-canvas/60 rounded-xl border border-border/50 text-xs">
              <span className="font-bold text-accent block mb-1">8:30 AM</span>
              <p className="font-medium text-ink">UA 412 Flight SFO-JFK</p>
            </div>
            <div className="p-3 bg-canvas/30 rounded-xl border border-dashed border-border text-xs text-txt-secondary flex items-center justify-center">
              No meetings
            </div>
            <div className="p-3 bg-canvas/30 rounded-xl border border-dashed border-border text-xs text-txt-secondary flex items-center justify-center">
              No meetings
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
              <span className="font-bold text-amber-800 block mb-1">2:00 PM</span>
              <p className="font-bold text-amber-950">Q3 Board Meeting</p>
              <p className="text-[11px] text-amber-800/80 mt-1">Conf Room 12A</p>
            </div>
            <div className="p-3 bg-accent/[0.04] border border-accent/20 rounded-xl text-xs">
              <span className="font-bold text-accent block mb-1">7:30 PM</span>
              <p className="font-medium text-ink">VIP Dinner at Quince</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
