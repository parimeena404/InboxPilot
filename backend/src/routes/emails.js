const express = require('express')
const router = express.Router()
const Conversation = require('../models/Conversation')

// GET /api/emails - List all conversations
router.get('/', async (req, res) => {
  try {
    const { filter, classification, priority, search } = req.query
    let query = {}

    if (filter === 'starred' || filter === 'important') query.isStarred = true
    if (filter === 'archived') query.isArchived = true
    else query.isArchived = false

    if (classification) query.classification = classification
    if (priority) query.priority = priority

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { 'messages.body': { $regex: search, $options: 'i' } },
        { 'messages.from.name': { $regex: search, $options: 'i' } },
      ]
    }

    const conversations = await Conversation.find(query).sort({ lastActivity: -1 })
    res.json({ success: true, count: conversations.length, data: conversations })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/emails/:id - Get conversation details
router.get('/:id', async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id)
    if (!conv) return res.status(404).json({ success: false, error: 'Conversation not found' })
    res.json({ success: true, data: conv })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PATCH /api/emails/:id/classify - Update classification
router.patch('/:id/classify', async (req, res) => {
  try {
    const { classification } = req.body
    const conv = await Conversation.findByIdAndUpdate(
      req.params.id,
      {
        classification,
        'aiInsights.classification': classification,
        lastActivity: new Date(),
      },
      { new: true }
    )
    res.json({ success: true, data: conv })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PATCH /api/emails/:id/star
router.patch('/:id/star', async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id)
    if (!conv) return res.status(404).json({ success: false, error: 'Not found' })
    conv.isStarred = !conv.isStarred
    await conv.save()
    res.json({ success: true, data: conv })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/emails/:id/reply - Add reply message
router.post('/:id/reply', async (req, res) => {
  try {
    const { body, senderName, senderEmail } = req.body
    const conv = await Conversation.findById(req.params.id)
    if (!conv) return res.status(404).json({ success: false, error: 'Not found' })

    conv.messages.push({
      from: { name: senderName || 'Alex Morgan', email: senderEmail || 'alex.morgan@company.com' },
      to: [conv.messages[0]?.from || { name: 'Recipient', email: 'recipient@domain.com' }],
      subject: `Re: ${conv.subject}`,
      body,
      timestamp: new Date(),
      isRead: true,
    })
    conv.lastActivity = new Date()
    await conv.save()
    res.json({ success: true, data: conv })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
