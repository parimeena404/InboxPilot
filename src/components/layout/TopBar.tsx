import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  Check,
} from 'lucide-react';
import useStore from '@/store/useStore';
import { SearchInput } from '@/components/ui/SearchInput';

interface TopBarProps {
  title?: string;
  breadcrumb?: React.ReactNode;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inbox': 'Inbox',
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
    <header className="h-16 bg-white border-b border-[#E9EAF1] flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden p-2 -ml-2 rounded-lg text-[#777D91] hover:bg-[#F7F8FC] hover:text-[#20243A] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop collapse button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex p-2 -ml-2 rounded-lg text-[#777D91] hover:bg-[#F7F8FC] hover:text-[#20243A] transition-colors"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="w-5 h-5" />
        ) : (
          <PanelLeftClose className="w-5 h-5" />
        )}
      </button>

      {/* Title & Breadcrumb */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-lg font-semibold text-[#20243A] truncate">{pageTitle}</h1>
        {breadcrumb && (
          <div className="text-xs text-[#777D91]">{breadcrumb}</div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden sm:block w-64 lg:w-80">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search emails..."
        />
      </div>

      {/* Notification Bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg text-[#777D91] hover:bg-[#F7F8FC] hover:text-[#20243A] transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[#6558E8] text-[10px] font-bold text-white px-1">
              {unreadNotifCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E9EAF1] overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-[#E9EAF1] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#20243A]">Notifications</h3>
                {unreadNotifCount > 0 && (
                  <span className="text-xs text-[#6558E8] font-medium">
                    {unreadNotifCount} unread
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-sm text-[#777D91] text-center">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b border-[#E9EAF1] last:border-0 hover:bg-[#F7F8FC] transition-colors ${
                        !n.read ? 'bg-[#F7F8FC]/60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#6558E8] flex-shrink-0 mt-1.5" />
                        )}
                        <div className={`min-w-0 ${n.read ? 'ml-4' : ''}`}>
                          <p className="text-sm font-medium text-[#20243A] truncate">
                            {n.title}
                          </p>
                          <p className="text-xs text-[#777D91] mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-[#777D91]/60 mt-1">
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
        className="p-2 rounded-lg text-[#777D91] hover:bg-[#F7F8FC] hover:text-[#6558E8] transition-colors"
        title="AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {/* User Menu */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F8FC] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#6558E8] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : '?'}
          </div>
          <ChevronDown className="w-4 h-4 text-[#777D91] hidden sm:block" />
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E9EAF1] overflow-hidden z-50"
            >
              {user && (
                <div className="px-4 py-3 border-b border-[#E9EAF1]">
                  <p className="text-sm font-semibold text-[#20243A]">{user.name}</p>
                  <p className="text-xs text-[#777D91]">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#6558E8] bg-[#6558E8]/10 px-2 py-0.5 rounded-full capitalize">
                    {role}
                  </span>
                </div>
              )}
              <div className="py-1">
                <button
                  onClick={() => {
                    setRole(role === 'assistant' ? 'client' : 'assistant');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#20243A] hover:bg-[#F7F8FC] transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4 text-[#777D91]" />
                  Switch to {role === 'assistant' ? 'Client' : 'Assistant'}
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    // navigate to settings
                    window.location.hash = '#/settings';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#20243A] hover:bg-[#F7F8FC] transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#777D91]" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    resetDemo();
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#20243A] hover:bg-[#F7F8FC] transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-[#777D91]" />
                  Reset Demo
                </button>
                <div className="border-t border-[#E9EAF1] my-1" />
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
