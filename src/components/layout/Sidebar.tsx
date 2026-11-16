import React, { useRef, useEffect } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
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
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
      { label: 'All Emails', icon: Mail, to: '/inbox', badgeKey: 'all' },
      { label: 'Important', icon: Star, to: '/inbox?filter=important', filter: 'important', badgeKey: 'important' },
      { label: 'Action Required', icon: AlertCircle, to: '/inbox?filter=action', filter: 'action', badgeKey: 'action' },
      { label: 'Waiting', icon: Clock, to: '/inbox?filter=waiting', filter: 'waiting', badgeKey: 'waiting' },
    ],
  },
  {
    header: 'SMART INBOX',
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
  { label: 'Connected Accounts', icon: Link2, to: '/accounts' },
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
  // For "/inbox" with no filter, only active if no filter param
  if (itemPath === '/inbox') return !currentFilter;
  return true;
}

const Sidebar: React.FC = () => {
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
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Mail className="w-7 h-7 text-[#6558E8] flex-shrink-0" />
        {!sidebarCollapsed && (
          <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
            InboxPilot
          </span>
        )}
      </div>

      {/* Workspace Switcher */}
      {!sidebarCollapsed && (
        <div className="px-3 mb-3" ref={roleSwitcherRef}>
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/80"
          >
            <span className="capitalize">{role} View</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${roleSwitcherOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {roleSwitcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="mt-1 bg-[#1e2540] rounded-lg overflow-hidden border border-white/10"
              >
                {(['assistant', 'client'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors capitalize ${
                      role === r
                        ? 'text-[#6558E8] bg-white/5'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {r} View
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-5 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.header}>
            {!sidebarCollapsed && (
              <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-1.5">
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
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-[#6558E8] text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`
                      }
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {count > 0 && (
                            <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold text-white px-1.5">
                              {count}
                            </span>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && count > 0 && (
                        <span className="absolute right-1.5 top-0.5 w-2 h-2 rounded-full bg-[#6558E8]" />
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
      <div className="border-t border-white/10 px-3 pt-3 pb-2 space-y-0.5">
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
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#6558E8] text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                } ${sidebarCollapsed ? 'justify-center' : ''}`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {/* Profile */}
        {user && (
          <div
            className={`flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg bg-white/5 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#6558E8] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-[11px] text-white/40 capitalize">{role}</p>
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
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-[#151B2D] overflow-hidden"
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
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-[#151B2D] md:hidden flex flex-col"
            >
              <button
                onClick={toggleMobileSidebar}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
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
