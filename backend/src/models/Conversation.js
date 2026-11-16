const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  from: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: String,
  },
  to: [
    {
      name: String,
      email: String,
    },
  ],
  subject: String,
  body: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  attachments: [
    {
      name: String,
      size: String,
      type: String,
    },
  ],
})

const conversationSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    messages: [messageSchema],
    classification: {
      type: String,
      enum: ['assistant', 'client', 'noreply', 'review'],
      default: 'review',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    isStarred: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    labels: [String],
    aiInsights: {
      classification: String,
      confidence: Number,
      reasoning: String,
      suggestedAction: String,
      summary: String,
      requiresResponse: Boolean,
      actionItems: [String],
    },
    lastActivity: { type: Date, default: Date.now },
    clientName: String,
  },
  { timestamps: true }
)

module.exports = mongoose.model('Conversation', conversationSchema)
