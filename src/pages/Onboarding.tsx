import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Briefcase,
  User,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  Rocket,
  Shield,
  X,
} from 'lucide-react'
import useStore from '@/store/useStore'
import type { Role } from '@/types'

const STEPS = ['Welcome', 'Role', 'Email', 'Ready'] as const

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

export default function Onboarding() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const completeOnboarding = useStore((s) => s.completeOnboarding)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedRole, setSelectedRole] = useState<Role>('assistant')
  const [connectedProvider, setConnectedProvider] = useState<string | null>(null)

  // OAuth modal state
  const [oauthModal, setOauthModal] = useState<{
    open: boolean
    provider: string
    phase: 'authorizing' | 'connected'
  }>({ open: false, provider: '', phase: 'authorizing' })

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    login(role, false)
    setTimeout(() => goNext(), 300)
  }

  const handleProviderClick = (provider: string) => {
    setOauthModal({ open: true, provider, phase: 'authorizing' })
    setTimeout(() => {
      setOauthModal((m) => ({ ...m, phase: 'connected' }))
      setConnectedProvider(provider)
      setTimeout(() => {
        setOauthModal({ open: false, provider: '', phase: 'authorizing' })
      }, 1200)
    }, 1500)
  }

  const handleFinish = () => {
    completeOnboarding()
    navigate('/dashboard')
  }

  const handleDemoMode = () => {
    login(selectedRole, true)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FC] font-[Inter]">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-[#E9EAF1] bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6558E8]">
            <Mail className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[#20243A]">InboxPilot</span>
        </div>
        {step > 0 && step < STEPS.length - 1 && (
          <button
            onClick={goNext}
            className="text-sm text-[#777D91] transition-colors hover:text-[#20243A]"
          >
            Skip
          </button>
        )}
      </div>

      {/* ── Step indicator ── */}
      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 px-6 pt-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                i < step
                  ? 'bg-[#6558E8] text-white'
                  : i === step
                  ? 'bg-[#6558E8] text-white ring-4 ring-[#6558E8]/20'
                  : 'bg-[#E9EAF1] text-[#777D91]'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`hidden h-0.5 w-12 sm:block ${
                  i < step ? 'bg-[#6558E8]' : 'bg-[#E9EAF1]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Step content ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {/* ─── Step 1: Welcome ─── */}
              {step === 0 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6558E8] to-[#8B7CF7] shadow-lg shadow-[#6558E8]/25"
                  >
                    <Rocket className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-[#20243A]">
                    Welcome to InboxPilot
                  </h2>
                  <p className="mx-auto mt-4 max-w-sm leading-relaxed text-[#777D91]">
                    Let's set up your workspace in just a few steps. You'll be
                    managing emails like a pro in under two minutes.
                  </p>
                  <button
                    onClick={goNext}
                    className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#6558E8] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#6558E8]/25 transition-all hover:bg-[#5548D5]"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ─── Step 2: Choose Role ─── */}
              {step === 1 && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-[#20243A]">Choose your role</h2>
                  <p className="mx-auto mt-3 max-w-sm text-[#777D91]">
                    Select how you'll use InboxPilot. You can switch anytime.
                  </p>

                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {/* Assistant card */}
                    <button
                      onClick={() => handleRoleSelect('assistant')}
                      className={`group relative rounded-2xl border-2 p-6 text-left transition-all ${
                        selectedRole === 'assistant'
                          ? 'border-[#6558E8] bg-[#6558E8]/5 shadow-lg shadow-[#6558E8]/10'
                          : 'border-[#E9EAF1] bg-white hover:border-[#6558E8]/30 hover:shadow-md'
                      }`}
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#20243A]">
                        Personal Assistant
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#777D91]">
                        Manages emails on behalf of clients. Triage, respond, and
                        escalate as needed.
                      </p>
                      {selectedRole === 'assistant' && (
                        <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#6558E8]">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Client card */}
                    <button
                      onClick={() => handleRoleSelect('client')}
                      className={`group relative rounded-2xl border-2 p-6 text-left transition-all ${
                        selectedRole === 'client'
                          ? 'border-[#6558E8] bg-[#6558E8]/5 shadow-lg shadow-[#6558E8]/10'
                          : 'border-[#E9EAF1] bg-white hover:border-[#6558E8]/30 hover:shadow-md'
                      }`}
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <User className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#20243A]">Client</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#777D91]">
                        Reviews decisions that need your attention. Approve, reject,
                        or delegate quickly.
                      </p>
                      {selectedRole === 'client' && (
                        <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#6558E8]">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ─── Step 3: Connect Email ─── */}
              {step === 2 && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-[#20243A]">
                    Connect your email
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-[#777D91]">
                    Securely link your email account. We use OAuth and never store
                    your password.
                  </p>

                  <div className="mt-10 space-y-4">
                    {/* Gmail */}
                    <button
                      onClick={() => handleProviderClick('gmail')}
                      disabled={connectedProvider === 'gmail'}
                      className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                        connectedProvider === 'gmail'
                          ? 'border-green-300 bg-green-50'
                          : 'border-[#E9EAF1] bg-white hover:border-[#6558E8]/30 hover:shadow-md'
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                        <svg viewBox="0 0 24 24" className="h-6 w-6">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#20243A]">Gmail</p>
                        <p className="text-sm text-[#777D91]">Connect your Google account</p>
                      </div>
                      {connectedProvider === 'gmail' ? (
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <Check className="h-4 w-4" />
                          Connected
                        </div>
                      ) : (
                        <ChevronRight className="h-5 w-5 text-[#777D91]" />
                      )}
                    </button>

                    {/* Outlook */}
                    <button
                      onClick={() => handleProviderClick('outlook')}
                      disabled={connectedProvider === 'outlook'}
                      className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                        connectedProvider === 'outlook'
                          ? 'border-green-300 bg-green-50'
                          : 'border-[#E9EAF1] bg-white hover:border-[#6558E8]/30 hover:shadow-md'
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                        <svg viewBox="0 0 24 24" className="h-6 w-6">
                          <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.33.77.1.43.1.88zm-1.98-4.5v.1q-.23-.13-.5-.19-.25-.07-.53-.07-.59 0-1.05.21-.45.21-.78.56-.33.36-.51.83-.18.47-.18 1.01 0 .52.17.99.18.46.49.82.32.35.77.56.44.2.98.2.28 0 .55-.07.28-.08.5-.22v.12h1.52V7.54zm11.8 7.14h-2.12L13.76 12l1.82-2.67h2.12L15.5 12zm-4.72-9.24h1.83v9.24h-1.83zm-2.48 0h1.83v9.24h-1.83z" fill="#0078D4" />
                          <path d="M24 7.8v8.4a1.8 1.8 0 01-1.8 1.8H1.8A1.8 1.8 0 010 16.2V7.8A1.8 1.8 0 011.8 6h20.4A1.8 1.8 0 0124 7.8z" fill="#0078D4" opacity="0.15" />
                          <path d="M14.25 6h7.95A1.8 1.8 0 0124 7.8v8.4a1.8 1.8 0 01-1.8 1.8h-7.95V6z" fill="#0078D4" opacity="0.05" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#20243A]">Outlook</p>
                        <p className="text-sm text-[#777D91]">Connect your Microsoft account</p>
                      </div>
                      {connectedProvider === 'outlook' ? (
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <Check className="h-4 w-4" />
                          Connected
                        </div>
                      ) : (
                        <ChevronRight className="h-5 w-5 text-[#777D91]" />
                      )}
                    </button>
                  </div>

                  {connectedProvider && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={goNext}
                      className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#6558E8] px-8 py-3 text-base font-semibold text-white shadow-lg shadow-[#6558E8]/25 transition-all hover:bg-[#5548D5]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* ─── Step 4: All Set ─── */}
              {step === 3 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1,
                    }}
                    className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/25"
                  >
                    <Check className="h-10 w-10 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-[#20243A]">You're all set!</h2>
                  <p className="mx-auto mt-3 max-w-sm text-[#777D91]">
                    Your workspace is ready. Here's a quick summary:
                  </p>

                  {/* Summary */}
                  <div className="mx-auto mt-8 max-w-xs space-y-3 text-left">
                    <div className="flex items-center gap-3 rounded-xl border border-[#E9EAF1] bg-white p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6558E8]/10">
                        {selectedRole === 'assistant' ? (
                          <Briefcase className="h-4 w-4 text-[#6558E8]" />
                        ) : (
                          <User className="h-4 w-4 text-[#6558E8]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#777D91]">Role</p>
                        <p className="text-sm font-semibold text-[#20243A] capitalize">
                          {selectedRole === 'assistant' ? 'Personal Assistant' : 'Client'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-[#E9EAF1] bg-white p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6558E8]/10">
                        <Mail className="h-4 w-4 text-[#6558E8]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#777D91]">Email</p>
                        <p className="text-sm font-semibold text-[#20243A] capitalize">
                          {connectedProvider || 'Skipped'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-[#E9EAF1] bg-white p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6558E8]/10">
                        <Shield className="h-4 w-4 text-[#6558E8]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#777D91]">Security</p>
                        <p className="text-sm font-semibold text-[#20243A]">
                          End-to-end encrypted
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleFinish}
                    className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#6558E8] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#6558E8]/25 transition-all hover:bg-[#5548D5]"
                  >
                    Enter Workspace
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom nav / demo link ── */}
      <div className="border-t border-[#E9EAF1] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          {step > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm font-medium text-[#777D91] transition-colors hover:text-[#20243A]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleDemoMode}
            className="text-sm text-[#6558E8] transition-colors hover:text-[#5548D5] hover:underline"
          >
            Or try demo mode →
          </button>
        </div>
      </div>

      {/* ── OAuth Modal ── */}
      <AnimatePresence>
        {oauthModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#20243A]">
                  Connect {oauthModal.provider === 'gmail' ? 'Gmail' : 'Outlook'}
                </h3>
                <button
                  onClick={() =>
                    setOauthModal({ open: false, provider: '', phase: 'authorizing' })
                  }
                  className="rounded-lg p-1 text-[#777D91] hover:bg-[#F7F8FC]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-8 flex flex-col items-center">
                {oauthModal.phase === 'authorizing' ? (
                  <>
                    <Loader2 className="h-12 w-12 animate-spin text-[#6558E8]" />
                    <p className="mt-4 font-medium text-[#20243A]">Authorizing...</p>
                    <p className="mt-2 text-sm text-[#777D91]">
                      Securely connecting to{' '}
                      {oauthModal.provider === 'gmail' ? 'Google' : 'Microsoft'}
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                    >
                      <Check className="h-8 w-8 text-green-600" />
                    </motion.div>
                    <p className="mt-4 font-medium text-[#20243A]">Connected!</p>
                    <p className="mt-2 text-sm text-[#777D91]">
                      Your {oauthModal.provider === 'gmail' ? 'Gmail' : 'Outlook'}{' '}
                      account has been linked successfully.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
