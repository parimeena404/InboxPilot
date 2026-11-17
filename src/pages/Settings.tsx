import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button, Avatar } from '@/components/ui';

const Settings: React.FC = () => {
  const {
    user,
    role,
    setRole,
    resetDemo,
    showToastMessage,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'notifications' | 'ai' | 'about'>('profile');

  // Form states
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [autoClassify, setAutoClassify] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Sterling Executive Office');

  const handleSave = () => {
    showToastMessage('Preferences saved successfully', 'success');
  };

  const handleReset = () => {
    resetDemo();
    showToastMessage('Demo state reset to initial factory data', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20 bg-canvas">
      <div className="mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            Workspace Configuration
          </span>
          <span className="text-xs text-txt-secondary">
            Settings & Permissions
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-ink heading-serif">Settings & Preferences</h1>
        <p className="text-xs text-txt-secondary mt-0.5">
          Configure autonomous triage thresholds, executive routing policies, and account credentials.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation tabs */}
        <div className="w-full md:w-52 flex-shrink-0 space-y-1">
          {[
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'workspace', label: 'Workspace', icon: Sliders },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'ai', label: 'AI Intelligence', icon: Cpu },
            { id: 'about', label: 'About & Factory Reset', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-txt-secondary hover:bg-white hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-white rounded-2xl border border-border p-6 shadow-card">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-ink">User Profile Details</h2>
              <div className="flex items-center gap-4">
                <Avatar name={user?.name || 'Alex Morgan'} size="lg" />
                <div>
                  <h3 className="font-bold text-xs md:text-sm text-ink">{user?.name}</h3>
                  <p className="text-xs text-txt-secondary">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded capitalize">
                    {role} Role
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border text-xs">
                <div>
                  <label className="font-semibold text-txt-secondary block mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas/40 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-txt-secondary block mb-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas/40 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'workspace' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-ink">Workspace Operations</h2>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-txt-secondary block mb-1">Desk Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-canvas/40 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-txt-secondary block mb-1">Active Executive Workspace View</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRole('assistant')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                        role === 'assistant'
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-txt-secondary'
                      }`}
                    >
                      Assistant View
                    </button>
                    <button
                      onClick={() => setRole('client')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                        role === 'client'
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-txt-secondary'
                      }`}
                    >
                      Client Decision View
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                  Save Settings
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-ink">Notification Rules</h2>
              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-canvas cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailyBriefing}
                    onChange={(e) => setDailyBriefing(e.target.checked)}
                    className="rounded text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="font-bold text-ink">Autonomous Daily Executive Briefing</p>
                    <p className="text-txt-secondary text-[11px]">Generate high-level communication synthesis every morning.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-canvas cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="font-bold text-ink">High-Urgency Client Notifications</p>
                    <p className="text-txt-secondary text-[11px]">Immediate alert on term sheets, signatures, and board filings.</p>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                  Save Notifications
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-ink">Autonomous Classification Model Settings</h2>
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-txt-secondary">Triage Confidence Threshold</span>
                    <span className="font-bold text-accent">{Math.round(confidenceThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <p className="text-[11px] text-txt-secondary mt-1">
                    Emails below this confidence level are routed to "Needs Review" for human verification.
                  </p>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-canvas cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoClassify}
                      onChange={(e) => setAutoClassify(e.target.checked)}
                      className="rounded text-accent focus:ring-accent"
                    />
                    <div>
                      <p className="font-bold text-ink">Autonomous Pipeline Active</p>
                      <p className="text-txt-secondary text-[11px]">Continuously classify new threads upon webhook ingest.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} className="text-xs">
                  Save AI Rules
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6 text-xs">
              <h2 className="text-sm font-bold text-ink">InboxPilot System Information</h2>
              <div className="p-4 rounded-xl bg-canvas border border-border space-y-2">
                <p><strong>Version:</strong> 2.4.0 (Production Release)</p>
                <p><strong>Environment:</strong> Netlify Edge Deploy (React 18 + Vite + Tailwind)</p>
                <p><strong>Engine:</strong> Rule-based Mock AI Intelligence + Four-Tier Classification</p>
                <p><strong>Storage:</strong> LocalStorage Persisted State (28 Sample Conversations)</p>
              </div>

              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                <h3 className="font-bold text-red-900 mb-1">Factory Reset Demo State</h3>
                <p className="text-red-700 text-[11px] mb-3 leading-relaxed">
                  Reset all mock conversations, unread states, client approvals, and replies to initial demo seed data.
                </p>
                <Button variant="danger" size="sm" onClick={handleReset} className="text-xs gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Factory Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
