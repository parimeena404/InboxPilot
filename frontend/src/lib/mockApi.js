/**
 * InboxPilot In-Browser Mock API
 * Provides complete data persistence in localStorage for standalone deployment (e.g. Netlify).
 * Seamlessly matches the backend schema and endpoints.
 */

const STORAGE_KEYS = {
    USER: "ip_user",
    EMAILS: "ip_emails",
    ACCOUNTS: "ip_accounts",
    BRIEFING: "ip_briefing",
    MESSAGES: "ip_assistant_messages",
};

const INITIAL_ACCOUNTS = [
    {
        id: "acc-1",
        email: "assistant@inboxpilot.app",
        provider: "google",
        color: "#4285F4",
        primary: true,
        status: "connected",
        last_sync: new Date().toISOString(),
    },
    {
        id: "acc-2",
        email: "alex.morgan@company.com",
        provider: "outlook",
        color: "#0078D4",
        primary: false,
        status: "connected",
        last_sync: new Date().toISOString(),
    },
];

const INITIAL_EMAILS = [
    {
        id: "em-1",
        subject: "Q4 Board Presentation — Final Review",
        sender_name: "Sarah Chen",
        sender_email: "sarah.chen@boardworks.io",
        preview: "Hi Jordan, attached is the final draft of the Q4 board presentation. Please review slides 12-18 covering the revenue forecast...",
        received_at: new Date(Date.now() - 3600000).toISOString(),
        unread: true,
        starred: false,
        important: true,
        archived: false,
        priority: "urgent",
        responsibility: "client",
        tint: "rose",
        ai_summary: "Board presentation needs final approval before Thursday. Revenue slides require CEO sign-off.",
        classification_reason: "Contains board materials requiring executive review and approval.",
        deadline: new Date(Date.now() + 172800000).toISOString(),
        deadline_label: "Due Wednesday",
        meeting: null,
        action_items: ["Review slides 12-18", "Approve revenue forecast", "Send feedback by Wednesday"],
        handled: false,
        messages: [
            {
                id: "em-1-msg-1",
                from_name: "Sarah Chen",
                from_email: "sarah.chen@boardworks.io",
                at: new Date(Date.now() - 3600000).toISOString(),
                body: "Hi Jordan,\n\nAttached is the final draft of the Q4 board presentation. Please review slides 12-18 covering the revenue forecast and market expansion plans.\n\nKey changes since the last version:\n- Updated revenue projections with November actuals\n- Added competitive landscape analysis\n- Revised headcount plan per your feedback\n\nThe board meeting is this Thursday at 2 PM. I'd appreciate your feedback by Wednesday EOD so I can incorporate any final changes.\n\nBest regards,\nSarah",
            },
        ],
    },
    {
        id: "em-2",
        subject: "Partnership Proposal — Meridian Technologies",
        sender_name: "David Park",
        sender_email: "david.park@meridiantech.com",
        preview: "Dear Jordan, following our conversation at the Tech Summit, I'd like to formally propose a strategic partnership between our companies...",
        received_at: new Date(Date.now() - 10800000).toISOString(),
        unread: true,
        starred: true,
        important: true,
        archived: false,
        priority: "high",
        responsibility: "client",
        tint: "amber",
        ai_summary: "Strategic partnership proposal from Meridian Technologies following Tech Summit meeting. Requires executive decision.",
        classification_reason: "Strategic business proposal requiring CEO consideration.",
        deadline: null,
        deadline_label: null,
        meeting: null,
        action_items: ["Review partnership terms", "Schedule follow-up call"],
        handled: false,
        messages: [
            {
                id: "em-2-msg-1",
                from_name: "David Park",
                from_email: "david.park@meridiantech.com",
                at: new Date(Date.now() - 10800000).toISOString(),
                body: "Dear Jordan,\n\nFollowing our conversation at the Tech Summit last week, I'd like to formally propose a strategic partnership between Meridian Technologies and your company.\n\nOur proposal includes:\n1. Co-development of the AI analytics platform\n2. Shared go-to-market strategy for the enterprise segment\n3. Cross-licensing of our respective IP portfolios\n\nI've attached a detailed term sheet for your review. Would you be available for a deeper discussion next week?\n\nBest regards,\nDavid Park\nCEO, Meridian Technologies",
            },
        ],
    },
    {
        id: "em-3",
        subject: "Weekly Team Standup — Agenda for Monday",
        sender_name: "Lisa Wang",
        sender_email: "lisa.wang@company.com",
        preview: "Hi team, here's the agenda for our Monday standup. Please update your status in the shared doc before the meeting...",
        received_at: new Date(Date.now() - 18000000).toISOString(),
        unread: true,
        starred: false,
        important: false,
        archived: false,
        priority: "normal",
        responsibility: "assistant",
        tint: "emerald",
        ai_summary: "Routine weekly standup agenda. Team members need to update status doc before Monday meeting.",
        classification_reason: "Regular team meeting — can be handled by assistant.",
        deadline: null,
        deadline_label: null,
        meeting: {
            title: "Weekly Team Standup",
            start: new Date(Date.now() + 86400000).toISOString(),
            location: "Conference Room B / Zoom",
        },
        action_items: [],
        handled: false,
        messages: [
            {
                id: "em-3-msg-1",
                from_name: "Lisa Wang",
                from_email: "lisa.wang@company.com",
                at: new Date(Date.now() - 18000000).toISOString(),
                body: "Hi team,\n\nHere's the agenda for our Monday standup:\n\n1. Sprint progress review\n2. Blockers and dependencies\n3. Q4 OKR check-in\n4. New hire onboarding updates\n\nPlease update your status in the shared doc before the meeting.\n\nTime: Monday 10:00 AM\nLocation: Conference Room B / Zoom\n\nThanks,\nLisa",
            },
        ],
    },
    {
        id: "em-4",
        subject: "Invoice #INV-2024-0892 — November Services",
        sender_name: "CloudScale Billing",
        sender_email: "billing@cloudscale.io",
        preview: "Your invoice for November cloud infrastructure services is ready. Total amount: $12,450.00. Payment due by December 15th.",
        received_at: new Date(Date.now() - 28800000).toISOString(),
        unread: false,
        starred: false,
        important: false,
        archived: false,
        priority: "normal",
        responsibility: "assistant",
        tint: "sky",
        ai_summary: "Monthly cloud infrastructure invoice. Standard recurring expense. Payment due Dec 15.",
        classification_reason: "Routine billing — assistant can process and file.",
        deadline: new Date(Date.now() + 2592000000).toISOString(),
        deadline_label: "Payment due Dec 15",
        meeting: null,
        action_items: ["Process payment", "File receipt"],
        handled: false,
        messages: [
            {
                id: "em-4-msg-1",
                from_name: "CloudScale Billing",
                from_email: "billing@cloudscale.io",
                at: new Date(Date.now() - 28800000).toISOString(),
                body: "Invoice #INV-2024-0892\n\nService Period: November 1-30, 2024\n\nCloud Infrastructure Services:\n- Compute instances: $6,200.00\n- Storage (S3): $2,100.00\n- Data transfer: $1,850.00\n- Support plan: $2,300.00\n\nTotal: $12,450.00\n\nPayment due: December 15, 2024\n\nPay online at: billing.cloudscale.io/pay\n\nThank you for your business.",
            },
        ],
    },
    {
        id: "em-5",
        subject: "Re: Project Atlas — Phase 2 Timeline Update",
        sender_name: "Marcus Rivera",
        sender_email: "m.rivera@company.com",
        preview: "Hey team, quick update on Phase 2 — we're tracking 2 weeks ahead of schedule on the core API work...",
        received_at: new Date(Date.now() - 36000000).toISOString(),
        unread: false,
        starred: false,
        important: false,
        archived: false,
        priority: "normal",
        responsibility: "assistant",
        tint: "violet",
        ai_summary: "Project Atlas Phase 2 is ahead of schedule. Core API work progressing well. QA to start next week.",
        classification_reason: "Project update — informational, assistant can monitor.",
        deadline: null,
        deadline_label: null,
        meeting: null,
        action_items: [],
        handled: false,
        messages: [
            {
                id: "em-5-msg-1",
                from_name: "Marcus Rivera",
                from_email: "m.rivera@company.com",
                at: new Date(Date.now() - 36000000).toISOString(),
                body: "Hey team,\n\nQuick update on Phase 2 — we're tracking 2 weeks ahead of schedule on the core API work. Here's where we stand:\n\n✅ Authentication service — complete\n✅ Data pipeline — complete\n🔄 Analytics dashboard — 80% done\n🔄 Mobile API endpoints — 60% done\n⬜ Load testing — starting next week\n\nQA will begin their testing cycle on Monday. No blockers at the moment.\n\nI'll share a more detailed report in Friday's sync.\n\nCheers,\nMarcus",
            },
        ],
    },
    {
        id: "em-6",
        subject: "Lunch with Investor — Calendar Hold",
        sender_name: "Rachel Foster",
        sender_email: "rachel@company.com",
        preview: "Hi Jordan, I've set up a lunch meeting with James Liu from Sequoia. He's interested in discussing our Series B...",
        received_at: new Date(Date.now() - 43200000).toISOString(),
        unread: true,
        starred: true,
        important: true,
        archived: false,
        priority: "high",
        responsibility: "client",
        tint: "fuchsia",
        ai_summary: "Investor lunch meeting arranged with Sequoia partner. Series B discussion. Calendar hold needed.",
        classification_reason: "Investor meeting requiring CEO attendance and preparation.",
        deadline: null,
        deadline_label: null,
        meeting: {
            title: "Lunch with James Liu (Sequoia)",
            start: new Date(Date.now() + 259200000).toISOString(),
            location: "Nobu Downtown",
        },
        action_items: ["Confirm attendance", "Review Series B deck"],
        handled: false,
        messages: [
            {
                id: "em-6-msg-1",
                from_name: "Rachel Foster",
                from_email: "rachel@company.com",
                at: new Date(Date.now() - 43200000).toISOString(),
                body: "Hi Jordan,\n\nI've set up a lunch meeting with James Liu from Sequoia Capital. He's very interested in discussing our Series B and wants to learn more about our AI product roadmap.\n\nDetails:\n📅 Date: This Thursday\n🕐 Time: 12:30 PM\n📍 Location: Nobu Downtown\n\nI've sent a calendar hold. Please confirm your availability and I'll send the final confirmation.\n\nAlso, should I prepare an updated pitch deck or use the existing one?\n\nThanks,\nRachel",
            },
        ],
    },
    {
        id: "em-7",
        subject: "New Employee Onboarding — Week 1 Checklist",
        sender_name: "HR Team",
        sender_email: "hr@company.com",
        preview: "Welcome aboard! Here's your week 1 onboarding checklist. Please complete the following items by Friday...",
        received_at: new Date(Date.now() - 54000000).toISOString(),
        unread: false,
        starred: false,
        important: false,
        archived: false,
        priority: "low",
        responsibility: "assistant",
        tint: "teal",
        ai_summary: "Standard HR onboarding checklist for new hires. Routine administrative task.",
        classification_reason: "HR administrative — assistant can coordinate.",
        deadline: null,
        deadline_label: null,
        meeting: null,
        action_items: ["Forward to new hire", "Set up orientation schedule"],
        handled: false,
        messages: [
            {
                id: "em-7-msg-1",
                from_name: "HR Team",
                from_email: "hr@company.com",
                at: new Date(Date.now() - 54000000).toISOString(),
                body: "Welcome aboard!\n\nHere's the Week 1 onboarding checklist for our new team members:\n\n☐ Complete I-9 and W-4 forms\n☐ Set up email and Slack accounts\n☐ Review employee handbook\n☐ Schedule 1:1 with manager\n☐ Complete security training\n☐ Set up development environment\n\nPlease ensure all items are completed by Friday.\n\nBest,\nHR Team",
            },
        ],
    },
    {
        id: "em-8",
        subject: "Urgent: Production Incident — API Latency Spike",
        sender_name: "DevOps Alert",
        sender_email: "alerts@company.com",
        preview: "ALERT: API response times have exceeded 5s threshold. P95 latency at 8.2s. Engineering team has been notified...",
        received_at: new Date(Date.now() - 7200000).toISOString(),
        unread: true,
        starred: true,
        important: true,
        archived: false,
        priority: "urgent",
        responsibility: "assistant",
        tint: "orange",
        ai_summary: "Production API latency incident. P95 at 8.2s (threshold 5s). Engineering team notified and investigating.",
        classification_reason: "Technical incident — assistant should monitor and escalate if needed.",
        deadline: null,
        deadline_label: null,
        meeting: null,
        action_items: ["Monitor incident status", "Escalate if not resolved in 1 hour"],
        handled: false,
        messages: [
            {
                id: "em-8-msg-1",
                from_name: "DevOps Alert",
                from_email: "alerts@company.com",
                at: new Date(Date.now() - 7200000).toISOString(),
                body: "🚨 PRODUCTION INCIDENT — HIGH SEVERITY\n\nService: Core API Gateway\nStarted: 2 hours ago\nStatus: Investigating\n\nMetrics:\n- P95 Latency: 8.2s (threshold: 5s)\n- Error Rate: 2.3% (threshold: 1%)\n- Affected Users: ~15%\n\nEngineering team has been paged. Current hypothesis is a database connection pool exhaustion.\n\nNext update in 30 minutes.\n\n— DevOps Monitoring",
            },
        ],
    },
    {
        id: "em-9",
        subject: "Conference Speaking Invitation — AI Summit 2025",
        sender_name: "Emily Nakamura",
        sender_email: "emily@aisummit.org",
        preview: "Dear Jordan, we'd be honored to have you as a keynote speaker at AI Summit 2025. The event will be held in San Francisco...",
        received_at: new Date(Date.now() - 86400000).toISOString(),
        unread: false,
        starred: false,
        important: false,
        archived: false,
        priority: "normal",
        responsibility: "client",
        tint: "indigo",
        ai_summary: "Keynote speaking invitation for AI Summit 2025 in San Francisco. Requires CEO decision on participation.",
        classification_reason: "Public speaking opportunity — needs CEO consideration.",
        deadline: new Date(Date.now() + 1209600000).toISOString(),
        deadline_label: "RSVP by Dec 1",
        meeting: null,
        action_items: ["Review event details", "Decide on participation"],
        handled: false,
        messages: [
            {
                id: "em-9-msg-1",
                from_name: "Emily Nakamura",
                from_email: "emily@aisummit.org",
                at: new Date(Date.now() - 86400000).toISOString(),
                body: "Dear Jordan,\n\nWe'd be honored to have you as a keynote speaker at AI Summit 2025.\n\nEvent Details:\n📅 March 15-17, 2025\n📍 Moscone Center, San Francisco\n👥 Expected attendance: 5,000+\n\nWe're particularly interested in your perspective on AI-powered productivity tools and the future of work.\n\nSpeaker benefits include:\n- Keynote slot (45 minutes)\n- VIP networking dinner\n- Full conference pass\n- Travel and accommodation covered\n\nPlease let us know by December 1st if you're interested.\n\nBest regards,\nEmily Nakamura\nProgram Director, AI Summit",
            },
        ],
    },
    {
        id: "em-10",
        subject: "Monthly Newsletter — Industry Digest",
        sender_name: "TechWatch",
        sender_email: "digest@techwatch.io",
        preview: "This month in tech: AI regulation updates, cloud market shifts, and the latest in enterprise SaaS...",
        received_at: new Date(Date.now() - 104400000).toISOString(),
        unread: false,
        starred: false,
        important: false,
        archived: false,
        priority: "low",
        responsibility: "assistant",
        tint: "cyan",
        ai_summary: "Monthly tech industry newsletter. Informational only — no action required.",
        classification_reason: "Newsletter — low priority, informational.",
        deadline: null,
        deadline_label: null,
        meeting: null,
        action_items: [],
        handled: true,
        messages: [
            {
                id: "em-10-msg-1",
                from_name: "TechWatch",
                from_email: "digest@techwatch.io",
                at: new Date(Date.now() - 104400000).toISOString(),
                body: "📬 TechWatch Monthly Digest\n\nTop Stories:\n\n1. EU AI Act enters enforcement phase\n2. Cloud spending reaches $200B globally\n3. Enterprise AI adoption up 45% YoY\n4. Remote work tools market consolidation\n5. Cybersecurity spending forecast for 2025\n\nRead the full digest at techwatch.io/november\n\nUnsubscribe | Update preferences",
            },
        ],
    },
    {
        id: "em-11",
        subject: "Legal Review — Vendor Agreement with DataSync",
        sender_name: "Katherine Osei",
        sender_email: "k.osei@legalpartners.com",
        preview: "Hi Alex, I've completed the review of the DataSync vendor agreement. There are three clauses that need attention...",
        received_at: new Date(Date.now() - 21600000).toISOString(),
        unread: true,
        starred: false,
        important: true,
        archived: false,
        priority: "high",
        responsibility: "assistant",
        tint: "rose",
        ai_summary: "Legal review complete for DataSync vendor agreement. Three clauses flagged for revision before signing.",
        classification_reason: "Legal matter — assistant can coordinate revisions before escalating for signature.",
        deadline: new Date(Date.now() + 432000000).toISOString(),
        deadline_label: "Sign by next Friday",
        meeting: null,
        action_items: ["Review flagged clauses", "Coordinate revisions with legal", "Prepare for CEO signature"],
        handled: false,
        messages: [
            {
                id: "em-11-msg-1",
                from_name: "Katherine Osei",
                from_email: "k.osei@legalpartners.com",
                at: new Date(Date.now() - 21600000).toISOString(),
                body: "Hi Alex,\n\nI've completed the review of the DataSync vendor agreement. There are three clauses that need attention:\n\n1. Section 4.2 — Data retention period should be 90 days, not 180\n2. Section 7.1 — Indemnification clause is too broad\n3. Section 9.3 — Auto-renewal should require 60 days notice\n\nI've marked up the document with suggested revisions. Please coordinate with DataSync's legal team and let me know once they've responded.\n\nTarget: Finalize by next Friday for CEO signature.\n\nBest,\nKatherine Osei\nSenior Counsel, Legal Partners LLP",
            },
        ],
    },
    {
        id: "em-12",
        subject: "Team Offsite Planning — Venue Options",
        sender_name: "Priya Sharma",
        sender_email: "priya@company.com",
        preview: "Hi Alex, I've narrowed down the venue options for the Q1 team offsite to three locations...",
        received_at: new Date(Date.now() - 72000000).toISOString(),
        unread: false,
        starred: false,
        important: false,
        archived: false,
        priority: "normal",
        responsibility: "assistant",
        tint: "amber",
        ai_summary: "Three venue options for Q1 team offsite. Assistant to review and shortlist before presenting to leadership.",
        classification_reason: "Event planning — assistant responsibility.",
        deadline: null,
        deadline_label: null,
        meeting: null,
        action_items: ["Compare venue options", "Get budget approval", "Book preferred venue"],
        handled: false,
        messages: [
            {
                id: "em-12-msg-1",
                from_name: "Priya Sharma",
                from_email: "priya@company.com",
                at: new Date(Date.now() - 72000000).toISOString(),
                body: "Hi Alex,\n\nI've narrowed down the venue options for the Q1 team offsite:\n\n1. The Grand Hotel — Downtown, $8,500/day, seats 100\n2. Lakeside Retreat — 45 min from office, $6,200/day, seats 80\n3. Innovation Hub — Tech district, $5,800/day, seats 60\n\nAll three are available Jan 15-17. I need to hold the booking by next Wednesday.\n\nWhich one should I move forward with? Or would you like to visit any of them first?\n\nThanks,\nPriya",
            },
        ],
    },
];

function getStoredUser() {
    try {
        const u = localStorage.getItem(STORAGE_KEYS.USER);
        return u ? JSON.parse(u) : null;
    } catch {
        return null;
    }
}

function setStoredUser(u) {
    if (!u) {
        localStorage.removeItem(STORAGE_KEYS.USER);
    } else {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    }
}

function getStoredEmails() {
    try {
        const e = localStorage.getItem(STORAGE_KEYS.EMAILS);
        if (e) return JSON.parse(e);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(INITIAL_EMAILS));
    return JSON.parse(JSON.stringify(INITIAL_EMAILS));
}

function setStoredEmails(emails) {
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(emails));
}

function getStoredAccounts() {
    try {
        const a = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        if (a) return JSON.parse(a);
    } catch {}
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
    return JSON.parse(JSON.stringify(INITIAL_ACCOUNTS));
}

function setStoredAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

function computeCounts(emails) {
    return {
        all: emails.filter((e) => !e.archived).length,
        assistant: emails.filter((e) => e.responsibility === "assistant" && !e.archived).length,
        client: emails.filter((e) => e.responsibility === "client" && !e.archived).length,
        no_reply: emails.filter((e) => !e.handled && !e.archived).length,
        action: emails.filter((e) => (e.action_items || []).length > 0 && !e.archived).length,
        waiting: emails.filter((e) => e.responsibility === "client" && !e.handled && !e.archived).length,
        important: emails.filter((e) => e.important && !e.archived).length,
        meetings: emails.filter((e) => e.meeting && e.meeting.title && !e.archived).length,
        archived: emails.filter((e) => e.archived).length,
    };
}

function computeBriefing(emails) {
    const unread = emails.filter((e) => e.unread).length;
    const pending = emails.filter((e) => !e.handled && !e.archived).length;
    const urgent = emails
        .filter((e) => (e.priority === "urgent" || e.priority === "high") && !e.archived && !e.handled)
        .slice(0, 5)
        .map((e) => ({ subject: e.subject, why: e.ai_summary || "Marked as high priority" }));

    const focus = emails
        .filter((e) => (e.action_items || []).length > 0 && !e.handled && !e.archived)
        .slice(0, 5)
        .map((e) => e.subject);

    const greeting = new Date().getHours() < 12 ? "Good morning" : "Good afternoon";

    return {
        headline: `You have ${unread} unread emails and ${pending} items pending attention.`,
        greeting_line: `${greeting}! Here's your daily inbox briefing.`,
        paragraphs: [
            `There are ${unread} unread messages in your inbox today.`,
            `${pending} emails still need your attention or a response.`,
            "I've organized everything by priority and category for you.",
        ],
        urgent,
        focus: focus.length > 0 ? focus : ["No immediate action items — you're all caught up!"],
    };
}

/**
 * Handle in-browser mock requests
 */
export async function handleMockRequest(method, path, data = null, params = {}) {
    const normPath = path.replace(/^\/api/, "").replace(/\/+$/, "") || "/";
    const user = getStoredUser();

    // Small delay to simulate real network feel
    await new Promise((r) => setTimeout(r, 60));

    // GET /
    if (method === "GET" && normPath === "/") {
        return { data: { message: "InboxPilot Mock API is running" } };
    }

    // GET /auth/me
    if (method === "GET" && normPath === "/auth/me") {
        if (!user) {
            const err = new Error("Not authenticated");
            err.response = { status: 401, data: { detail: "Not authenticated" } };
            throw err;
        }
        return { data: user };
    }

    // POST /auth/login
    if (method === "POST" && normPath === "/auth/login") {
        const { email, password } = data || {};
        let loggedUser;
        if (email === "client@inboxpilot.app") {
            loggedUser = { name: "Jordan Taylor", email, role: "client", title: "CEO" };
        } else if (email === "assistant@inboxpilot.app") {
            loggedUser = { name: "Alex Morgan", email, role: "assistant", title: "Executive Assistant" };
        } else {
            // Support custom login/signup seamlessly
            const isClient = (email || "").toLowerCase().includes("client");
            loggedUser = {
                name: (email || "User").split("@")[0].replace(/[._-]/g, " "),
                email: email || "user@inboxpilot.app",
                role: isClient ? "client" : "assistant",
                title: isClient ? "Executive" : "Assistant",
            };
        }
        setStoredUser(loggedUser);
        return { data: { user: loggedUser } };
    }

    // POST /auth/demo
    if (method === "POST" && normPath === "/auth/demo") {
        const role = data?.role || "assistant";
        const loggedUser =
            role === "client"
                ? { name: "Jordan Taylor", email: "client@inboxpilot.app", role: "client", title: "CEO" }
                : { name: "Alex Morgan", email: "assistant@inboxpilot.app", role: "assistant", title: "Executive Assistant" };
        setStoredUser(loggedUser);
        return { data: { user: loggedUser } };
    }

    // POST /auth/logout
    if (method === "POST" && normPath === "/auth/logout") {
        setStoredUser(null);
        return { data: { ok: true } };
    }

    // POST /auth/profile
    if (method === "POST" && normPath === "/auth/profile") {
        if (!user) throw new Error("Not authenticated");
        const updated = { ...user, name: data.name || user.name, title: data.title ?? user.title };
        setStoredUser(updated);
        return { data: { ok: true } };
    }

    // ------------------- EMAILS -------------------
    const emails = getStoredEmails();

    // GET /emails
    if (method === "GET" && normPath === "/emails") {
        let list = [...emails];
        const category = params.category || "all";
        const q = (params.q || "").toLowerCase().trim();
        const priority = params.priority || "";
        const unreadOnly = params.unread_only === true || params.unread_only === "true";
        const page = parseInt(params.page || 1, 10);
        const pageSize = parseInt(params.page_size || 25, 10);

        if (category === "assistant") list = list.filter((e) => e.responsibility === "assistant" && !e.archived);
        else if (category === "client") list = list.filter((e) => e.responsibility === "client" && !e.archived);
        else if (category === "no_reply") list = list.filter((e) => !e.handled && !e.archived);
        else if (category === "action") list = list.filter((e) => (e.action_items || []).length > 0 && !e.archived);
        else if (category === "waiting") list = list.filter((e) => e.responsibility === "client" && !e.handled && !e.archived);
        else if (category === "important") list = list.filter((e) => e.important && !e.archived);
        else if (category === "meetings") list = list.filter((e) => e.meeting && e.meeting.title && !e.archived);
        else if (category === "archived") list = list.filter((e) => e.archived);
        else list = list.filter((e) => !e.archived);

        if (q) {
            list = list.filter(
                (e) =>
                    (e.subject || "").toLowerCase().includes(q) ||
                    (e.sender_name || "").toLowerCase().includes(q) ||
                    (e.sender_email || "").toLowerCase().includes(q) ||
                    (e.preview || "").toLowerCase().includes(q)
            );
        }
        if (priority) {
            list = list.filter((e) => e.priority === priority);
        }
        if (unreadOnly) {
            list = list.filter((e) => e.unread);
        }

        const counts = computeCounts(emails);
        const offset = (page - 1) * pageSize;
        const items = list.slice(offset, offset + pageSize);

        return { data: { items, total: list.length, counts } };
    }

    // GET /emails/:id
    const emailMatch = normPath.match(/^\/emails\/([^/]+)$/);
    if (emailMatch) {
        const id = emailMatch[1];
        const email = emails.find((e) => e.id === id);
        if (!email) {
            const err = new Error("Email not found");
            err.response = { status: 404, data: { detail: "Email not found" } };
            throw err;
        }

        if (method === "GET") {
            return { data: email };
        }

        if (method === "PATCH") {
            const patch = data || {};
            if (patch.starred !== undefined) email.starred = patch.starred;
            if (patch.archived !== undefined) email.archived = patch.archived;
            if (patch.responsibility !== undefined) email.responsibility = patch.responsibility;
            if (patch.handled !== undefined) email.handled = patch.handled;
            if (patch.unread !== undefined) email.unread = patch.unread;

            setStoredEmails(emails);
            return { data: email };
        }
    }

    // POST /emails/:id/reply
    const replyMatch = normPath.match(/^\/emails\/([^/]+)\/reply$/);
    if (method === "POST" && replyMatch) {
        const id = replyMatch[1];
        const email = emails.find((e) => e.id === id);
        if (!email) throw new Error("Email not found");

        const msgId = `msg-${Date.now()}`;
        email.messages = email.messages || [];
        email.messages.push({
            id: msgId,
            from_name: user?.name || "Alex Morgan",
            from_email: user?.email || "assistant@inboxpilot.app",
            at: new Date().toISOString(),
            body: data?.body || "",
        });
        email.handled = true;
        setStoredEmails(emails);
        return { data: { ok: true, message_id: msgId } };
    }

    // ------------------- STATS -------------------
    if (method === "GET" && normPath === "/stats") {
        const counts = computeCounts(emails);
        const total = emails.length;
        const unread = emails.filter((e) => e.unread).length;
        const actionRequired = emails.filter((e) => (e.action_items || []).length > 0 && !e.handled && !e.archived).length;
        const clientAttention = emails.filter((e) => e.responsibility === "client" && !e.handled && !e.archived).length;
        const assistantPending = emails.filter((e) => e.responsibility === "assistant" && !e.handled && !e.archived).length;
        const waiting = clientAttention;
        const freshToday = emails.filter((e) => {
            const d = new Date(e.received_at);
            const now = new Date();
            return d.toDateString() === now.toDateString();
        }).length;

        return {
            data: {
                total_emails: total,
                unread,
                action_required: actionRequired,
                client_attention: clientAttention,
                assistant_pending: assistantPending,
                waiting,
                fresh_today: freshToday,
                counts,
            },
        };
    }

    // ------------------- INTELLIGENCE -------------------
    if (method === "GET" && normPath === "/intelligence") {
        let briefing;
        try {
            const b = localStorage.getItem(STORAGE_KEYS.BRIEFING);
            briefing = b ? JSON.parse(b) : computeBriefing(emails);
        } catch {
            briefing = computeBriefing(emails);
        }

        const meetings = emails
            .filter((e) => e.meeting && e.meeting.title && !e.archived)
            .map((e) => ({
                email_id: e.id,
                title: e.meeting.title,
                start: e.meeting.start,
                location: e.meeting.location,
            }));

        const followups = emails
            .filter((e) => e.responsibility === "assistant" && !e.handled && !e.archived)
            .slice(0, 10)
            .map((e) => ({
                email_id: e.id,
                subject: e.subject,
                sender_name: e.sender_name,
            }));

        const needs_review = emails
            .filter((e) => e.responsibility === "client" && !e.handled && !e.archived)
            .slice(0, 10)
            .map((e) => ({
                email_id: e.id,
                subject: e.subject,
                sender_name: e.sender_name,
                reason: e.classification_reason || "Needs executive review",
            }));

        const deadlines = emails
            .filter((e) => e.deadline && !e.archived)
            .map((e) => ({
                email_id: e.id,
                subject: e.subject,
                deadline_label: e.deadline_label || "Upcoming deadline",
            }));

        return {
            data: {
                briefing,
                briefing_source: "ai",
                meetings,
                followups,
                needs_review,
                deadlines,
            },
        };
    }

    // POST /briefing/refresh
    if (method === "POST" && normPath === "/briefing/refresh") {
        const briefing = computeBriefing(emails);
        localStorage.setItem(STORAGE_KEYS.BRIEFING, JSON.stringify(briefing));
        return { data: { ok: true, briefing } };
    }

    // ------------------- CLIENT SUMMARY -------------------
    if (method === "GET" && normPath === "/client/summary") {
        const pending = emails.filter((e) => e.responsibility === "client" && !e.handled && !e.archived).length;
        const urgent = emails.filter(
            (e) => (e.priority === "urgent" || e.priority === "high") && e.responsibility === "client" && !e.handled && !e.archived
        ).length;
        const deadlinesCount = emails.filter((e) => e.deadline && !e.archived).length;

        const attention = emails.filter((e) => e.responsibility === "client" && !e.handled && !e.archived);
        const handled = emails.filter((e) => e.handled && !e.archived).slice(0, 10);

        const events = [];
        emails.forEach((e) => {
            if (e.deadline && !e.archived) {
                events.push({ kind: "deadline", email_id: e.id, title: e.subject, start: e.deadline, location: null });
            }
            if (e.meeting && !e.archived) {
                events.push({ kind: "meeting", email_id: e.id, title: e.meeting.title, start: e.meeting.start, location: e.meeting.location });
            }
        });

        return {
            data: {
                pending_responses: pending,
                urgent_decisions: urgent,
                upcoming_deadlines: deadlinesCount,
                attention,
                handled,
                events,
            },
        };
    }

    // ------------------- ACCOUNTS -------------------
    const accounts = getStoredAccounts();
    if (method === "GET" && normPath === "/accounts") {
        return { data: { items: accounts } };
    }
    const syncMatch = normPath.match(/^\/accounts\/([^/]+)\/sync$/);
    if (method === "POST" && syncMatch) {
        const id = syncMatch[1];
        const acc = accounts.find((a) => a.id === id);
        const now = new Date().toISOString();
        if (acc) {
            acc.last_sync = now;
            setStoredAccounts(accounts);
        }
        return { data: { ok: true, last_sync: now } };
    }

    // ------------------- ASSISTANT MESSAGES -------------------
    if (method === "GET" && normPath === "/assistant/messages") {
        let msgs = [];
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
            if (raw) msgs = JSON.parse(raw);
        } catch {}
        const sid = params.session_id || "general";
        return { data: msgs.filter((m) => m.session_id === sid) };
    }

    // Fallback
    return { data: { ok: true } };
}

/**
 * Handle in-browser SSE streaming
 */
export async function handleMockSSE(path, body, { onDelta, onDone, onError } = {}, signal) {
    const normPath = path.replace(/^\/api/, "").replace(/\/+$/, "") || "/";
    const user = getStoredUser();

    try {
        if (normPath === "/assistant/chat") {
            const { session_id, message, email_id } = body || {};

            // Save user message
            let msgs = [];
            try {
                msgs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "[]");
            } catch {}
            msgs.push({
                id: `msg-${Date.now()}-u`,
                session_id: session_id || "general",
                role: "user",
                content: message || "",
                created_at: new Date().toISOString(),
            });

            const emails = getStoredEmails();
            const email = email_id ? emails.find((e) => e.id === email_id) : null;

            let responseText = "";
            const msgLower = (message || "").toLowerCase();

            if (email) {
                responseText = `I've reviewed the thread for "${email.subject}". ${
                    email.ai_summary ? `Key summary: ${email.ai_summary}` : ""
                } I can help draft a response, set reminders for the deadline, or reassign it. Would you like me to generate a draft reply?`;
            } else if (msgLower.includes("draft") || msgLower.includes("reply")) {
                responseText = "I can draft a reply right away. Select any email in your inbox or tell me who you'd like to reach out to.";
            } else if (msgLower.includes("urgent") || msgLower.includes("priority")) {
                const urgentCount = emails.filter((e) => (e.priority === "urgent" || e.priority === "high") && !e.handled).length;
                responseText = `You currently have ${urgentCount} high or urgent priority emails requiring attention in your workspace. Would you like me to walk through them?`;
            } else {
                responseText = `Hello ${user?.name || "there"}! I'm your InboxPilot assistant. I can help organize your inbox, prioritize incoming threads, draft contextual replies, and track meeting deadlines. What would you like to handle today?`;
            }

            // Stream words
            const words = responseText.split(" ");
            for (let i = 0; i < words.length; i++) {
                if (signal?.aborted) return;
                onDelta?.(words[i] + (i < words.length - 1 ? " " : ""));
                await new Promise((r) => setTimeout(r, 25));
            }

            // Save assistant message
            msgs.push({
                id: `msg-${Date.now()}-a`,
                session_id: session_id || "general",
                role: "assistant",
                content: responseText,
                created_at: new Date().toISOString(),
            });
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));

            onDone?.({ done: true });
            return;
        }

        if (normPath === "/assistant/draft") {
            const { email_id } = body || {};
            const emails = getStoredEmails();
            const email = emails.find((e) => e.id === email_id);

            let draftText = "";
            if (email) {
                draftText = `Hi ${email.sender_name},\n\nThank you for reaching out regarding "${email.subject}".\n\nI have reviewed the details and will proceed with the necessary steps. I will update you as soon as we make progress.\n\nBest regards,\n${
                    user?.name || "Alex Morgan"
                }`;
            } else {
                draftText = "Thank you for your message. I will review this and follow up shortly.";
            }

            const words = draftText.split(" ");
            for (let i = 0; i < words.length; i++) {
                if (signal?.aborted) return;
                onDelta?.(words[i] + (i < words.length - 1 ? " " : ""));
                await new Promise((r) => setTimeout(r, 25));
            }

            onDone?.({ done: true });
            return;
        }

        onDone?.({ done: true });
    } catch (e) {
        onError?.(e.message || "Streaming failed");
    }
}
