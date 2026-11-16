import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Conversation, Classification, Role, User, ConnectedAccount, NotificationItem } from '@/types'
import { sampleConversations } from '@/data/emails'

export interface AppState {
  // Auth
  isAuthenticated: boolean
  user: User | null
  role: Role
  onboardingComplete: boolean

  // Data
  conversations: Conversation[]
  selectedConversationId: string | null
  searchQuery: string
  activeFilter: string
  sortBy: 'newest' | 'oldest' | 'priority'

  // UI
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  aiPanelOpen: boolean
  showToast: boolean
  toastMessage: string
  toastType: 'success' | 'error' | 'info'

  // Connected accounts & notifications
  connectedAccounts: ConnectedAccount[]
  notifications: NotificationItem[]

  // Actions
  login: (role?: Role, demoMode?: boolean) => void
  logout: () => void
  setRole: (role: Role) => void
  completeOnboarding: () => void
  selectConversation: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setActiveFilter: (f: string) => void
  setSortBy: (s: 'newest' | 'oldest' | 'priority') => void
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  toggleAiPanel: () => void
  toggleStar: (id: string) => void
  archiveConversation: (id: string) => void
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  reclassify: (id: string, c: Classification) => void
  markClientHandled: (id: string) => void
  showToastMessage: (msg: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
  connectAccount: (provider: 'gmail' | 'outlook', email: string) => void
  disconnectAccount: (id: string) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  resetDemo: () => void
  addReplyMessage: (convId: string, text: string) => void
}

const defaultUser: User = {
  id: 'usr-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@company.com',
  role: 'assistant',
}

const defaultAccounts: ConnectedAccount[] = [
  {
    id: 'acc-1',
    provider: 'gmail',
    email: 'david.sterling@acmeventures.com',
    name: 'David Sterling (Executive)',
    connected: true,
    lastSync: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'acc-2',
    provider: 'outlook',
    email: 'd.sterling@board-global.org',
    name: 'David Sterling (Board Directorship)',
    connected: true,
    lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
]

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Series B Term Sheet Flagged',
    message: 'Marcus Webb from Apex Ventures requires founder signature before 4 PM EST.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
    type: 'action',
  },
  {
    id: 'notif-2',
    title: 'Board Meeting Date Proposed',
    message: 'Elena Rostova proposed Oct 15 or Oct 20 for Q3 Board Meeting.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: false,
    type: 'info',
  },
  {
    id: 'notif-3',
    title: 'Account Sync Complete',
    message: 'Gmail (david.sterling@acmeventures.com) synced 28 conversations.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: true,
    type: 'success',
  },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true,
      user: defaultUser,
      role: 'assistant',
      onboardingComplete: true,
      conversations: sampleConversations,
      selectedConversationId: null,
      searchQuery: '',
      activeFilter: 'all',
      sortBy: 'newest',
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      aiPanelOpen: false,
      showToast: false,
      toastMessage: '',
      toastType: 'info',
      connectedAccounts: defaultAccounts,
      notifications: defaultNotifications,

      login: (role = 'assistant', demoMode = true) => {
        set({
          isAuthenticated: true,
          user: { ...defaultUser, role },
          role,
          onboardingComplete: demoMode ? true : get().onboardingComplete,
        })
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          onboardingComplete: false,
          selectedConversationId: null,
        })
      },

      setRole: (role: Role) => {
        set((s) => ({
          role,
          user: s.user ? { ...s.user, role } : { ...defaultUser, role },
          selectedConversationId: null,
        }))
      },

      completeOnboarding: () => set({ onboardingComplete: true }),

      selectConversation: (id) => {
        set({ selectedConversationId: id })
        if (id) {
          set((s) => ({
            conversations: s.conversations.map((c) =>
              c.id === id
                ? { ...c, messages: c.messages.map((m) => ({ ...m, isRead: true })) }
                : c
            ),
          }))
        }
      },

      setSearchQuery: (q) => set({ searchQuery: q }),
      setActiveFilter: (f) => set({ activeFilter: f }),
      setSortBy: (s) => set({ sortBy: s }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
      toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),

      toggleStar: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, isStarred: !c.isStarred } : c
          ),
        })),

      archiveConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, isArchived: !c.isArchived } : c
          ),
          selectedConversationId: s.selectedConversationId === id ? null : s.selectedConversationId,
        })),

      markAsRead: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? { ...c, messages: c.messages.map((m) => ({ ...m, isRead: true })) }
              : c
          ),
        })),

      markAsUnread: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? {
                  ...c,
                  messages: c.messages.map((m, i) =>
                    i === c.messages.length - 1 ? { ...m, isRead: false } : m
                  ),
                }
              : c
          ),
        })),

      reclassify: (id, classification) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? { ...c, classification, aiInsights: { ...c.aiInsights, classification } }
              : c
          ),
        })),

      markClientHandled: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? {
                  ...c,
                  classification: 'noreply' as Classification,
                  aiInsights: {
                    ...c.aiInsights,
                    classification: 'noreply' as Classification,
                    suggestedAction: 'Marked as handled by client',
                  },
                }
              : c
          ),
        })),

      showToastMessage: (msg, type = 'info') =>
        set({ showToast: true, toastMessage: msg, toastType: type }),

      hideToast: () => set({ showToast: false }),

      connectAccount: (provider, email) =>
        set((s) => ({
          connectedAccounts: [
            ...s.connectedAccounts,
            {
              id: `acc-${Date.now()}`,
              provider,
              email,
              name: email.split('@')[0],
              connected: true,
              lastSync: new Date().toISOString(),
            },
          ],
        })),

      disconnectAccount: (id) =>
        set((s) => ({
          connectedAccounts: s.connectedAccounts.filter((a) => a.id !== id),
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      clearNotifications: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      resetDemo: () => {
        set({
          conversations: sampleConversations,
          selectedConversationId: null,
          connectedAccounts: defaultAccounts,
          notifications: defaultNotifications,
          searchQuery: '',
          activeFilter: 'all',
          role: 'assistant',
          user: defaultUser,
        })
      },

      addReplyMessage: (convId, text) => {
        const newMessage = {
          id: `msg-reply-${Date.now()}`,
          from: { name: 'Alex Morgan (Assistant)', email: 'alex.morgan@company.com' },
          to: [{ name: 'Client/Recipient', email: 'recipient@company.com' }],
          subject: 'Re: Response',
          body: text,
          timestamp: new Date().toISOString(),
          isRead: true,
        }
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  lastActivity: new Date().toISOString(),
                }
              : c
          ),
        }))
      },
    }),
    {
      name: 'inboxpilot-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        role: state.role,
        onboardingComplete: state.onboardingComplete,
        conversations: state.conversations,
        connectedAccounts: state.connectedAccounts,
        notifications: state.notifications,
      }),
    }
  )
)

export default useStore
