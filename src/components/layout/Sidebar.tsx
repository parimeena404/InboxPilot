import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  LayoutDashboard,
  Star,
  AlertCircle,
  Clock,
  UserCheck,
  UserCog,
  CheckCircle2,
  HelpCircle,
  Calendar,
  CheckSquare,
  Archive,
  Sparkles,
  Link2,
  Settings,
  ChevronDown,
  X,
  Focus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import useStore from '@/store/useStore';

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
  filter?: string;
  badgeKey?: string;
}

interface NavSection {
  header: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    header: 'OVERVIEW',
    items: [
      { label: 'Command Center', icon: LayoutDashboard, to: '/dashboard' },
      { label: 'Focus Mode', icon: Focus, to: '/focus' },
      { label: 'All Emails', icon: Mail, to: '/inbox', badgeKey: 'all' },
      { label: 'Important', icon: Star, to: '/inbox?filter=important', filter: 'important', badgeKey: 'important' },
    ],
  },
  {
    header: 'AI TRIAGE',
    items: [
      { label: 'Assistant to Reply', icon: UserCheck, to: '/inbox?filter=assistant', filter: 'assistant', badgeKey: 'assistant' },
      { label: 'Client to Reply', icon: UserCog, to: '/inbox?filter=client', filter: 'client', badgeKey: 'client' },
      { label: 'No Reply Needed', icon: CheckCircle2, to: '/inbox?filter=noreply', filter: 'noreply', badgeKey: 'noreply' },
      { label: 'Needs Review', icon: HelpCircle, to: '/inbox?filter=review', filter: 'review', badgeKey: 'review' },
    ],
  },
  {
    header: 'WORKSPACE',
    items: [
      { label: 'Meetings', icon: Calendar, to: '/meetings' },
      { label: 'Completed', icon: CheckSquare, to: '/inbox?filter=completed', filter: 'completed', badgeKey: 'completed' },
      { label: 'Archived', icon: Archive, to: '/inbox?filter=archived', filter: 'archived', badgeKey: 'archived' },
    ],
  },
];

const bottomItems: NavItem[] = [
  { label: 'AI Assistant', icon: Sparkles, to: '/ai-assistant' },
  { label: 'Connections', icon: Link2, to: '/accounts' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

function useBadgeCounts(): Record<string, number> {
  const conversations = useStore((s) => s.conversations);

  return React.useMemo(() => {
    const counts: Record<string, number> = {};
    const unread = conversations.filter(
      (c) => c.messages.some((m) => !m.isRead) && !c.isArchived
    );
    counts.all = unread.length;
    counts.important = unread.filter((c) => c.isStarred).length;
    counts.action = unread.filter((c) => c.priority === 'high').length;
    counts.waiting = unread.filter((c) => c.priority === 'medium').length;
    counts.assistant = conversations.filter(
      (c) => c.classification === 'assistant' && c.messages.some((m) => !m.isRead) && !c.isArchived
    ).length;
    counts.client = conversations.filter(
      (c) => c.classification === 'client' && c.messages.some((m) => !m.isRead) && !c.isArchived
    ).length;
    counts.noreply = conversations.filter(
      (c) => c.classification === 'noreply' && c.messages.some((m) => !m.isRead) && !c.isArchived
    ).length;
    counts.review = conversations.filter(
      (c) => c.classification === 'review' && c.messages.some((m) => !m.isRead) && !c.isArchived
    ).length;
    counts.completed = 0;
    counts.archived = conversations.filter((c) => c.isArchived).length;
    return counts;
  }, [conversations]);
}

function isItemActive(item: NavItem, pathname: string, searchParams: URLSearchParams): boolean {
  const itemUrl = new URL(item.to, 'http://x');
  const itemPath = itemUrl.pathname;
  const itemFilter = new URLSearchParams(itemUrl.search).get('filter');

  if (itemPath !== pathname) return false;

  const currentFilter = searchParams.get('filter');
  if (itemFilter) return currentFilter === itemFilter;
  if (itemPath === '/inbox') return !currentFilter;
  return true;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useStore((s) => s.mobileSidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const toggleMobileSidebar = useStore((s) => s.toggleMobileSidebar);
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const user = useStore((s) => s.user);
  const badges = useBadgeCounts();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [roleSwitcherOpen, setRoleSwitcherOpen] = React.useState(false);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-white font-bold text-[15px] tracking-tight whitespace-nowrap">
            InboxPilot
          </span>
        )}
      </div>

      {/* Workspace Switcher */}
      {!sidebarCollapsed && (
        <div className="px-3 mb-4" ref={roleSwitcherRef}>
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-[13px] text-white/80"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${role === 'assistant' ? 'bg-accent' : 'bg-amber-400'}`} />
              <span className="capitalize font-medium">{role} Workspace</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${roleSwitcherOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {roleSwitcherOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="mt-1 bg-white/[0.06] rounded-lg overflow-hidden">
                  {(['assistant', 'client'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        setRoleSwitcherOpen(false);
                        navigate(r === 'client' ? '/client' : '/dashboard');
                      }}
                      className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors capitalize flex items-center gap-2 ${
                        role === r
                          ? 'text-accent-light bg-white/[0.04]'
                          : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${r === 'assistant' ? 'bg-accent' : 'bg-amber-400'}`} />
                      {r} Workspace
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5">
        {navSections.map((section) => (
          <div key={section.header}>
            {!sidebarCollapsed && (
              <h3 className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.1em] px-3 mb-2">
                {section.header}
              </h3>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item, location.pathname, searchParams);
                const count = item.badgeKey ? badges[item.badgeKey] : 0;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => {
                        if (mobileSidebarOpen) toggleMobileSidebar();
                      }}
                      className={() =>
                        `flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 relative ${
                          active
                            ? 'bg-accent text-white shadow-sm'
                            : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`
                      }
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-[16px] h-[16px] flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {count > 0 && (
                            <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                              active ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'
                            }`}>
                              {count}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && count > 0 && (
                        <span className="absolute right-2 top-1 w-1.5 h-1.5 rounded-full bg-accent-light" />
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/[0.06] px-3 pt-3 pb-3 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item, location.pathname, searchParams);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (mobileSidebarOpen) toggleMobileSidebar();
              }}
              className={() =>
                `flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                } ${sidebarCollapsed ? 'justify-center' : ''}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="w-[16px] h-[16px] flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Profile */}
        {user && (
          <div
            className={`flex items-center gap-2.5 px-3 py-2.5 mt-2 rounded-lg bg-white/[0.04] ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-accent/80 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/90 truncate">{user.name}</p>
                <p className="text-[10px] text-white/30 capitalize">{role}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 248 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-sidebar overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={toggleMobileSidebar}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-0 bottom-0 w-[260px] z-50 bg-sidebar md:hidden flex flex-col"
            >
              <button
                onClick={toggleMobileSidebar}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
