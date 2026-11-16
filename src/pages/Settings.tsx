import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Sliders,
  Bell,
  Cpu,
  Info,
  RotateCcw,
  Check,
  Shield,
  Key,
  Globe,
  Save,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button, Avatar } from '@/components/ui'

const Settings: React.FC = () => {
  const {
    user,
    role,
    setRole,
    resetDemo,
    showToastMessage,
  } = useStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'notifications' | 'ai' | 'about'>('profile')

  // Form states
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85)
  const [autoClassify, setAutoClassify] = useState(true)
  const [dailyBriefing, setDailyBriefing] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('Sterling Executive Office')

  const handleSave = () => {
    showToastMessage('Preferences saved successfully', 'success')
  }

  const handleReset = () => {
    resetDemo()
    showToastMessage('Demo state reset to initial factory data', 'info')
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-txt-primary">Settings & Preferences</h1>
        <p className="text-sm text-txt-secondary mt-0.5">
          Configure AI intelligence thresholds, user workspace permissions, and notification dispatch rules.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation tabs */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-1">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'workspace', label: 'Workspace Rules', icon: Sliders },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'ai', label: 'AI Engine Settings', icon: Cpu },
            { id: 'about', label: 'About & Reset', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content area */}
        <div className="flex-1 bg-surface rounded-2xl border border-border p-6 shadow-xs">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-txt-primary">User Profile</h3>
                <p className="text-xs text-txt-secondary mt-0.5">
                  Your identity when reviewing, classifying, and drafting email communications.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Avatar name={user?.name || 'Alex Morgan'} size="lg" />
                <div>
                  <div className="font-bold text-sm text-txt-primary">{user?.name}</div>
                  <div className="text-xs text-txt-secondary">{user?.email}</div>
                  <div className="mt-1">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wider">
                      Active Role: {role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <label className="text-xs font-semibold text-txt-primary block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || 'Alex Morgan'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-txt-primary block mb-1">
                    Primary Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'alex.morgan@company.com'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-txt-primary block mb-1">
                    Default Workspace Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRole('assistant')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        role === 'assistant'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-txt-secondary hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs">Assistant Mode</div>
                      <div className="text-[11px] text-txt-secondary mt-0.5">Full inbox triage and drafting</div>
                    </button>
                    <button
                      onClick={() => setRole('client')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        role === 'client'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-txt-secondary hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs">Client Mode</div>
                      <div className="text-[11px] text-txt-secondary mt-0.5">Minimal decision-only feed</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-txt-primary">Workspace Configuration</h3>
                <p className="text-xs text-txt-secondary mt-0.5">
                  Rules for delegating communications between assistants and clients.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-txt-primary block mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm text-txt-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="p-4 rounded-xl border border-border bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-txt-primary">Shared Thread State</div>
                      <div className="text-[11px] text-txt-secondary">
                        Client approvals update the assistant inbox in real-time.
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <div className="text-xs font-bold text-txt-primary">Auto-Archive on Client Approval</div>
                      <div className="text-[11px] text-txt-secondary">
                        Automatically move resolved decisions to completed archives.
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                  Save Configuration
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-txt-primary">Notification Preferences</h3>
                <p className="text-xs text-txt-secondary mt-0.5">
                  Control how alerts, daily briefings, and high-priority flags are delivered.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border">
                  <div>
                    <div className="text-xs font-bold text-txt-primary">Morning AI Briefing Email</div>
                    <div className="text-[11px] text-txt-secondary">
                      Send daily 8:00 AM summary of pending decisions and meetings.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyBriefing}
                    onChange={(e) => setDailyBriefing(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border">
                  <div>
                    <div className="text-xs font-bold text-txt-primary">Instant Push on High-Priority Flags</div>
                    <div className="text-[11px] text-txt-secondary">
                      Notify immediately when an email is classified as urgent client decision.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-txt-primary">AI Engine & Classification Tuning</h3>
                <p className="text-xs text-txt-secondary mt-0.5">
                  Tune confidence cutoffs and automatic categorization behaviors.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-txt-primary">Confidence Cutoff Threshold</span>
                    <span className="text-primary font-bold">{Math.round(confidenceThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="0.99"
                    step="0.01"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <p className="text-[11px] text-txt-secondary mt-1">
                    Emails categorized with confidence below this threshold are routed to "Needs Review" for human verification.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="text-xs font-bold text-primary">Transparent Rule Engine</div>
                  <p className="text-[11px] text-txt-secondary leading-relaxed">
                    InboxPilot combines heuristic intent parsing, authority extraction, and signature detection. No customer data leaves this demo environment.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                  Update AI Engine
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-txt-primary">System Information</h3>
                <p className="text-xs text-txt-secondary mt-0.5">
                  Prototype build details and sample data controls.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-txt-secondary">Product:</span>
                  <span className="font-semibold text-txt-primary">InboxPilot Enterprise SaaS</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-txt-secondary">Frontend Engine:</span>
                  <span className="font-semibold text-txt-primary">React 18 + Vite + TypeScript + Tailwind</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-txt-secondary">Version:</span>
                  <span className="font-semibold text-txt-primary">v1.0.0 (Production Release)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-txt-secondary">Local Persistence:</span>
                  <span className="font-semibold text-txt-primary">Zustand LocalStorage Middleware</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-txt-primary mb-1">Reset Sample Data</h4>
                <p className="text-xs text-txt-secondary mb-3">
                  Restore all 28 emails, notifications, and classification tags to their original evaluation demo state.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Demo State
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
