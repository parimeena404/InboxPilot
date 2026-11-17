import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lock,
} from 'lucide-react';
import useStore from '@/store/useStore';
import type { Role } from '@/types';

const STEPS = ['Welcome', 'Role', 'Email', 'Ready'] as const;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function Onboarding() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const connectAccount = useStore((s) => s.connectAccount);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role>('assistant');
  const [connectedProvider, setConnectedProvider] = useState<string | null>(null);

  // OAuth modal state
  const [oauthModal, setOauthModal] = useState<{
    open: boolean;
    provider: string;
    phase: 'authorizing' | 'connected';
  }>({ open: false, provider: '', phase: 'authorizing' });

  const goNext = () => {
    if (step === 1 && !useStore.getState().isAuthenticated) {
      login(selectedRole, false);
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    login(role, false);
    setTimeout(() => goNext(), 250);
  };

  const handleProviderClick = (provider: string) => {
    setOauthModal({ open: true, provider, phase: 'authorizing' });
    const email = provider === 'gmail' ? 'david.sterling@acmeventures.com' : 'executive@corporate.outlook.com';
    setTimeout(() => {
      setOauthModal((m) => ({ ...m, phase: 'connected' }));
      setConnectedProvider(provider);
      connectAccount(provider as 'gmail' | 'outlook', email);
      setTimeout(() => {
        setOauthModal({ open: false, provider: '', phase: 'authorizing' });
      }, 1000);
    }, 1200);
  };

  const handleFinish = () => {
    if (!useStore.getState().isAuthenticated) {
      login(selectedRole, false);
    }
    completeOnboarding();
    if (selectedRole === 'client') {
      navigate('/client');
    } else {
      navigate('/dashboard');
    }
  };

  const handleDemoMode = () => {
    login(selectedRole, true);
    if (selectedRole === 'client') {
      navigate('/client');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans selection:bg-accent/15 selection:text-ink">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-border bg-white px-6 py-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-sm shadow-accent/20">
            <Mail className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-ink tracking-tight">InboxPilot</span>
        </div>
        {step > 0 && step < STEPS.length - 1 && (
          <button
            onClick={goNext}
            className="text-xs font-semibold text-txt-secondary transition-colors hover:text-ink"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* ── Step indicator ── */}
      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 px-6 pt-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i < step
                  ? 'bg-accent text-white'
                  : i === step
                  ? 'bg-accent text-white ring-4 ring-accent/20'
                  : 'bg-border text-txt-secondary'
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`hidden h-0.5 w-12 sm:block ${
                  i < step ? 'bg-accent' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Step content ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* ─── Step 1: Welcome ─── */}
              {step === 0 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.35 }}
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-white shadow-accent/25 shadow-lg"
                  >
                    <Rocket className="h-8 w-8" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-ink heading-serif">
                    Welcome to InboxPilot
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm text-txt-secondary leading-relaxed">
                    Set up your executive workspace in under two minutes. Classify, prioritize, and delegate without clutter.
                  </p>
                  <button
                    onClick={goNext}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-accent/25 shadow-lg transition-all hover:bg-accent-hover hover:shadow-accent"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ─── Step 2: Choose Role ─── */}
              {step === 1 && (
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-ink heading-serif">Choose your workspace view</h2>
                  <p className="mx-auto mt-2 max-w-sm text-xs text-txt-secondary">
                    Select your primary operating perspective. You can switch between workspaces at any time.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {/* Assistant card */}
                    <button
                      onClick={() => handleRoleSelect('assistant')}
                      className={`group relative rounded-2xl border-2 p-5 text-left transition-all ${
                        selectedRole === 'assistant'
                          ? 'border-accent bg-accent/[0.04] shadow-card'
                          : 'border-border bg-white hover:border-accent/30 hover:shadow-card'
                      }`}
                    >
                      <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-bold text-ink">
                        Personal Assistant
                      </h3>
                      <p className="mt-1 text-xs text-txt-secondary leading-relaxed">
                        Triage incoming threads, draft automated replies, and route critical approvals to the client.
                      </p>
                      {selectedRole === 'assistant' && (
                        <div className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>

                    {/* Client card */}
                    <button
                      onClick={() => handleRoleSelect('client')}
                      className={`group relative rounded-2xl border-2 p-5 text-left transition-all ${
                        selectedRole === 'client'
                          ? 'border-accent bg-accent/[0.04] shadow-card'
                          : 'border-border bg-white hover:border-accent/30 hover:shadow-card'
                      }`}
                    >
                      <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <User className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-bold text-ink">Executive Client</h3>
                      <p className="mt-1 text-xs text-txt-secondary leading-relaxed">
                        A focused executive decision portal: approve term sheets, authorize budgets, and delegate in one click.
                      </p>
                      {selectedRole === 'client' && (
                        <div className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
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
                  <h2 className="text-2xl md:text-3xl font-bold text-ink heading-serif">
                    Connect your email account
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-xs text-txt-secondary">
                    Securely link your inbox via simulated OAuth. Zero plain-text credentials stored.
                  </p>

                  <div className="mt-8 space-y-3">
                    {/* Gmail */}
                    <button
                      onClick={() => handleProviderClick('gmail')}
                      disabled={connectedProvider === 'gmail'}
                      className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-all ${
                        connectedProvider === 'gmail'
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-border bg-white hover:border-accent/30 hover:shadow-card'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="h-5 w-5">
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
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-ink">Google Workspace (Gmail)</p>
                        <p className="text-[11px] text-txt-secondary">david.sterling@acmeventures.com</p>
                      </div>
                      {connectedProvider === 'gmail' ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <Check className="h-4 w-4" />
                          Connected
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-txt-secondary" />
                      )}
                    </button>

                    {/* Outlook */}
                    <button
                      onClick={() => handleProviderClick('outlook')}
                      disabled={connectedProvider === 'outlook'}
                      className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-4 text-left transition-all ${
                        connectedProvider === 'outlook'
                          ? 'border-emerald-300 bg-emerald-50/60'
                          : 'border-border bg-white hover:border-accent/30 hover:shadow-card'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="h-5 w-5">
                          <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.33.77.1.43.1.88zm-1.98-4.5v.1q-.23-.13-.5-.19-.25-.07-.53-.07-.59 0-1.05.21-.45.21-.78.56-.33.36-.51.83-.18.47-.18 1.01 0 .52.17.99.18.46.49.82.32.35.77.56.44.2.98.2.28 0 .55-.07.28-.08.5-.22v.12h1.52V7.54zm11.8 7.14h-2.12L13.76 12l1.82-2.67h2.12L15.5 12zm-4.72-9.24h1.83v9.24h-1.83zm-2.48 0h1.83v9.24h-1.83z" fill="#0078D4" />
                          <path d="M24 7.8v8.4a1.8 1.8 0 01-1.8 1.8H1.8A1.8 1.8 0 010 16.2V7.8A1.8 1.8 0 011.8 6h20.4A1.8 1.8 0 0124 7.8z" fill="#0078D4" opacity="0.15" />
                          <path d="M14.25 6h7.95A1.8 1.8 0 0124 7.8v8.4a1.8 1.8 0 01-1.8 1.8h-7.95V6z" fill="#0078D4" opacity="0.05" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-ink">Microsoft 365 (Outlook)</p>
                        <p className="text-[11px] text-txt-secondary">d.sterling@board-global.org</p>
                      </div>
                      {connectedProvider === 'outlook' ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <Check className="h-4 w-4" />
                          Connected
                        </div>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-txt-secondary" />
                      )}
                    </button>
                  </div>

                  {connectedProvider && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={goNext}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-2.5 text-xs font-semibold text-white shadow-accent/25 shadow-md transition-all hover:bg-accent-hover"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* ─── Step 4: Ready ─── */}
              {step === 3 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 18,
                      delay: 0.1,
                    }}
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg"
                  >
                    <Check className="h-8 w-8 text-white" />
                  </motion.div>

                  <h2 className="text-2xl md:text-3xl font-bold text-ink heading-serif">Workspace initialized!</h2>
                  <p className="mx-auto mt-2 max-w-sm text-xs text-txt-secondary">
                    Your simulated email feed and autonomous classification engine are ready.
                  </p>

                  <div className="mx-auto mt-6 max-w-xs space-y-2 text-left">
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-xs">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        {selectedRole === 'assistant' ? (
                          <Briefcase className="h-4 w-4 text-accent" />
                        ) : (
                          <User className="h-4 w-4 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-txt-secondary">Selected Role</p>
                        <p className="text-xs font-bold text-ink capitalize">
                          {selectedRole === 'assistant' ? 'Personal Assistant' : 'Executive Client'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-xs">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                        <Mail className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] text-txt-secondary">Connected Inbox</p>
                        <p className="text-xs font-bold text-ink capitalize">
                          {connectedProvider ? `${connectedProvider} (Connected)` : 'Preloaded Sample Inbox'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleFinish}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-accent/25 shadow-lg transition-all hover:bg-accent-hover hover:shadow-accent"
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
      <div className="border-t border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          {step > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-xs font-semibold text-txt-secondary transition-colors hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleDemoMode}
            className="text-xs font-semibold text-accent transition-colors hover:underline"
          >
            Launch instant demo mode →
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">
                  Connecting {oauthModal.provider === 'gmail' ? 'Google Workspace' : 'Microsoft 365'}
                </h3>
                <button
                  onClick={() =>
                    setOauthModal({ open: false, provider: '', phase: 'authorizing' })
                  }
                  className="rounded-lg p-1 text-txt-secondary hover:bg-canvas"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center text-center">
                {oauthModal.phase === 'authorizing' ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-accent" />
                    <p className="mt-3 text-xs font-bold text-ink">Simulating OAuth exchange…</p>
                    <p className="mt-1 text-[11px] text-txt-secondary">
                      Granting read-only mail metadata access
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                    >
                      <Check className="h-6 w-6" />
                    </motion.div>
                    <p className="mt-3 text-xs font-bold text-ink">Authorization Complete</p>
                    <p className="mt-1 text-[11px] text-txt-secondary">
                      Account synchronized and mapped to client desk.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
