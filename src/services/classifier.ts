import type { Conversation, AIInsights, Classification } from '@/types'

interface KeywordRule {
  keywords: string[]
  weight: number
}

const classificationRules: Record<Classification, KeywordRule[]> = {
  assistant: [
    { keywords: ['schedule', 'scheduling', 'reschedule'], weight: 0.8 },
    { keywords: ['meeting', 'sync', 'standup', 'call'], weight: 0.7 },
    { keywords: ['calendar', 'availability'], weight: 0.75 },
    { keywords: ['book', 'booking', 'reservation'], weight: 0.7 },
    { keywords: ['travel', 'flight', 'hotel', 'itinerary'], weight: 0.65 },
    { keywords: ['invoice', 'payment', 'billing'], weight: 0.6 },
    { keywords: ['coordinate', 'coordination', 'arrange'], weight: 0.7 },
    { keywords: ['follow up', 'follow-up', 'followup', 'checking in'], weight: 0.65 },
    { keywords: ['reminder', 'remind', 'don\'t forget'], weight: 0.7 },
  ],
  client: [
    { keywords: ['approve', 'approval', 'approved'], weight: 0.85 },
    { keywords: ['decision', 'decide'], weight: 0.8 },
    { keywords: ['authorize', 'authorization'], weight: 0.85 },
    { keywords: ['sign', 'signature', 'signing'], weight: 0.8 },
    { keywords: ['confidential', 'sensitive', 'private'], weight: 0.7 },
    { keywords: ['strategic', 'strategy'], weight: 0.75 },
    { keywords: ['partnership', 'partner'], weight: 0.7 },
    { keywords: ['investment', 'investor', 'funding'], weight: 0.8 },
    { keywords: ['contract', 'agreement', 'terms'], weight: 0.85 },
    { keywords: ['board', 'board meeting', 'directors'], weight: 0.75 },
    { keywords: ['keynote', 'speaking', 'speaker'], weight: 0.7 },
  ],
  noreply: [
    { keywords: ['noreply', 'no-reply', 'donotreply', 'do-not-reply'], weight: 0.95 },
    { keywords: ['automated', 'automatic', 'auto-generated'], weight: 0.9 },
    { keywords: ['notification', 'alert'], weight: 0.7 },
    { keywords: ['newsletter', 'digest', 'weekly update'], weight: 0.85 },
    { keywords: ['unsubscribe'], weight: 0.9 },
    { keywords: ['receipt', 'order confirmation'], weight: 0.8 },
    { keywords: ['confirmation', 'confirmed'], weight: 0.6 },
  ],
  review: [
    { keywords: ['review', 'feedback', 'comments'], weight: 0.75 },
    { keywords: ['draft', 'revision', 'revise'], weight: 0.7 },
    { keywords: ['update', 'status', 'progress'], weight: 0.6 },
    { keywords: ['report', 'analysis', 'findings'], weight: 0.65 },
    { keywords: ['proposal', 'plan', 'roadmap'], weight: 0.7 },
    { keywords: ['document', 'documentation', 'doc'], weight: 0.6 },
  ],
}

const suggestedActions: Record<Classification, string[]> = {
  assistant: [
    'Schedule or confirm the meeting on behalf of the client',
    'Coordinate travel arrangements and send confirmation',
    'Process the invoice and file for records',
    'Send follow-up reminder to the relevant parties',
    'Add event to calendar and prepare briefing notes',
  ],
  client: [
    'Flag for client review — requires personal decision',
    'Escalate to client — approval or signature needed',
    'Prepare summary and forward to client for action',
    'Draft response options for client consideration',
  ],
  noreply: [
    'Archive — no action required',
    'File for records — automated notification',
    'Log receipt and archive',
  ],
  review: [
    'Review document and prepare summary for client',
    'Compile feedback and schedule review session',
    'Summarize status update for client briefing',
  ],
}

function extractText(conv: Conversation): string {
  const parts: string[] = [conv.subject.toLowerCase()]
  for (const msg of conv.messages) {
    parts.push(msg.body.toLowerCase())
    parts.push(msg.from.email.toLowerCase())
    parts.push(msg.subject.toLowerCase())
  }
  return parts.join(' ')
}

function computeScores(text: string): Record<Classification, number> {
  const scores: Record<Classification, number> = {
    assistant: 0,
    client: 0,
    noreply: 0,
    review: 0,
  }

  for (const [classification, rules] of Object.entries(classificationRules) as [Classification, KeywordRule[]][]) {
    let totalWeight = 0
    let matchedWeight = 0

    for (const rule of rules) {
      totalWeight += rule.weight
      const matched = rule.keywords.some((kw) => text.includes(kw))
      if (matched) {
        matchedWeight += rule.weight
      }
    }

    scores[classification] = totalWeight > 0 ? matchedWeight / totalWeight : 0
  }

  return scores
}

function generateReasoning(classification: Classification, confidence: number, text: string): string {
  const matchedKeywords: string[] = []
  const rules = classificationRules[classification]

  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        matchedKeywords.push(kw)
      }
    }
  }

  const keywordList = matchedKeywords.slice(0, 4).join(', ')

  switch (classification) {
    case 'assistant':
      return `Detected scheduling/coordination keywords (${keywordList}). This conversation can be handled by the assistant without client involvement. Confidence: ${(confidence * 100).toFixed(0)}%.`
    case 'client':
      return `Contains decision-level keywords (${keywordList}) that require the client's personal attention and authorization. Confidence: ${(confidence * 100).toFixed(0)}%.`
    case 'noreply':
      return `Identified as an automated/system notification based on keywords (${keywordList}). No response needed. Confidence: ${(confidence * 100).toFixed(0)}%.`
    case 'review':
      return `Contains review/feedback keywords (${keywordList}). Needs review before further action. Confidence: ${(confidence * 100).toFixed(0)}%.`
  }
}

function generateSummary(conv: Conversation): string {
  const lastMsg = conv.messages[conv.messages.length - 1]
  const sender = lastMsg.from.name
  const bodyPreview = lastMsg.body.length > 120 ? lastMsg.body.slice(0, 120) + '...' : lastMsg.body
  return `${sender} regarding "${conv.subject}": ${bodyPreview}`
}

function pickAction(classification: Classification, index: number): string {
  const actions = suggestedActions[classification]
  return actions[index % actions.length]
}

export function classifyConversation(conv: Conversation): AIInsights {
  const text = extractText(conv)
  const scores = computeScores(text)

  // Pick the classification with the highest score
  let bestClassification: Classification = 'review'
  let bestScore = -1

  for (const [cls, score] of Object.entries(scores) as [Classification, number][]) {
    if (score > bestScore) {
      bestScore = score
      bestClassification = cls
    }
  }

  // Map raw score to a realistic confidence between 0.65 and 0.96
  const confidence = Math.min(0.96, Math.max(0.65, 0.65 + bestScore * 0.31))

  const requiresResponse = bestClassification === 'client' || bestClassification === 'assistant'

  const reasoning = generateReasoning(bestClassification, confidence, text)
  const summary = generateSummary(conv)
  const suggestedAction = pickAction(bestClassification, conv.id.charCodeAt(0))

  return {
    classification: bestClassification,
    confidence: parseFloat(confidence.toFixed(2)),
    reasoning,
    suggestedAction,
    summary,
    requiresResponse,
  }
}
