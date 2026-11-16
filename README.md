# InboxPilot — AI-Powered Personal Assistant Email Management Platform

> **Your inbox. Under control.**  
> A premium, production-quality SaaS workspace designed for personal assistants and high-profile executives who manage complex client email communications.

Live Evaluation Deployment: [https://inboxpilott.netlify.app](https://inboxpilott.netlify.app)

---

## 🌟 Overview

Personal assistants manage hundreds of incoming communications for busy clients, founders, and executives. The core bottleneck:
- Some emails require **the assistant's routine handling** (scheduling, receipts, catering, follow-ups).
- Some require **the client's personal authorization** (board sign-offs, equity term sheets, legal settlements).
- Many require **no reply** (automated billing notices, security alerts, newsletters).
- Ambiguous messages require **human review**.

**InboxPilot** solves this by uniting both parties under a **dual-workspace architecture** powered by an AI classification engine with transparent reasoning, confidence scores, and action items.

---

## 🚀 Key Features

### 1. Dual-Workspace Experience
- **Assistant Workspace**: Full 3-panel command center with global search, tag filtering, AI briefing, meeting extractions, and one-click tone-adjusted reply generation.
- **Client Workspace**: Minimal, distraction-free view presenting *only* decisions awaiting the client's personal input. One-click "Mark Handled" or "Delegate to Assistant".
- **Synchronized State**: Both experiences share real-time state with local persistence via Zustand and localStorage.

### 2. Contextual AI Classification Engine
Evaluates email intent, subject, body, sender identity, and attachments into four distinct tiers:
- 🔵 **Assistant to Reply**: Routine scheduling, coordination, vendor follow-ups, and travel.
- 🟡 **Client to Reply**: Contracts, investment terms, confidential matters, and personal decisions.
- 🟢 **No Reply Needed**: Payment receipts, automated digests, newsletters, and system notifications.
- 🟣 **Needs Review**: Ambiguous requests or low-confidence determinations flagged for human verification.

### 3. Integrated AI Copilot
- Natural language chat assistant with awareness of all 28 mailbox threads.
- Context-aware reply generator with tone controls (*Professional*, *Concise*, *Friendly*).
- Instant extraction of calendar events and action items.

### 4. Meetings & Calendar Sync
- Auto-extracts dates, attendees, Zoom links, and locations from email correspondence.
- Toggle between List View and Week Calendar Grid.

### 5. Multi-Account Integration
- Simulated OAuth2 connectivity for **Google Workspace (Gmail)** and **Microsoft 365 (Outlook)**.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6 |
| **Icons & Motion** | Lucide React, Framer Motion |
| **Visualizations** | Recharts (responsive pie/distribution charts) |
| **State & Store** | Zustand with `persist` middleware (zero external credentials required) |
| **Backend API** | Node.js, Express.js, MongoDB / Mongoose |
| **Deployment** | Netlify SPA (`dist`, `_redirects`, `netlify.toml`) |

---

## 📐 Design System Tokens

- **Main Background**: `#F7F8FC`
- **Main Surface**: `#FFFFFF`
- **Sidebar**: `#151B2D`
- **Primary Accent**: `#6558E8`
- **Primary Hover**: `#5548D5`
- **Primary Text**: `#20243A`
- **Secondary Text**: `#777D91`
- **Border**: `#E9EAF1`
- **Classification Badges**:
  - Assistant: `#E9F1FF` (Blue text)
  - Client: `#FFF3DE` (Amber text)
  - No Reply: `#E8F7EE` (Green text)
  - Review: `#F2EAFE` (Purple text)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18 or later)
- npm or pnpm

### Frontend
```bash
# Navigate to project directory
cd InboxPilot

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` to explore the application.

### Backend (Optional)
```bash
cd backend
npm install
npm run dev
```

---

## 📦 Netlify Deployment Configuration

The repository includes a ready-to-deploy `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📄 License
MIT License. Created for the InboxPilot evaluation project.
