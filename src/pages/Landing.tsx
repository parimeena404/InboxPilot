import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Brain,
  Users,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  CheckCircle2,
  Clock,
  MailOpen,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  Focus,
  Check,
  Layers,
} from 'lucide-react';
import useStore from '@/store/useStore';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Landing() {
  const navigate = useNavigate();
  const login = useStore((s) => s.login);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleTryDemo = () => {
    login('assistant', true);
    navigate('/dashboard');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-canvas font-sans selection:bg-accent/15 selection:text-ink">
      {/* ── Sticky Navbar ── */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-xs border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-accent/20 shadow-sm">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-ink">InboxPilot</span>
          </div>

          {/* Nav links */}
          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => scrollTo('features')}
              className="text-xs font-semibold uppercase tracking-wider text-txt-secondary transition-colors hover:text-ink"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-xs font-semibold uppercase tracking-wider text-txt-secondary transition-colors hover:text-ink"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className="text-xs font-semibold uppercase tracking-wider text-txt-secondary transition-colors hover:text-ink"
            >
              Enterprise
            </button>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/onboarding')}
              className="rounded-lg border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/onboarding')}
              className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-hover hover:shadow-accent"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Pill */}
            <motion.div variants={fadeIn} custom={0} className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold text-accent shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
                Intelligent Executive Email Management
              </span>
            </motion.div>

            {/* Headline with Editorial Serif */}
            <motion.h1
              variants={fadeIn}
              custom={1}
              className="text-5xl font-bold leading-[1.12] tracking-tight text-ink md:text-6xl lg:text-7xl heading-serif max-w-4xl mx-auto"
            >
              Your inbox. <br className="hidden sm:inline" />
              <span className="italic font-normal">Decisively</span> under control.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeIn}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-txt-secondary leading-relaxed"
            >
              Engineered for executive assistants and high-output leaders. Autonomous triage, four-tier classification, and smart delegation between assistant desk and client portal.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeIn}
              custom={3}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                onClick={() => navigate('/onboarding')}
                className="group flex items-center gap-2 rounded-xl bg-accent px-7 py-3 text-sm font-semibold text-white shadow-accent/25 shadow-lg transition-all hover:bg-accent-hover hover:shadow-accent"
              >
                Start Onboarding
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={handleTryDemo}
                className="group flex items-center gap-2 rounded-xl border border-border bg-white px-7 py-3 text-sm font-semibold text-ink shadow-xs transition-all hover:border-accent/40 hover:bg-canvas"
              >
                <Play className="h-3.5 w-3.5 text-accent" />
                Launch Live Demo
              </button>
            </motion.div>
          </motion.div>

          {/* ── Product Preview Mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto mt-14 max-w-5xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-panel">
              {/* Window Bar */}
              <div className="flex items-center gap-2 border-b border-border bg-canvas/80 px-4 py-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28CA42]" />
                <div className="mx-auto flex h-6 w-80 items-center justify-center rounded-md bg-white px-3 text-[11px] text-txt-secondary border border-border/80 font-mono">
                  app.inboxpilot.ai/command-center
                </div>
              </div>

              {/* Mockup Dashboard Body */}
              <div className="flex text-left">
                {/* Mini sidebar */}
                <div className="hidden w-48 flex-col gap-1 border-r border-border bg-sidebar p-3 md:flex">
                  <div className="mb-3 flex items-center gap-2 px-2 py-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-accent">
                      <Mail className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white">InboxPilot</span>
                  </div>
                  {[
                    { name: 'Command Center', icon: BarChart3, active: true },
                    { name: 'Focus Mode', icon: Focus, active: false },
                    { name: 'Inbox (28)', icon: Mail, active: false },
                    { name: 'Meetings', icon: Clock, active: false },
                    { name: 'AI Copilot', icon: Sparkles, active: false },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                        item.active
                          ? 'bg-accent text-white'
                          : 'text-white/50'
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.name}
                    </div>
                  ))}
                </div>

                {/* Main mini-content */}
                <div className="flex-1 p-5 bg-canvas/40 space-y-4">
                  {/* Executive Briefing banner in preview */}
                  <div className="p-3.5 rounded-xl bg-white border border-border shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-ink">AI Daily Briefing: Inbox under control</p>
                        <p className="text-[11px] text-txt-secondary">3 client approvals pending · 4 assistant replies ready</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
                      Live
                    </span>
                  </div>

                  {/* Quick emails preview */}
                  <div className="space-y-2">
                    {[
                      {
                        from: 'Marcus Webb (Apex Ventures)',
                        subject: 'Series B Term Sheet Flagged for Signature',
                        badge: 'Client to Reply',
                        color: 'bg-amber-50 text-amber-800 border-amber-200',
                        time: '12m ago',
                      },
                      {
                        from: 'Elena Rostova (Board Secretary)',
                        subject: 'Proposed Q3 Board Meeting Coordinates',
                        badge: 'Assistant to Reply',
                        color: 'bg-blue-50 text-blue-800 border-blue-200',
                        time: '45m ago',
                      },
                      {
                        from: 'AWS Cloud Notifications',
                        subject: 'Monthly Compute Billing Receipt #8820',
                        badge: 'No Reply Needed',
                        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        time: '2h ago',
                      },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-border shadow-xs text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="font-semibold text-ink truncate">{row.from}</p>
                          <p className="text-txt-secondary truncate mt-0.5">{row.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${row.color}`}>
                            {row.badge}
                          </span>
                          <span className="text-[10px] text-txt-secondary/60">{row.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section id="features" className="py-24 border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Core Architecture
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-ink heading-serif">
              Built for high-stakes executive operations
            </h2>
            <p className="mt-3 text-sm text-txt-secondary leading-relaxed">
              InboxPilot removes communication friction between personal assistants and their executives through dedicated workspaces and transparent AI reasoning.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Brain,
                title: 'Four-Tier AI Classification',
                description:
                  'Every thread is autonomously analyzed and triaged into Assistant to Reply, Client Decisions, No Reply Needed, or Needs Review — without complex manual rule maintenance.',
              },
              {
                icon: Focus,
                title: 'Smart Focus Mode',
                description:
                  'Assistants review emails one conversation at a time with instant context, synthesized background, and one-click execution buttons.',
              },
              {
                icon: Shield,
                title: 'Dual Workspace Portal',
                description:
                  'Executives receive a clutter-free decision portal showing only matters requiring signatures, budget approvals, and strategic sign-offs.',
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="card p-7 hover:border-accent/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-5 group-hover:bg-accent group-hover:text-white transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-ink mb-2">{feature.title}</h3>
                <p className="text-xs text-txt-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow Steps ── */}
      <section id="how-it-works" className="py-24 border-t border-border bg-canvas">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              End-to-End Flow
            </span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-ink heading-serif">
              How executive desks operate with InboxPilot
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Account Sync & Ingestion',
                description: 'Connect simulated Gmail and Outlook enterprise accounts in seconds with zero credential exposure.',
              },
              {
                step: '02',
                title: 'Autonomous Classification & Trail',
                description: 'AI inspects detected intent, urgency signals, and phrases, logging an inspectable decision trail.',
              },
              {
                step: '03',
                title: 'Execution & Executive Hand-Off',
                description: 'Assistant dispatches simulated replies; high-stakes decisions surface in the client decision portal.',
              },
            ].map((step, i) => (
              <div key={step.step} className="card p-6 bg-white relative">
                <span className="text-3xl font-extrabold text-accent/20 heading-serif">
                  {step.step}
                </span>
                <h3 className="text-base font-bold text-ink mt-3 mb-2">{step.title}</h3>
                <p className="text-xs text-txt-secondary leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section id="pricing" className="py-20 border-t border-border bg-ink text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold heading-serif">
            Elevate your communication operations today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 leading-relaxed">
            Experience the full competitive product demo or onboard your executive workspace.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/onboarding')}
              className="rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-accent/30 shadow-lg hover:bg-accent-hover transition-all"
            >
              Get Started Free
            </button>
            <button
              onClick={handleTryDemo}
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
            >
              Try Interactive Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-txt-secondary">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-white font-bold text-[10px]">
              IP
            </div>
            <span className="font-bold text-ink">InboxPilot</span>
            <span>· Intelligent Executive Email Management</span>
          </div>
          <div>© {new Date().getFullYear()} InboxPilot Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
