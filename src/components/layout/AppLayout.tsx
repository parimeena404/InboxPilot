import React from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Toast } from '@/components/ui/Toast';
import useStore from '@/store/useStore';

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

const AppLayout: React.FC = () => {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const pageTitle = filter
    ? filterTitles[filter] || 'Inbox'
    : routeTitles[location.pathname] || 'InboxPilot';

  const breadcrumb =
    filter && location.pathname === '/inbox' ? (
      <span>
        Inbox <span className="mx-1">/</span> {filterTitles[filter] || filter}
      </span>
    ) : undefined;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <motion.div
        animate={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768
            ? sidebarCollapsed
              ? 72
              : 260
            : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-col min-h-screen"
      >
        {/* TopBar */}
        <TopBar title={pageTitle} breadcrumb={breadcrumb} />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </motion.div>

      {/* Toast */}
      <Toast />
    </div>
  );
};

export default AppLayout;
