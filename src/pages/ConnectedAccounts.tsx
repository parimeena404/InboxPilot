import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Plus,
  ShieldCheck,
  Mail,
  ExternalLink,
  Loader2,
  Lock,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button, Modal } from '@/components/ui';

const ConnectedAccounts: React.FC = () => {
  const {
    connectedAccounts,
    connectAccount,
    disconnectAccount,
    showToastMessage,
  } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook' | null>(null);
  const [authStep, setAuthStep] = useState<'select' | 'authorizing' | 'success'>('select');
  const [customEmail, setCustomEmail] = useState('');

  const handleStartConnect = (provider: 'gmail' | 'outlook') => {
    setSelectedProvider(provider);
    setCustomEmail(provider === 'gmail' ? 'david.sterling@acmeventures.com' : 'd.sterling@board-global.org');
    setAuthStep('select');
    setModalOpen(true);
  };

  const handleSimulateAuth = () => {
    if (!selectedProvider || !customEmail) return;
    setAuthStep('authorizing');
    setTimeout(() => {
      connectAccount(selectedProvider, customEmail);
      setAuthStep('success');
      setTimeout(() => {
        setModalOpen(false);
        showToastMessage(`${selectedProvider === 'gmail' ? 'Google Workspace' : 'Microsoft 365'} account connected`, 'success');
      }, 1000);
    }, 1200);
  };

  const handleSyncNow = (email: string) => {
    showToastMessage(`Syncing mailboxes for ${email}...`, 'info');
    setTimeout(() => {
      showToastMessage(`Sync complete. 28 conversations up to date.`, 'success');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20 bg-canvas">
      <div className="mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            Integrations
          </span>
          <span className="text-xs text-txt-secondary">
            Enterprise OAuth Connectors
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-ink heading-serif">
          Connected Inboxes & Accounts
        </h1>
        <p className="text-xs text-txt-secondary mt-1">
          OAuth integration with Google Workspace and Microsoft 365. All mailboxes synchronize into the shared assistant and client triage pipeline.
        </p>
      </div>

      {/* Active accounts */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-txt-secondary uppercase tracking-wider mb-3 px-1">
          Active Connected Inboxes ({connectedAccounts.length})
        </h2>

        <div className="space-y-3">
          {connectedAccounts.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-canvas border border-border flex items-center justify-center flex-shrink-0">
                  {account.provider === 'gmail' ? (
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.33.77.1.43.1.88zm-1.98-4.5v.1q-.23-.13-.5-.19-.25-.07-.53-.07-.59 0-1.05.21-.45.21-.78.56-.33.36-.51.83-.18.47-.18 1.01 0 .52.17.99.18.46.49.82.32.35.77.56.44.2.98.2.28 0 .55-.07.28-.08.5-.22v.12h1.52V7.54zm11.8 7.14h-2.12L13.76 12l1.82-2.67h2.12L15.5 12zm-4.72-9.24h1.83v9.24h-1.83zm-2.48 0h1.83v9.24h-1.83z" fill="#0078D4" />
                      <path d="M24 7.8v8.4a1.8 1.8 0 01-1.8 1.8H1.8A1.8 1.8 0 010 16.2V7.8A1.8 1.8 0 011.8 6h20.4A1.8 1.8 0 0124 7.8z" fill="#0078D4" opacity="0.15" />
                    </svg>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs md:text-sm text-ink">{account.name}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-txt-secondary mt-0.5">{account.email}</p>
                  <p className="text-[10px] text-txt-secondary/60 mt-1">
                    Last sync: {account.lastSync ? new Date(account.lastSync).toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSyncNow(account.email)}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-txt-secondary" />
                  Sync
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    disconnectAccount(account.id);
                    showToastMessage(`Disconnected ${account.email}`, 'info');
                  }}
                  className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Connect new provider cards */}
      <div>
        <h2 className="text-xs font-bold text-txt-secondary uppercase tracking-wider mb-3 px-1">
          Add New Mailbox
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => handleStartConnect('gmail')}
            className="p-5 rounded-2xl bg-white border border-border hover:border-accent/40 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink">Google Workspace</span>
              <Plus className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs text-txt-secondary">
              Connect executive Gmail or business Google Workspace accounts via OAuth.
            </p>
          </div>

          <div
            onClick={() => handleStartConnect('outlook')}
            className="p-5 rounded-2xl bg-white border border-border hover:border-accent/40 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-ink">Microsoft 365 Outlook</span>
              <Plus className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs text-txt-secondary">
              Connect corporate Exchange, Office 365, or board directorship inboxes.
            </p>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedProvider === 'gmail' ? 'Connect Google Workspace' : 'Connect Microsoft 365'}
        size="md"
      >
        <div className="space-y-4">
          {authStep === 'select' && (
            <>
              <p className="text-xs text-txt-secondary">
                Enter the executive email address to simulate OAuth credential authorization:
              </p>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="executive@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-xs text-txt-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <div className="p-3 bg-canvas rounded-xl text-[11px] text-txt-secondary flex items-start gap-2 border border-border/60">
                <Lock className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                <span>
                  InboxPilot connects with scoped read-only metadata permissions for autonomous triage.
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSimulateAuth}>
                  Authorize Simulated OAuth
                </Button>
              </div>
            </>
          )}

          {authStep === 'authorizing' && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
              <p className="font-bold text-xs text-ink">Verifying OAuth Tokens…</p>
              <p className="text-[11px] text-txt-secondary mt-1">
                Synchronizing labels and recent 28 conversation threads.
              </p>
            </div>
          )}

          {authStep === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
              <p className="font-bold text-sm text-ink">Account Connected!</p>
              <p className="text-xs text-txt-secondary mt-1">
                {customEmail} is ready in the command center.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ConnectedAccounts;
