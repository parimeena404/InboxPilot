const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['assistant', 'client'],
      default: 'assistant',
    },
    avatar: String,
    connectedAccounts: [
      {
        provider: { type: String, enum: ['gmail', 'outlook'] },
        email: String,
        connectedAt: { type: Date, default: Date.now },
        lastSync: Date,
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
