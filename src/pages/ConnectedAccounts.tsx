import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button, Modal } from '@/components/ui'

const ConnectedAccounts: React.FC = () => {
  const {
    connectedAccounts,
    connectAccount,
    disconnectAccount,
    showToastMessage,
  } = useStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook' | null>(null)
  const [authStep, setAuthStep] = useState<'select' | 'authorizing' | 'success'>('select')
  const [customEmail, setCustomEmail] = useState('')

  const handleStartConnect = (provider: 'gmail' | 'outlook') => {
    setSelectedProvider(provider)
    setCustomEmail(provider === 'gmail' ? 'client.executive@gmail.com' : 'executive@corporate.outlook.com')
    setAuthStep('select')
    setModalOpen(true)
  }

  const handleSimulateAuth = () => {
    if (!selectedProvider || !customEmail) return
    setAuthStep('authorizing')
    setTimeout(() => {
      connectAccount(selectedProvider, customEmail)
      setAuthStep('success')
      setTimeout(() => {
        setModalOpen(false)
        showToastMessage(`${selectedProvider === 'gmail' ? 'Google Workspace' : 'Microsoft 365'} account connected`, 'success')
      }, 1200)
    }, 1500)
  }

  const handleSyncNow = (email: string) => {
    showToastMessage(`Syncing mailboxes for ${email}...`, 'info')
    setTimeout(() => {
      showToastMessage(`Sync complete. All 28 conversations up to date.`, 'success')
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-txt-primary">
          Connected Inboxes & Mail Providers
        </h1>
        <p className="text-sm text-txt-secondary mt-1">
          Manage OAuth access to Gmail and Microsoft 365 inboxes. Assistant and client accounts share synchronization state.
        </p>
      </div>

      {/* Active accounts */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-txt-primary uppercase tracking-wider">
            Active Accounts ({connectedAccounts.length})
          </h2>
          <span className="text-xs text-txt-secondary">
            TLS 1.3 Encrypted • Real-time IMAP/REST Sync
          </span>
        </div>

        {connectedAccounts.length === 0 ? (
          <div className="p-8 border border-dashed border-border rounded-2xl text-center bg-white">
            <Link2 className="w-8 h-8 text-txt-secondary mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-txt-primary">No inboxes connected yet</p>
            <p className="text-xs text-txt-secondary mt-1 mb-4">
              Connect a Google or Microsoft mailbox to enable AI classification and drafting.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-surface rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    acc.provider === 'gmail' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {acc.provider === 'gmail' ? 'G' : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-txt-primary">{acc.name}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Connected
                      </span>
                    </div>
                    <div className="text-xs text-txt-secondary mt-0.5">{acc.email}</div>
                    <div className="text-[11px] text-txt-secondary/80 mt-1">
                      Last synchronized: {acc.lastSync ? new Date(acc.lastSync).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSyncNow(acc.email)}
                    className="text-xs inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync
                  </Button>
                  <button
                    onClick={() => {
                      disconnectAccount(acc.id)
                      showToastMessage(`Disconnected ${acc.email}`, 'info')
                    }}
                    className="p-2 text-txt-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-border"
                    title="Disconnect account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connect provider options */}
      <div>
        <h2 className="text-sm font-bold text-txt-primary uppercase tracking-wider mb-4">
          Connect New Email Account
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gmail */}
          <div className="bg-surface rounded-2xl border border-border p-6 hover:border-primary/40 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl mb-3">
              G
            </div>
            <h3 className="font-bold text-txt-primary text-base">Google Workspace / Gmail</h3>
            <p className="text-xs text-txt-secondary mt-1 mb-4 leading-relaxed">
              Connect via Google OAuth2. Enables real-time email ingestion, drafting responses, and calendar synchronisation.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStartConnect('gmail')}
              className="w-full text-xs"
            >
              Connect Google Account
            </Button>
          </div>

          {/* Outlook */}
          <div className="bg-surface rounded-2xl border border-border p-6 hover:border-primary/40 transition-all shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-3">
              O
            </div>
            <h3 className="font-bold text-txt-primary text-base">Microsoft 365 / Outlook</h3>
            <p className="text-xs text-txt-secondary mt-1 mb-4 leading-relaxed">
              Connect via Microsoft Graph API. Supports Exchange online mailboxes, Outlook calendars, and delegated permissions.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleStartConnect('outlook')}
              className="w-full text-xs"
            >
              Connect Microsoft Account
            </Button>
          </div>
        </div>
      </div>

      {/* Simulated OAuth Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          selectedProvider === 'gmail'
            ? 'Connect Google Workspace Account'
            : 'Connect Microsoft 365 Account'
        }
      >
        <div className="py-2">
          {authStep === 'select' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-txt-primary flex items-start gap-3">
                <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">OAuth 2.0 Simulated Authorization</span>
                  <p className="text-txt-secondary mt-0.5">
                    For evaluation and demonstration purposes, this simulates the standard OAuth authentication grant.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-txt-primary block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="name@company.com"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSimulateAuth}>
                  Authorize Access
                </Button>
              </div>
            </div>
          )}

          {authStep === 'authorizing' && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <div className="font-bold text-sm text-txt-primary">Exchanging OAuth Tokens...</div>
              <p className="text-xs text-txt-secondary">
                Verifying scopes (Mail.ReadWrite, Calendars.ReadWrite)
              </p>
            </div>
          )}

          {authStep === 'success' && (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <div className="font-bold text-base text-txt-primary">Mailbox Connected!</div>
              <p className="text-xs text-txt-secondary">
                Synchronizing folders and conversation threads...
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ConnectedAccounts
