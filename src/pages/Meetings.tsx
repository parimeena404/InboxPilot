import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button, Badge } from '@/components/ui'

interface MeetingItem {
  id: string
  title: string
  date: string
  time: string
  duration: string
  attendees: string[]
  location: string
  type: 'video' | 'in-person'
  convId: string
  priority: 'high' | 'medium' | 'low'
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
    title: 'VIP Client Private Dinner',
    date: 'Friday, Oct 16',
    time: '7:30 PM – 10:00 PM',
    duration: '2.5 hours',
    attendees: ['David Sterling', '12 Enterprise Execs', 'Chef Julian'],
    location: 'Quince Private Dining Salon, SF',
    type: 'in-person',
    convId: 'conv-8',
    priority: 'medium',
  },
  {
    id: 'meet-5',
    title: 'Advisory Board Options & IP Clarification',
    date: 'Wednesday, Oct 21',
    time: '9:30 AM – 10:00 AM',
    duration: '30 mins',
    attendees: ['David Sterling', 'Prof. Henrik Lindqvist'],
    location: 'Teams Meeting',
    type: 'video',
    convId: 'conv-11',
    priority: 'low',
  },
  {
    id: 'meet-6',
    title: 'Weekly Product & Architecture Standup',
    date: 'Recurring (Mondays)',
    time: '11:30 AM – 12:15 PM',
    duration: '45 mins',
    attendees: ['Product Team', 'Engineering Leads'],
    location: 'Room B & Discord Stage',
    type: 'video',
    convId: 'conv-26',
    priority: 'low',
  },
]

const Meetings: React.FC = () => {
  const navigate = useNavigate()
  const { selectConversation } = useStore()
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [search, setSearch] = useState('')

  const filteredMeetings = meetingsData.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.attendees.some((a) => a.toLowerCase().includes(search.toLowerCase()))
  )

  const handleOpenConversation = (convId: string) => {
    selectConversation(convId)
    navigate(`/inbox`)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-txt-primary">
            Meetings & Calendar Coordination
          </h1>
          <p className="text-sm text-txt-secondary mt-0.5">
            Synchronized calendar appointments and schedule requests extracted from email threads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-border p-1 rounded-xl flex items-center">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'list'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              Week Grid
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/inbox?filter=action')}
            className="text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule from Email
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings or participants..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-white text-xs text-txt-primary placeholder:text-txt-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <span className="text-xs text-txt-secondary">
          Showing {filteredMeetings.length} scheduled events
        </span>
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeetings.map((meeting) => (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    meeting.priority === 'high'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {meeting.date}
                </span>

                <button
                  onClick={() => handleOpenConversation(meeting.convId)}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  View Email
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <h3 className="font-bold text-txt-primary text-base mb-2">
                {meeting.title}
              </h3>

              <div className="space-y-2 text-xs text-txt-secondary mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-txt-secondary" />
                  <span>{meeting.time} ({meeting.duration})</span>
                </div>
                <div className="flex items-center gap-2">
                  {meeting.type === 'video' ? (
                    <Video className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span className="truncate">{meeting.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-txt-secondary" />
                  <span className="truncate">{meeting.attendees.join(', ')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                  Confirmed on Calendar
                </span>
                <span className="text-txt-secondary">
                  Host: Executive Office
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Calendar Week Grid */
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-txt-primary uppercase tracking-wider">
              Current Week Overview
            </span>
            <span className="text-xs text-txt-secondary">
              October 2026
            </span>
          </div>
          <div className="grid grid-cols-5 divide-x divide-border min-h-[360px]">
            {['Mon (Oct 12)', 'Tue (Oct 13)', 'Wed (Oct 14)', 'Thu (Oct 15)', 'Fri (Oct 16)'].map((day, idx) => (
              <div key={day} className="p-3">
                <div className="text-xs font-semibold text-txt-primary pb-2 mb-2 border-b border-border">
                  {day}
                </div>
                <div className="space-y-2">
                  {idx === 0 && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                      <div className="font-bold text-blue-900">UA 412 Flight SFO-JFK</div>
                      <div className="text-blue-700 text-[11px] mt-0.5">08:30 AM – 5:05 PM</div>
                    </div>
                  )}
                  {idx === 3 && (
                    <div
                      onClick={() => handleOpenConversation('conv-2')}
                      className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs cursor-pointer hover:bg-purple-100 transition-colors"
                    >
                      <div className="font-bold text-purple-900">Q3 Board Meeting</div>
                      <div className="text-purple-700 text-[11px] mt-0.5">2:00 PM – 5:00 PM</div>
                    </div>
                  )}
                  {idx === 4 && (
                    <div
                      onClick={() => handleOpenConversation('conv-8')}
                      className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs cursor-pointer hover:bg-amber-100 transition-colors"
                    >
                      <div className="font-bold text-amber-900">VIP Client Dinner</div>
                      <div className="text-amber-700 text-[11px] mt-0.5">7:30 PM</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Meetings
