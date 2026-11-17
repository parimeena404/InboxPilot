import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Sparkles,
  ChevronDown,
  Settings,
  LogOut,
  ArrowLeftRight,
  RotateCcw,
} from 'lucide-react';
import useStore from '@/store/useStore';
import { SearchInput } from '@/components/ui/SearchInput';

interface TopBarProps {
  title?: string;
  breadcrumb?: React.ReactNode;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/inbox': 'Inbox',
  '/focus': 'Focus Mode',
  '/meetings': 'Meetings',
  '/ai-assistant': 'AI Assistant',
  '/accounts': 'Connected Accounts',
  '/settings': 'Settings',
};

const filterTitles: Record<string, string> = {
  important: 'Important',
  action: 'Action Required',
  waiting: 'Waiting',
  assistant: 'Assistant to Reply',
  client: 'Client to Reply',
  noreply: 'No Reply Needed',
  review: 'Needs Review',
  completed: 'Completed',
  archived: 'Archived',
};

const TopBar: React.FC<TopBarProps> = ({ title: titleProp, breadcrumb }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');

  const toggleMobileSidebar = useStore((s) => s.toggleMobileSidebar);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const toggleAiPanel = useStore((s) => s.toggleAiPanel);
  const notifications = useStore((s) => s.notifications);
  const markNotificationRead = useStore((s) => s.markNotificationRead);
  const user = useStore((s) => s.user);
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);
  const logout = useStore((s) => s.logout);
  const resetDemo = useStore((s) => s.resetDemo);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const pageTitle =
    titleProp ||
    (filter ? filterTitles[filter] : routeTitles[location.pathname]) ||
    'InboxPilot';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-border flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden p-2 -ml-2 rounded-lg text-txt-secondary hover:bg-canvas hover:text-txt-primary transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop collapse button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex p-1.5 -ml-1.5 rounded-lg text-txt-secondary hover:bg-canvas hover:text-txt-primary transition-colors"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="w-4.5 h-4.5" />
        ) : (
          <PanelLeftClose className="w-4.5 h-4.5" />
        )}
      </button>

      {/* Title & Breadcrumb */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-[15px] font-semibold text-txt-primary truncate">{pageTitle}</h1>
        {breadcrumb && (
          <div className="text-xs text-txt-secondary">{breadcrumb}</div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden sm:block w-56 lg:w-72">
        <SearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            if (location.pathname !== '/inbox' && val) {
              navigate('/inbox');
            }
          }}
          placeholder="Search emails..."
        />
      </div>

      {/* Notification Bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg text-txt-secondary hover:bg-canvas hover:text-txt-primary transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white px-0.5">
              {unreadNotifCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-panel border border-border overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-txt-primary">Notifications</h3>
                {unreadNotifCount > 0 && (
                  <span className="text-[11px] text-accent font-medium">
                    {unreadNotifCount} unread
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-txt-secondary text-center">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-canvas transition-colors ${
                        !n.read ? 'bg-accent/[0.03]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                        )}
                        <div className={`min-w-0 ${n.read ? 'ml-3.5' : ''}`}>
                          <p className="text-[13px] font-medium text-txt-primary truncate">
                            {n.title}
                          </p>
                          <p className="text-xs text-txt-secondary mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-txt-secondary/50 mt-1">
                            {new Date(n.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Shortcut */}
      <button
        onClick={toggleAiPanel}
        className="p-2 rounded-lg text-txt-secondary hover:bg-accent/[0.08] hover:text-accent transition-colors"
        title="AI Assistant"
      >
        <Sparkles className="w-[18px] h-[18px]" />
      </button>

      {/* User Menu */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-canvas transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {user
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : '?'}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-txt-secondary hidden sm:block" />
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-panel border border-border overflow-hidden z-50"
            >
              {user && (
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-txt-primary">{user.name}</p>
                  <p className="text-xs text-txt-secondary">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded capitalize">
                    {role}
                  </span>
                </div>
              )}
              <div className="py-1">
                <button
                  onClick={() => {
                    const nextRole = role === 'assistant' ? 'client' : 'assistant';
                    setRole(nextRole);
                    setUserMenuOpen(false);
                    navigate(nextRole === 'client' ? '/client' : '/dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-txt-primary hover:bg-canvas transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4 text-txt-secondary" />
                  Switch to {role === 'assistant' ? 'Client' : 'Assistant'}
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-txt-primary hover:bg-canvas transition-colors"
                >
                  <Settings className="w-4 h-4 text-txt-secondary" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    resetDemo();
                    setUserMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-txt-primary hover:bg-canvas transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-txt-secondary" />
                  Reset Demo
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default TopBar;
