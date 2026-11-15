# InboxPilot

**AI Email Workspace** — InboxPilot manages your inbox intelligently and brings you only what needs your attention.

InboxPilot is a full-stack AI-powered email management platform that classifies, prioritizes, and organizes emails using artificial intelligence. It features dual roles — an **Executive Assistant** view for managing and triaging emails, and a **Client/Executive** view for reviewing only what requires attention.

## Features

- **AI Email Classification** — Automatically categorizes emails by priority (urgent, high, normal, low) and responsibility (assistant, client)
- **Smart Inbox Dashboard** — Overview with real-time statistics, unread counts, and category filters
- **AI Daily Briefing** — AI-generated daily summary of your inbox with urgent items, focus areas, and key meetings
- **Intelligence Panel** — Follow-ups, deadlines, meetings, and items needing review at a glance
- **AI Assistant Chat** — Conversational AI assistant for email management help and drafting replies
- **AI Draft Replies** — Stream AI-generated reply drafts in real-time (SSE)
- **Dual-Role System** — Assistant view (full inbox management) and Client view (decision-focused dashboard)
- **Email Thread View** — Full conversation view with reply capability
- **Client Review Portal** — Simplified view for executives to handle escalated items
- **Connected Accounts** — Multi-account email management
- **Settings Panel** — Profile management, notifications, appearance, and account settings
- **Responsive Design** — Dark-themed UI built with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** with React Router v6
- **Tailwind CSS** with shadcn/ui components (Radix UI primitives)
- **Axios** for HTTP requests
- **Framer Motion** for animations
- **Lucide React** for icons
- **date-fns** for date formatting
- **Sonner** for toast notifications
- **@tanstack/react-query** for data management

### Backend
- **Python / FastAPI** with Uvicorn
- **SQLite** database
- **OpenAI API** (GPT-4o-mini) for AI features
- **Cookie-based session authentication** (itsdangerous)
- **Server-Sent Events (SSE)** for streaming AI responses

## Project Structure

```
InboxPilot/
├── backend/
│   ├── server.py              # FastAPI application (all routes, models, DB)
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   │   ├── index.html         # HTML template
│   │   └── favicon.svg        # App icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components (Button, Select, etc.)
│   │   │   ├── AssistantChat.jsx
│   │   │   ├── AssistantLayout.jsx
│   │   │   ├── AssistantPanel.jsx
│   │   │   ├── ConversationView.jsx
│   │   │   ├── EmailTable.jsx
│   │   │   ├── IntelligencePanel.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── bits.jsx       # Shared UI building blocks
│   │   ├── lib/
│   │   │   ├── api.js         # Axios instance & SSE helper
│   │   │   ├── auth.jsx       # AuthProvider context & hooks
│   │   │   ├── format.js      # Date & text formatting utilities
│   │   │   ├── ui.jsx         # UI utility hooks
│   │   │   └── utils.js       # cn() utility (clsx + tailwind-merge)
│   │   ├── pages/
│   │   │   ├── AssistantPage.jsx
│   │   │   ├── Client.jsx     # Client dashboard
│   │   │   ├── ClientReview.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Mail.jsx       # Main email list + thread view
│   │   │   ├── Overview.jsx   # Dashboard overview
│   │   │   └── Settings.jsx
│   │   ├── App.js             # Root component with routing
│   │   ├── App.css
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Tailwind base + theme variables
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── jsconfig.json
├── .env.example               # Environment variable template
├── .gitignore
└── README.md
```

## Installation

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.9+
- **OpenAI API key** (optional — app works without it with fallback responses)

### 1. Clone the Repository

```bash
git clone https://github.com/parimeena404/InboxPilot.git
cd InboxPilot
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
# Backend
OPENAI_API_KEY=sk-your-openai-api-key-here    # Optional — enables AI features
SECRET_KEY=change-this-to-a-random-secret      # Session encryption key
DATABASE_URL=sqlite:///./inboxpilot.db         # SQLite database path

# Frontend
REACT_APP_BACKEND_URL=http://localhost:8000    # Backend API URL
```

> **Note:** The application works without an OpenAI API key — AI features will use fallback responses instead of live AI generation.

### 3. Set Up the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Set Up the Frontend

```bash
cd frontend
npm install
```

## Running the Application

### Start the Backend

```bash
cd backend
source venv/bin/activate    # On Windows: venv\Scripts\activate
python server.py
```

The API server starts at `http://localhost:8000`.

### Start the Frontend

```bash
cd frontend
npm start
```

The frontend starts at `http://localhost:3000`.

### Demo Credentials

| Role       | Email                      | Password   |
|------------|---------------------------|------------|
| Assistant  | assistant@inboxpilot.app  | demo1234   |
| Client     | client@inboxpilot.app     | demo1234   |

You can also click the **"Try as Assistant"** or **"Try as Client"** buttons on the login page.

## API Endpoints

| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| GET    | `/api/`                     | Health check                   |
| POST   | `/api/auth/login`           | Login with email/password      |
| POST   | `/api/auth/demo`            | Demo login by role             |
| POST   | `/api/auth/logout`          | Logout                         |
| GET    | `/api/auth/me`              | Get current user               |
| POST   | `/api/auth/profile`         | Update profile                 |
| GET    | `/api/emails`               | List emails (with filters)     |
| GET    | `/api/emails/:id`           | Get email with thread          |
| PATCH  | `/api/emails/:id`           | Update email properties        |
| POST   | `/api/emails/:id/reply`     | Reply to an email              |
| GET    | `/api/stats`                | Dashboard statistics           |
| GET    | `/api/intelligence`         | Briefing, meetings, deadlines  |
| POST   | `/api/briefing/refresh`     | Regenerate AI briefing         |
| GET    | `/api/client/summary`       | Client dashboard summary       |
| GET    | `/api/accounts`             | Connected email accounts       |
| POST   | `/api/accounts/:id/sync`    | Trigger account sync           |
| GET    | `/api/assistant/messages`   | Chat message history           |
| POST   | `/api/assistant/chat`       | AI assistant chat (SSE stream) |
| POST   | `/api/assistant/draft`      | AI draft reply (SSE stream)    |

## Build & Deployment

### Build the Frontend

```bash
cd frontend
npm run build
```

The production build is output to `frontend/build/`.

### Production Backend

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000
```

For production, set `SECRET_KEY` to a strong random value and configure `FRONTEND_URL` for CORS.

## License

This project is proprietary. All rights reserved.
