import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
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
  Tag,
} from 'lucide-react'
import useStore from '@/store/useStore'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

export default function Landing() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleTryDemo = () => {
    login('assistant', true)
    navigate('/dashboard')
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white font-[Inter]">
      {/* ── Sticky Navbar ── */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-[#E9EAF1]'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6558E8]">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#20243A]">InboxPilot</span>
          </div>

          {/* Nav links */}
          <div className="hidden items-center gap-8 md:flex">
            <button
              onClick={() => scrollTo('features')}
              className="text-sm font-medium text-[#777D91] transition-colors hover:text-[#20243A]"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-sm font-medium text-[#777D91] transition-colors hover:text-[#20243A]"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className="text-sm font-medium text-[#777D91] transition-colors hover:text-[#20243A]"
            >
              Pricing
            </button>
          </div>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/onboarding')}
              className="rounded-lg border border-[#E9EAF1] bg-white px-4 py-2 text-sm font-medium text-[#20243A] transition-colors hover:bg-[#F7F8FC]"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/onboarding')}
              className="rounded-lg bg-[#6558E8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5548D5]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#6558E8]/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#6558E8]/5 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Pill */}
            <motion.div variants={fadeIn} custom={0} className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E9EAF1] bg-white px-4 py-1.5 text-sm font-medium text-[#6558E8] shadow-sm">
                <Sparkles className="h-4 w-4" />
                AI-powered email management
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeIn}
              custom={1}
              className="text-5xl font-bold leading-tight tracking-tight text-[#20243A] md:text-6xl"
            >
              Your inbox.{' '}
              <span className="bg-gradient-to-r from-[#6558E8] to-[#8B7CF7] bg-clip-text text-transparent">
                Under control.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeIn}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg text-[#777D91]"
            >
              AI-powered email management for personal assistants. Classify,
              prioritize, and respond to emails intelligently.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeIn}
              custom={3}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <button
                onClick={() => navigate('/onboarding')}
                className="group flex items-center gap-2 rounded-xl bg-[#6558E8] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#6558E8]/25 transition-all hover:bg-[#5548D5] hover:shadow-xl hover:shadow-[#6558E8]/30"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={handleTryDemo}
                className="group flex items-center gap-2 rounded-xl border border-[#E9EAF1] bg-white px-8 py-3.5 text-base font-semibold text-[#20243A] shadow-sm transition-all hover:border-[#6558E8]/30 hover:bg-[#F7F8FC]"
              >
                <Play className="h-4 w-4 text-[#6558E8]" />
                Try Demo
              </button>
            </motion.div>
          </motion.div>

          {/* ── Product Preview Mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="overflow-hidden rounded-2xl border border-[#E9EAF1] bg-white shadow-2xl shadow-[#6558E8]/10">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-[#E9EAF1] bg-[#F7F8FC] px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28CA42]" />
                <div className="mx-auto flex h-7 w-72 items-center justify-center rounded-md bg-white px-3 text-xs text-[#777D91] border border-[#E9EAF1]">
                  app.inboxpilot.ai/dashboard
                </div>
              </div>

              {/* Mini dashboard */}
              <div className="flex">
                {/* Mini sidebar */}
                <div className="hidden w-48 flex-col gap-1 border-r border-[#E9EAF1] bg-[#151B2D] p-3 md:flex">
                  <div className="mb-3 flex items-center gap-2 px-2 py-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#6558E8]">
                      <Mail className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white">InboxPilot</span>
                  </div>
                  {['Dashboard', 'Inbox', 'Meetings', 'AI Assistant'].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                          i === 0
                            ? 'bg-white/10 font-medium text-white'
                            : 'text-white/50'
                        }`}
                      >
                        {i === 0 && <BarChart3 className="h-3 w-3" />}
                        {i === 1 && <Mail className="h-3 w-3" />}
                        {i === 2 && <Clock className="h-3 w-3" />}
                        {i === 3 && <Sparkles className="h-3 w-3" />}
                        {item}
                      </div>
                    )
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  {/* Stats row */}
                  <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      { label: 'Total Emails', value: '1,284', change: '+12%', icon: Mail },
                      { label: 'Needs Action', value: '23', change: '-8%', icon: Zap },
                      { label: 'AI Classified', value: '98.2%', change: '+2.4%', icon: Brain },
                      { label: 'Avg. Response', value: '14m', change: '-22%', icon: Clock },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-[#E9EAF1] bg-[#F7F8FC] p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#777D91]">{stat.label}</span>
                          <stat.icon className="h-3 w-3 text-[#6558E8]" />
                        </div>
                        <div className="mt-1 text-lg font-bold text-[#20243A]">{stat.value}</div>
                        <span className="text-[10px] text-green-500">{stat.change}</span>
                      </div>
                    ))}
                  </div>

                  {/* Email list */}
                  <div className="space-y-2">
                    {[
                      {
                        from: 'Sarah Chen',
                        subject: 'Q4 Budget Review - Needs Approval',
                        badge: 'Client',
                        badgeColor: 'bg-[#FFF3DE] text-amber-700',
                        time: '2m ago',
                        starred: true,
                        priority: 'high',
                      },
                      {
                        from: 'Marcus Webb',
                        subject: 'Re: Team Sync - Tomorrow at 3pm?',
                        badge: 'Assistant',
                        badgeColor: 'bg-[#E9F1FF] text-blue-700',
                        time: '15m ago',
                        starred: false,
                        priority: 'medium',
                      },
                      {
                        from: 'notifications@service.com',
                        subject: 'Your invoice #4521 is ready',
                        badge: 'No Reply',
                        badgeColor: 'bg-[#E8F7EE] text-green-700',
                        time: '1h ago',
                        starred: false,
                        priority: 'low',
                      },
                      {
                        from: 'Elena Rodriguez',
                        subject: 'Partnership Proposal - GlobalVentures',
                        badge: 'Review',
                        badgeColor: 'bg-[#F2EAFE] text-purple-700',
                        time: '3h ago',
                        starred: true,
                        priority: 'high',
                      },
                    ].map((email, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-[#E9EAF1] bg-white p-2.5 transition-colors hover:bg-[#F7F8FC]"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6558E8]/10">
                          <span className="text-xs font-semibold text-[#6558E8]">
                            {email.from[0]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-xs font-semibold text-[#20243A]">
                              {email.from}
                            </span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${email.badgeColor}`}
                            >
                              {email.badge}
                            </span>
                            {email.priority === 'high' && (
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            )}
                          </div>
                          <p className="truncate text-[11px] text-[#777D91]">
                            {email.subject}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {email.starred && (
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          )}
                          <span className="whitespace-nowrap text-[10px] text-[#777D91]">
                            {email.time}
                          </span>
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

      {/* ── Features ── */}
      <section id="features" className="bg-[#F7F8FC] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.span
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full bg-[#6558E8]/10 px-3 py-1 text-sm font-medium text-[#6558E8]"
            >
              Features
            </motion.span>
            <motion.h2
              variants={fadeIn}
              custom={1}
              className="mt-4 text-3xl font-bold text-[#20243A] md:text-4xl"
            >
              Everything you need to master your inbox
            </motion.h2>
            <motion.p
              variants={fadeIn}
              custom={2}
              className="mx-auto mt-4 max-w-xl text-[#777D91]"
            >
              Powerful AI tools designed specifically for personal assistants
              managing high-volume inboxes.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="mt-16 grid gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: Brain,
                title: 'Smart Classification',
                description:
                  'AI automatically sorts every email by who should respond — assistant, client, no-reply, or needs review. No rules to set up.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Users,
                title: 'Dual Workspace',
                description:
                  'Separate views for assistants and clients. Assistants manage, clients decide. Each role sees exactly what they need.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Sparkles,
                title: 'AI Insights',
                description:
                  'Instant summaries, action items, and suggested responses for every email thread. Make decisions in seconds, not minutes.',
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                custom={i}
                className="group rounded-2xl border border-[#E9EAF1] bg-white p-8 transition-all hover:shadow-lg hover:shadow-[#6558E8]/5 hover:border-[#6558E8]/20"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-[#20243A]">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-[#777D91]">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.span
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full bg-[#6558E8]/10 px-3 py-1 text-sm font-medium text-[#6558E8]"
            >
              How it Works
            </motion.span>
            <motion.h2
              variants={fadeIn}
              custom={1}
              className="mt-4 text-3xl font-bold text-[#20243A] md:text-4xl"
            >
              Up and running in minutes
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="relative mt-16 grid gap-12 md:grid-cols-3"
          >
            {/* Connector line */}
            <div className="absolute top-16 left-[16.6%] right-[16.6%] hidden h-0.5 bg-gradient-to-r from-[#6558E8]/20 via-[#6558E8]/40 to-[#6558E8]/20 md:block" />

            {[
              {
                step: '01',
                title: 'Connect your email',
                description:
                  'Link your Gmail or Outlook account with one click. Secure OAuth — we never see your password.',
                icon: MailOpen,
              },
              {
                step: '02',
                title: 'AI classifies your inbox',
                description:
                  'Our AI reads every thread and categorizes it: assistant tasks, client decisions, no-reply, or needs review.',
                icon: Brain,
              },
              {
                step: '03',
                title: 'Focus on what matters',
                description:
                  'Work through a curated queue with AI summaries and suggested actions. Handle emails 5× faster.',
                icon: CheckCircle2,
              },
            ].map((step, i) => (
              <motion.div key={step.step} variants={fadeIn} custom={i} className="text-center">
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6558E8] text-white shadow-lg shadow-[#6558E8]/25">
                  <step.icon className="h-7 w-7" />
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#6558E8] shadow ring-2 ring-[#6558E8]/20">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#20243A]">{step.title}</h3>
                <p className="mx-auto mt-3 max-w-xs leading-relaxed text-[#777D91]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="border-y border-[#E9EAF1] bg-[#F7F8FC] py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-6 md:flex-row md:gap-12"
        >
          {/* Avatar stack */}
          <motion.div variants={fadeIn} custom={0} className="flex -space-x-3">
            {['S', 'M', 'E', 'J', 'P'].map((letter, i) => (
              <div
                key={i}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-sm font-semibold text-white shadow-sm"
                style={{
                  backgroundColor: [
                    '#6558E8',
                    '#E85858',
                    '#58B4E8',
                    '#E8A858',
                    '#58E88B',
                  ][i],
                }}
              >
                {letter}
              </div>
            ))}
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#20243A] text-xs font-semibold text-white shadow-sm">
              +2k
            </div>
          </motion.div>

          <motion.div variants={fadeIn} custom={1}>
            <p className="text-center text-lg font-semibold text-[#20243A] md:text-left">
              Trusted by 2,000+ personal assistants
            </p>
            <div className="mt-1 flex items-center justify-center gap-1 md:justify-start">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-sm text-[#777D91]">4.9/5 average rating</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CTA Banner ── */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="rounded-3xl bg-gradient-to-br from-[#6558E8] to-[#4A3DCF] p-12 text-white shadow-2xl shadow-[#6558E8]/20 md:p-16"
          >
            <motion.h2
              variants={fadeIn}
              custom={0}
              className="text-3xl font-bold md:text-4xl"
            >
              Ready to take control of your inbox?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              custom={1}
              className="mx-auto mt-4 max-w-lg text-white/80"
            >
              Join thousands of personal assistants who save 2+ hours every day
              with InboxPilot.
            </motion.p>
            <motion.div
              variants={fadeIn}
              custom={2}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <button
                onClick={() => navigate('/onboarding')}
                className="group flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[#6558E8] shadow-lg transition-all hover:bg-white/90"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={handleTryDemo}
                className="flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                <Play className="h-4 w-4" />
                Try Demo
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E9EAF1] bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6558E8]">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#20243A]">InboxPilot</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#777D91]">
              <button onClick={() => scrollTo('features')} className="hover:text-[#20243A] transition-colors">
                Features
              </button>
              <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#20243A] transition-colors">
                How it Works
              </button>
              <button onClick={() => scrollTo('pricing')} className="hover:text-[#20243A] transition-colors">
                Pricing
              </button>
              <a href="#" className="hover:text-[#20243A] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#20243A] transition-colors">Terms</a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-[#777D91]">
              © {new Date().getFullYear()} InboxPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
