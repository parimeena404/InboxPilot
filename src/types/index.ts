export type Classification = 'assistant' | 'client' | 'noreply' | 'review'
export type Priority = 'high' | 'medium' | 'low'
export type Role = 'assistant' | 'client'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: Role
}

export interface EmailMessage {
  id: string
  from: Contact
  to: Contact[]
  cc?: Contact[]
  subject: string
  body: string
  timestamp: string
  isRead: boolean
  attachments?: Attachment[]
}

export interface Contact {
  name: string
  email: string
  avatar?: string
}

export interface Attachment {
  name: string
  size: string
  type: string
}

export interface Conversation {
  id: string
  subject: string
  messages: EmailMessage[]
  classification: Classification
  priority: Priority
  isStarred: boolean
  isArchived: boolean
  labels: string[]
  aiInsights: AIInsights
  lastActivity: string
  clientName?: string
}

export interface AIInsights {
  classification: Classification
  confidence: number
  reasoning: string
  suggestedAction: string
  summary: string
  requiresResponse: boolean
  actionItems?: string[]
}

export interface ConnectedAccount {
  id: string
  provider: 'gmail' | 'outlook'
  email: string
  name: string
  connected: boolean
  lastSync?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'action' | 'success' | 'warning'
}
