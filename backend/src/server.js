const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const emailRoutes = require('./routes/emails')

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inboxpilot'

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0.0', timestamp: new Date() })
})

app.use('/api/emails', emailRoutes)

// Connect to MongoDB if URI is available
if (process.env.MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB database'))
    .catch((err) => console.error('MongoDB connection error:', err.message))
} else {
  console.log('Running with mock storage mode (no MONGODB_URI defined).')
}

app.listen(PORT, () => {
  console.log(`InboxPilot Express API listening on port ${PORT}`)
})

module.exports = app
