"""
InboxPilot — AI Email Workspace Backend
FastAPI server with cookie-based session auth, email management,
AI-powered classification, briefings, and assistant chat.
"""

import os
import json
import uuid
import hashlib
import secrets
import sqlite3
import asyncio
from datetime import datetime, timedelta
from contextlib import contextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from itsdangerous import URLSafeSerializer

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./inboxpilot.db").replace("sqlite:///", "")
if not DB_PATH or DB_PATH == "./inboxpilot.db":
    DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inboxpilot.db")

SESSION_COOKIE = "ip_session"
serializer = URLSafeSerializer(SECRET_KEY)

app = FastAPI(title="InboxPilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'assistant',
        title TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS emails (
        id TEXT PRIMARY KEY,
        account_id TEXT DEFAULT 'acc-1',
        subject TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        preview TEXT DEFAULT '',
        received_at TEXT NOT NULL,
        unread INTEGER DEFAULT 1,
        starred INTEGER DEFAULT 0,
        important INTEGER DEFAULT 0,
        archived INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'normal',
        responsibility TEXT DEFAULT 'assistant',
        tint TEXT DEFAULT 'slate',
        ai_summary TEXT DEFAULT '',
        classification_reason TEXT DEFAULT '',
        deadline TEXT,
        deadline_label TEXT,
        meeting_title TEXT,
        meeting_start TEXT,
        meeting_location TEXT,
        action_items TEXT DEFAULT '[]',
        handled INTEGER DEFAULT 0,
        category TEXT DEFAULT 'assistant'
    );
    CREATE TABLE IF NOT EXISTS email_messages (
        id TEXT PRIMARY KEY,
        email_id TEXT NOT NULL,
        from_name TEXT NOT NULL,
        from_email TEXT NOT NULL,
        at TEXT NOT NULL,
        body TEXT NOT NULL,
        FOREIGN KEY (email_id) REFERENCES emails(id)
    );
    CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        email TEXT NOT NULL,
        provider TEXT DEFAULT 'google',
        color TEXT DEFAULT '#4285F4',
        is_primary INTEGER DEFAULT 0,
        status TEXT DEFAULT 'connected',
        last_sync TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS assistant_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS briefings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        data TEXT NOT NULL,
        source TEXT DEFAULT 'ai',
        created_at TEXT DEFAULT (datetime('now'))
    );
    """)
    conn.commit()

    # Seed demo data if empty
    count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if count == 0:
        seed_demo_data(conn)

    conn.close()

# ---------------------------------------------------------------------------
# Password hashing (simple SHA-256 for demo purposes)
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# ---------------------------------------------------------------------------
# Session helpers
# ---------------------------------------------------------------------------
def create_session(response: Response, user_id: str):
    token = serializer.dumps({"uid": user_id})
    response.set_cookie(
        SESSION_COOKIE, token,
        httponly=True, samesite="lax", max_age=86400 * 7
    )

def get_current_user(request: Request):
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        data = serializer.loads(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Not authenticated")
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id=?", (data["uid"],)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return dict(user)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: str
    password: str

class DemoLoginRequest(BaseModel):
    role: str

class ProfileUpdateRequest(BaseModel):
    name: str
    title: str = ""

class EmailPatchRequest(BaseModel):
    starred: Optional[bool] = None
    archived: Optional[bool] = None
    responsibility: Optional[str] = None
    handled: Optional[bool] = None

class ReplyRequest(BaseModel):
    body: str

class ChatRequest(BaseModel):
    session_id: str
    message: str
    email_id: Optional[str] = None

class DraftRequest(BaseModel):
    email_id: str

# ---------------------------------------------------------------------------
# Routes — Health
# ---------------------------------------------------------------------------
@app.get("/api/")
def api_root():
    return {"message": "InboxPilot API is running"}

# ---------------------------------------------------------------------------
# Routes — Auth
# ---------------------------------------------------------------------------
@app.post("/api/auth/login")
def login(req: LoginRequest, response: Response):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (req.email,)).fetchone()
    conn.close()
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = dict(user)
    create_session(response, user["id"])
    return {"user": {"name": user["name"], "email": user["email"], "role": user["role"], "title": user["title"]}}

@app.post("/api/auth/demo")
def demo_login(req: DemoLoginRequest, response: Response):
    conn = get_db()
    email = "assistant@inboxpilot.app" if req.role == "assistant" else "client@inboxpilot.app"
    user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found")
    user = dict(user)
    create_session(response, user["id"])
    return {"user": {"name": user["name"], "email": user["email"], "role": user["role"], "title": user["title"]}}

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}

@app.get("/api/auth/me")
def me(user=Depends(get_current_user)):
    return {"name": user["name"], "email": user["email"], "role": user["role"], "title": user["title"]}

@app.post("/api/auth/profile")
def update_profile(req: ProfileUpdateRequest, user=Depends(get_current_user)):
    conn = get_db()
    conn.execute("UPDATE users SET name=?, title=? WHERE id=?", (req.name, req.title, user["id"]))
    conn.commit()
    conn.close()
    return {"ok": True}

# ---------------------------------------------------------------------------
# Routes — Emails
# ---------------------------------------------------------------------------
def email_row_to_dict(row):
    d = dict(row)
    d["unread"] = bool(d["unread"])
    d["starred"] = bool(d["starred"])
    d["important"] = bool(d["important"])
    d["archived"] = bool(d["archived"])
    d["handled"] = bool(d["handled"])
    try:
        d["action_items"] = json.loads(d.get("action_items") or "[]")
    except Exception:
        d["action_items"] = []
    meeting = None
    if d.get("meeting_title"):
        meeting = {"title": d["meeting_title"], "start": d.get("meeting_start"), "location": d.get("meeting_location")}
    d["meeting"] = meeting
    for k in ("meeting_title", "meeting_start", "meeting_location", "category"):
        d.pop(k, None)
    return d

CATEGORY_FILTERS = {
    "all": "",
    "assistant": "AND responsibility='assistant' AND archived=0",
    "client": "AND responsibility='client' AND archived=0",
    "no_reply": "AND handled=0 AND archived=0",
    "action": "AND json_array_length(action_items)>0 AND archived=0",
    "waiting": "AND responsibility='client' AND handled=0 AND archived=0",
    "important": "AND important=1 AND archived=0",
    "meetings": "AND meeting_title IS NOT NULL AND meeting_title!='' AND archived=0",
    "archived": "AND archived=1",
}

@app.get("/api/emails")
def list_emails(
    category: str = "all",
    q: str = "",
    priority: str = "",
    unread_only: bool = False,
    page: int = 1,
    page_size: int = 25,
    user=Depends(get_current_user),
):
    conn = get_db()

    where = "WHERE 1=1"
    params = []

    cat_filter = CATEGORY_FILTERS.get(category, "")
    where += f" {cat_filter}"

    if q:
        where += " AND (subject LIKE ? OR sender_name LIKE ? OR sender_email LIKE ? OR preview LIKE ?)"
        like = f"%{q}%"
        params += [like, like, like, like]
    if priority:
        where += " AND priority=?"
        params.append(priority)
    if unread_only:
        where += " AND unread=1"

    total = conn.execute(f"SELECT COUNT(*) FROM emails {where}", params).fetchone()[0]
    offset = (page - 1) * page_size
    rows = conn.execute(
        f"SELECT * FROM emails {where} ORDER BY received_at DESC LIMIT ? OFFSET ?",
        params + [page_size, offset],
    ).fetchall()
    items = [email_row_to_dict(r) for r in rows]

    # Category counts
    counts = {}
    for cat, filt in CATEGORY_FILTERS.items():
        c = conn.execute(f"SELECT COUNT(*) FROM emails WHERE 1=1 {filt}").fetchone()[0]
        counts[cat] = c

    conn.close()
    return {"items": items, "total": total, "counts": counts}

@app.get("/api/emails/{email_id}")
def get_email(email_id: str, user=Depends(get_current_user)):
    conn = get_db()
    row = conn.execute("SELECT * FROM emails WHERE id=?", (email_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Email not found")
    email = email_row_to_dict(row)
    messages = conn.execute(
        "SELECT * FROM email_messages WHERE email_id=? ORDER BY at ASC", (email_id,)
    ).fetchall()
    email["messages"] = [dict(m) for m in messages]
    conn.close()
    return email

@app.patch("/api/emails/{email_id}")
def update_email(email_id: str, req: EmailPatchRequest, user=Depends(get_current_user)):
    conn = get_db()
    row = conn.execute("SELECT id FROM emails WHERE id=?", (email_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Email not found")
    updates = []
    params = []
    if req.starred is not None:
        updates.append("starred=?")
        params.append(int(req.starred))
    if req.archived is not None:
        updates.append("archived=?")
        params.append(int(req.archived))
    if req.responsibility is not None:
        updates.append("responsibility=?")
        params.append(req.responsibility)
    if req.handled is not None:
        updates.append("handled=?")
        params.append(int(req.handled))
    if updates:
        params.append(email_id)
        conn.execute(f"UPDATE emails SET {', '.join(updates)} WHERE id=?", params)
        conn.commit()
    updated = conn.execute("SELECT * FROM emails WHERE id=?", (email_id,)).fetchone()
    conn.close()
    return email_row_to_dict(updated)

@app.post("/api/emails/{email_id}/reply")
def reply_email(email_id: str, req: ReplyRequest, user=Depends(get_current_user)):
    conn = get_db()
    row = conn.execute("SELECT * FROM emails WHERE id=?", (email_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Email not found")
    msg_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO email_messages (id, email_id, from_name, from_email, at, body) VALUES (?,?,?,?,?,?)",
        (msg_id, email_id, user["name"], user["email"], now, req.body),
    )
    conn.execute("UPDATE emails SET handled=1 WHERE id=?", (email_id,))
    conn.commit()
    conn.close()
    return {"ok": True, "message_id": msg_id}

# ---------------------------------------------------------------------------
# Routes — Stats
# ---------------------------------------------------------------------------
@app.get("/api/stats")
def get_stats(user=Depends(get_current_user)):
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) FROM emails").fetchone()[0]
    unread = conn.execute("SELECT COUNT(*) FROM emails WHERE unread=1").fetchone()[0]
    action_required = conn.execute("SELECT COUNT(*) FROM emails WHERE json_array_length(action_items)>0 AND handled=0 AND archived=0").fetchone()[0]
    client_attention = conn.execute("SELECT COUNT(*) FROM emails WHERE responsibility='client' AND handled=0 AND archived=0").fetchone()[0]
    assistant_pending = conn.execute("SELECT COUNT(*) FROM emails WHERE responsibility='assistant' AND handled=0 AND archived=0").fetchone()[0]
    waiting = conn.execute("SELECT COUNT(*) FROM emails WHERE responsibility='client' AND handled=0 AND archived=0").fetchone()[0]
    today = datetime.utcnow().strftime("%Y-%m-%d")
    fresh_today = conn.execute("SELECT COUNT(*) FROM emails WHERE received_at >= ?", (today,)).fetchone()[0]

    counts = {}
    for cat, filt in CATEGORY_FILTERS.items():
        c = conn.execute(f"SELECT COUNT(*) FROM emails WHERE 1=1 {filt}").fetchone()[0]
        counts[cat] = c

    conn.close()
    return {
        "total_emails": total,
        "unread": unread,
        "action_required": action_required,
        "client_attention": client_attention,
        "assistant_pending": assistant_pending,
        "waiting": waiting,
        "fresh_today": fresh_today,
        "counts": counts,
    }

# ---------------------------------------------------------------------------
# Routes — Intelligence / Briefing
# ---------------------------------------------------------------------------
def generate_briefing_data(conn):
    """Generate a briefing from current email data."""
    urgent_rows = conn.execute(
        "SELECT id, subject, ai_summary FROM emails WHERE priority IN ('urgent','high') AND archived=0 AND handled=0 LIMIT 5"
    ).fetchall()
    urgent = [{"subject": r["subject"], "why": r["ai_summary"] or "Marked as high priority"} for r in urgent_rows]

    action_rows = conn.execute(
        "SELECT id, subject FROM emails WHERE json_array_length(action_items)>0 AND handled=0 AND archived=0 LIMIT 5"
    ).fetchall()
    focus = [r["subject"] for r in action_rows]

    unread = conn.execute("SELECT COUNT(*) FROM emails WHERE unread=1").fetchone()[0]
    pending = conn.execute("SELECT COUNT(*) FROM emails WHERE handled=0 AND archived=0").fetchone()[0]

    greeting = "Good morning" if datetime.utcnow().hour < 12 else "Good afternoon"

    return {
        "headline": f"You have {unread} unread emails and {pending} items pending attention.",
        "greeting_line": f"{greeting}! Here's your daily inbox briefing.",
        "paragraphs": [
            f"There are {unread} unread messages in your inbox today.",
            f"{pending} emails still need your attention or a response.",
            "I've organized everything by priority and category for you.",
        ],
        "urgent": urgent,
        "focus": focus if focus else ["No immediate action items — you're all caught up!"],
    }

@app.get("/api/intelligence")
def get_intelligence(user=Depends(get_current_user)):
    conn = get_db()

    # Briefing
    briefing_row = conn.execute(
        "SELECT * FROM briefings ORDER BY created_at DESC LIMIT 1"
    ).fetchone()
    if briefing_row:
        briefing = json.loads(briefing_row["data"])
        briefing_source = briefing_row["source"]
    else:
        briefing = generate_briefing_data(conn)
        briefing_source = "generated"

    # Meetings
    meetings = []
    meeting_rows = conn.execute(
        "SELECT id, meeting_title, meeting_start, meeting_location FROM emails WHERE meeting_title IS NOT NULL AND meeting_title!='' AND archived=0"
    ).fetchall()
    for r in meeting_rows:
        meetings.append({
            "email_id": r["id"],
            "title": r["meeting_title"],
            "start": r["meeting_start"],
            "location": r["meeting_location"],
        })

    # Follow-ups
    followup_rows = conn.execute(
        "SELECT id, subject, sender_name FROM emails WHERE responsibility='assistant' AND handled=0 AND archived=0 LIMIT 10"
    ).fetchall()
    followups = [{"email_id": r["id"], "subject": r["subject"], "sender_name": r["sender_name"]} for r in followup_rows]

    # Needs review
    review_rows = conn.execute(
        "SELECT id, subject, sender_name, classification_reason FROM emails WHERE responsibility='client' AND handled=0 AND archived=0 LIMIT 10"
    ).fetchall()
    needs_review = [
        {"email_id": r["id"], "subject": r["subject"], "sender_name": r["sender_name"], "reason": r["classification_reason"] or "Needs your review"}
        for r in review_rows
    ]

    # Deadlines
    deadline_rows = conn.execute(
        "SELECT id, subject, deadline_label FROM emails WHERE deadline IS NOT NULL AND archived=0 ORDER BY deadline ASC LIMIT 10"
    ).fetchall()
    deadlines = [{"email_id": r["id"], "subject": r["subject"], "deadline_label": r["deadline_label"] or ""} for r in deadline_rows]

    conn.close()
    return {
        "briefing": briefing,
        "briefing_source": briefing_source,
        "meetings": meetings,
        "followups": followups,
        "needs_review": needs_review,
        "deadlines": deadlines,
    }

@app.post("/api/briefing/refresh")
async def refresh_briefing(user=Depends(get_current_user)):
    conn = get_db()
    briefing = generate_briefing_data(conn)

    # If OpenAI is configured, enhance with AI
    if OPENAI_API_KEY:
        try:
            import openai
            client = openai.OpenAI(api_key=OPENAI_API_KEY)
            prompt = f"""Generate a concise daily email briefing for an executive assistant.
Current stats: {json.dumps(briefing)}
Write a natural, warm greeting and 2-3 short paragraphs summarizing priorities.
Return JSON with keys: headline, greeting_line, paragraphs (array of strings), urgent (array of {{subject, why}}), focus (array of strings)."""
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=500,
            )
            briefing = json.loads(resp.choices[0].message.content)
        except Exception:
            pass

    bid = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO briefings (id, user_id, data, source) VALUES (?,?,?,?)",
        (bid, user["id"], json.dumps(briefing), "ai" if OPENAI_API_KEY else "generated"),
    )
    conn.commit()
    conn.close()
    return {"ok": True, "briefing": briefing}

# ---------------------------------------------------------------------------
# Routes — Client
# ---------------------------------------------------------------------------
@app.get("/api/client/summary")
def client_summary(user=Depends(get_current_user)):
    conn = get_db()
    pending = conn.execute("SELECT COUNT(*) FROM emails WHERE responsibility='client' AND handled=0 AND archived=0").fetchone()[0]
    urgent = conn.execute("SELECT COUNT(*) FROM emails WHERE priority IN ('urgent','high') AND responsibility='client' AND handled=0 AND archived=0").fetchone()[0]
    deadlines_count = conn.execute("SELECT COUNT(*) FROM emails WHERE deadline IS NOT NULL AND archived=0").fetchone()[0]

    attention_rows = conn.execute(
        "SELECT * FROM emails WHERE responsibility='client' AND handled=0 AND archived=0 ORDER BY received_at DESC LIMIT 20"
    ).fetchall()
    attention = [email_row_to_dict(r) for r in attention_rows]

    handled_rows = conn.execute(
        "SELECT * FROM emails WHERE handled=1 AND archived=0 ORDER BY received_at DESC LIMIT 10"
    ).fetchall()
    handled = [email_row_to_dict(r) for r in handled_rows]

    # Events
    events = []
    deadline_rows = conn.execute(
        "SELECT id, subject, deadline, deadline_label FROM emails WHERE deadline IS NOT NULL AND archived=0"
    ).fetchall()
    for r in deadline_rows:
        events.append({"kind": "deadline", "email_id": r["id"], "title": r["subject"], "start": r["deadline"], "location": None})

    meeting_rows = conn.execute(
        "SELECT id, meeting_title, meeting_start, meeting_location FROM emails WHERE meeting_title IS NOT NULL AND meeting_title!='' AND archived=0"
    ).fetchall()
    for r in meeting_rows:
        events.append({"kind": "meeting", "email_id": r["id"], "title": r["meeting_title"], "start": r["meeting_start"], "location": r["meeting_location"]})

    conn.close()
    return {
        "pending_responses": pending,
        "urgent_decisions": urgent,
        "upcoming_deadlines": deadlines_count,
        "attention": attention,
        "handled": handled,
        "events": events,
    }

# ---------------------------------------------------------------------------
# Routes — Accounts
# ---------------------------------------------------------------------------
@app.get("/api/accounts")
def list_accounts(user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM accounts").fetchall()
    conn.close()
    items = []
    for r in rows:
        items.append({
            "id": r["id"],
            "email": r["email"],
            "provider": r["provider"],
            "color": r["color"],
            "primary": bool(r["is_primary"]),
            "status": r["status"],
            "last_sync": r["last_sync"],
        })
    return {"items": items}

@app.post("/api/accounts/{account_id}/sync")
def sync_account(account_id: str, user=Depends(get_current_user)):
    conn = get_db()
    now = datetime.utcnow().isoformat()
    conn.execute("UPDATE accounts SET last_sync=? WHERE id=?", (now, account_id))
    conn.commit()
    conn.close()
    return {"ok": True, "last_sync": now}

# ---------------------------------------------------------------------------
# Routes — Assistant Chat
# ---------------------------------------------------------------------------
@app.get("/api/assistant/messages")
def get_assistant_messages(session_id: str = "general", user=Depends(get_current_user)):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM assistant_messages WHERE session_id=? ORDER BY created_at ASC",
        (session_id,),
    ).fetchall()
    conn.close()
    return [{"id": r["id"], "role": r["role"], "content": r["content"], "created_at": r["created_at"]} for r in rows]

@app.post("/api/assistant/chat")
async def assistant_chat(req: ChatRequest, user=Depends(get_current_user)):
    conn = get_db()

    # Save user message
    user_msg_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO assistant_messages (id, session_id, role, content, created_at) VALUES (?,?,?,?,?)",
        (user_msg_id, req.session_id, "user", req.message, now),
    )
    conn.commit()

    # Build context
    context_parts = [f"You are InboxPilot AI Assistant, helping manage emails for {user['name']}."]
    if req.email_id:
        email = conn.execute("SELECT * FROM emails WHERE id=?", (req.email_id,)).fetchone()
        if email:
            context_parts.append(f"Current email context — Subject: {email['subject']}, From: {email['sender_name']} <{email['sender_email']}>, Summary: {email['ai_summary']}")

    history = conn.execute(
        "SELECT role, content FROM assistant_messages WHERE session_id=? ORDER BY created_at ASC",
        (req.session_id,),
    ).fetchall()

    conn.close()

    async def generate():
        if OPENAI_API_KEY:
            try:
                import openai
                client = openai.OpenAI(api_key=OPENAI_API_KEY)
                messages = [{"role": "system", "content": " ".join(context_parts)}]
                for h in history[-20:]:
                    messages.append({"role": h["role"], "content": h["content"]})

                stream = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    stream=True,
                    max_tokens=1000,
                )
                full_response = ""
                for chunk in stream:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        full_response += delta
                        yield f"data: {json.dumps({'delta': delta})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"

                # Save assistant response
                c2 = get_db()
                c2.execute(
                    "INSERT INTO assistant_messages (id, session_id, role, content, created_at) VALUES (?,?,?,?,?)",
                    (str(uuid.uuid4()), req.session_id, "assistant", full_response, datetime.utcnow().isoformat()),
                )
                c2.commit()
                c2.close()
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        else:
            # Fallback response without OpenAI
            fallback = f"I'm InboxPilot AI Assistant. I can help you manage your emails, draft replies, and organize your inbox. To enable full AI capabilities, please configure your OpenAI API key in the environment variables."
            for word in fallback.split():
                yield f"data: {json.dumps({'delta': word + ' '})}\n\n"
                await asyncio.sleep(0.03)
            yield f"data: {json.dumps({'done': True})}\n\n"

            c2 = get_db()
            c2.execute(
                "INSERT INTO assistant_messages (id, session_id, role, content, created_at) VALUES (?,?,?,?,?)",
                (str(uuid.uuid4()), req.session_id, "assistant", fallback, datetime.utcnow().isoformat()),
            )
            c2.commit()
            c2.close()

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/api/assistant/draft")
async def assistant_draft(req: DraftRequest, user=Depends(get_current_user)):
    conn = get_db()
    email = conn.execute("SELECT * FROM emails WHERE id=?", (req.email_id,)).fetchone()
    if not email:
        conn.close()
        raise HTTPException(status_code=404, detail="Email not found")

    messages = conn.execute(
        "SELECT * FROM email_messages WHERE email_id=? ORDER BY at ASC", (req.email_id,)
    ).fetchall()
    conn.close()

    thread_text = "\n".join([f"From: {m['from_name']} — {m['body'][:500]}" for m in messages])

    async def generate():
        if OPENAI_API_KEY:
            try:
                import openai
                client = openai.OpenAI(api_key=OPENAI_API_KEY)
                prompt = f"""Draft a professional reply to this email thread.
Subject: {email['subject']}
From: {email['sender_name']} <{email['sender_email']}>
Thread: {thread_text}
Write a concise, professional response on behalf of {user['name']}."""

                stream = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    stream=True,
                    max_tokens=500,
                )
                for chunk in stream:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        yield f"data: {json.dumps({'delta': delta})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        else:
            draft = f"Dear {email['sender_name']},\n\nThank you for your email regarding \"{email['subject']}\". I will review this and get back to you shortly.\n\nBest regards,\n{user['name']}"
            for word in draft.split():
                yield f"data: {json.dumps({'delta': word + ' '})}\n\n"
                await asyncio.sleep(0.03)
            yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

# ---------------------------------------------------------------------------
# Seed Demo Data
# ---------------------------------------------------------------------------
def seed_demo_data(conn):
    """Seed the database with demo users, accounts, and sample emails."""
    # Users
    users = [
        ("u-asst", "Alex Morgan", "assistant@inboxpilot.app", hash_password("demo1234"), "assistant", "Executive Assistant"),
        ("u-client", "Jordan Taylor", "client@inboxpilot.app", hash_password("demo1234"), "client", "CEO"),
    ]
    for u in users:
        conn.execute("INSERT INTO users (id, name, email, password_hash, role, title) VALUES (?,?,?,?,?,?)", u)

    # Accounts
    accounts = [
        ("acc-1", "u-asst", "assistant@inboxpilot.app", "google", "#4285F4", 1, "connected"),
        ("acc-2", "u-asst", "alex.morgan@company.com", "outlook", "#0078D4", 0, "connected"),
    ]
    for a in accounts:
        conn.execute("INSERT INTO accounts (id, user_id, email, provider, color, is_primary, status) VALUES (?,?,?,?,?,?,?)", a)

    # Sample emails
    tints = ["rose", "amber", "emerald", "sky", "violet", "fuchsia", "teal", "orange", "indigo", "cyan"]
    now = datetime.utcnow()

    sample_emails = [
        {
            "id": "em-1", "subject": "Q4 Board Presentation — Final Review",
            "sender_name": "Sarah Chen", "sender_email": "sarah.chen@boardworks.io",
            "preview": "Hi Jordan, attached is the final draft of the Q4 board presentation. Please review slides 12-18 covering the revenue forecast...",
            "received_at": (now - timedelta(hours=1)).isoformat(),
            "priority": "urgent", "responsibility": "client", "tint": "rose",
            "ai_summary": "Board presentation needs final approval before Thursday. Revenue slides require CEO sign-off.",
            "classification_reason": "Contains board materials requiring executive review and approval.",
            "important": 1,
            "action_items": json.dumps(["Review slides 12-18", "Approve revenue forecast", "Send feedback by Wednesday"]),
            "deadline": (now + timedelta(days=2)).strftime("%Y-%m-%dT09:00:00"),
            "deadline_label": "Due Wednesday",
            "messages": [
                {"from_name": "Sarah Chen", "from_email": "sarah.chen@boardworks.io",
                 "body": "Hi Jordan,\n\nAttached is the final draft of the Q4 board presentation. Please review slides 12-18 covering the revenue forecast and market expansion plans.\n\nKey changes since the last version:\n- Updated revenue projections with November actuals\n- Added competitive landscape analysis\n- Revised headcount plan per your feedback\n\nThe board meeting is this Thursday at 2 PM. I'd appreciate your feedback by Wednesday EOD so I can incorporate any final changes.\n\nBest regards,\nSarah"},
            ],
        },
        {
            "id": "em-2", "subject": "Partnership Proposal — Meridian Technologies",
            "sender_name": "David Park", "sender_email": "david.park@meridiantech.com",
            "preview": "Dear Jordan, following our conversation at the Tech Summit, I'd like to formally propose a strategic partnership between our companies...",
            "received_at": (now - timedelta(hours=3)).isoformat(),
            "priority": "high", "responsibility": "client", "tint": "amber",
            "ai_summary": "Strategic partnership proposal from Meridian Technologies following Tech Summit meeting. Requires executive decision.",
            "classification_reason": "Strategic business proposal requiring CEO consideration.",
            "important": 1,
            "action_items": json.dumps(["Review partnership terms", "Schedule follow-up call"]),
            "messages": [
                {"from_name": "David Park", "from_email": "david.park@meridiantech.com",
                 "body": "Dear Jordan,\n\nFollowing our conversation at the Tech Summit last week, I'd like to formally propose a strategic partnership between Meridian Technologies and your company.\n\nOur proposal includes:\n1. Co-development of the AI analytics platform\n2. Shared go-to-market strategy for the enterprise segment\n3. Cross-licensing of our respective IP portfolios\n\nI've attached a detailed term sheet for your review. Would you be available for a deeper discussion next week?\n\nBest regards,\nDavid Park\nCEO, Meridian Technologies"},
            ],
        },
        {
            "id": "em-3", "subject": "Weekly Team Standup — Agenda for Monday",
            "sender_name": "Lisa Wang", "sender_email": "lisa.wang@company.com",
            "preview": "Hi team, here's the agenda for our Monday standup. Please update your status in the shared doc before the meeting...",
            "received_at": (now - timedelta(hours=5)).isoformat(),
            "priority": "normal", "responsibility": "assistant", "tint": "emerald",
            "ai_summary": "Routine weekly standup agenda. Team members need to update status doc before Monday meeting.",
            "classification_reason": "Regular team meeting — can be handled by assistant.",
            "meeting_title": "Weekly Team Standup",
            "meeting_start": (now + timedelta(days=1, hours=9)).isoformat(),
            "meeting_location": "Conference Room B / Zoom",
            "messages": [
                {"from_name": "Lisa Wang", "from_email": "lisa.wang@company.com",
                 "body": "Hi team,\n\nHere's the agenda for our Monday standup:\n\n1. Sprint progress review\n2. Blockers and dependencies\n3. Q4 OKR check-in\n4. New hire onboarding updates\n\nPlease update your status in the shared doc before the meeting.\n\nTime: Monday 10:00 AM\nLocation: Conference Room B / Zoom\n\nThanks,\nLisa"},
            ],
        },
        {
            "id": "em-4", "subject": "Invoice #INV-2024-0892 — November Services",
            "sender_name": "CloudScale Billing", "sender_email": "billing@cloudscale.io",
            "preview": "Your invoice for November cloud infrastructure services is ready. Total amount: $12,450.00. Payment due by December 15th.",
            "received_at": (now - timedelta(hours=8)).isoformat(),
            "priority": "normal", "responsibility": "assistant", "tint": "sky",
            "ai_summary": "Monthly cloud infrastructure invoice. Standard recurring expense. Payment due Dec 15.",
            "classification_reason": "Routine billing — assistant can process and file.",
            "deadline": (now + timedelta(days=30)).strftime("%Y-%m-%dT23:59:00"),
            "deadline_label": "Payment due Dec 15",
            "action_items": json.dumps(["Process payment", "File receipt"]),
            "messages": [
                {"from_name": "CloudScale Billing", "from_email": "billing@cloudscale.io",
                 "body": "Invoice #INV-2024-0892\n\nService Period: November 1-30, 2024\n\nCloud Infrastructure Services:\n- Compute instances: $6,200.00\n- Storage (S3): $2,100.00\n- Data transfer: $1,850.00\n- Support plan: $2,300.00\n\nTotal: $12,450.00\n\nPayment due: December 15, 2024\n\nPay online at: billing.cloudscale.io/pay\n\nThank you for your business."},
            ],
        },
        {
            "id": "em-5", "subject": "Re: Project Atlas — Phase 2 Timeline Update",
            "sender_name": "Marcus Rivera", "sender_email": "m.rivera@company.com",
            "preview": "Hey team, quick update on Phase 2 — we're tracking 2 weeks ahead of schedule on the core API work...",
            "received_at": (now - timedelta(hours=10)).isoformat(),
            "priority": "normal", "responsibility": "assistant", "tint": "violet",
            "ai_summary": "Project Atlas Phase 2 is ahead of schedule. Core API work progressing well. QA to start next week.",
            "classification_reason": "Project update — informational, assistant can monitor.",
            "messages": [
                {"from_name": "Marcus Rivera", "from_email": "m.rivera@company.com",
                 "body": "Hey team,\n\nQuick update on Phase 2 — we're tracking 2 weeks ahead of schedule on the core API work. Here's where we stand:\n\n✅ Authentication service — complete\n✅ Data pipeline — complete\n🔄 Analytics dashboard — 80% done\n🔄 Mobile API endpoints — 60% done\n⬜ Load testing — starting next week\n\nQA will begin their testing cycle on Monday. No blockers at the moment.\n\nI'll share a more detailed report in Friday's sync.\n\nCheers,\nMarcus"},
            ],
        },
        {
            "id": "em-6", "subject": "Lunch with Investor — Calendar Hold",
            "sender_name": "Rachel Foster", "sender_email": "rachel@company.com",
            "preview": "Hi Jordan, I've set up a lunch meeting with James Liu from Sequoia. He's interested in discussing our Series B...",
            "received_at": (now - timedelta(hours=12)).isoformat(),
            "priority": "high", "responsibility": "client", "tint": "fuchsia",
            "ai_summary": "Investor lunch meeting arranged with Sequoia partner. Series B discussion. Calendar hold needed.",
            "classification_reason": "Investor meeting requiring CEO attendance and preparation.",
            "important": 1,
            "meeting_title": "Lunch with James Liu (Sequoia)",
            "meeting_start": (now + timedelta(days=3, hours=12)).isoformat(),
            "meeting_location": "Nobu Downtown",
            "action_items": json.dumps(["Confirm attendance", "Review Series B deck"]),
            "messages": [
                {"from_name": "Rachel Foster", "from_email": "rachel@company.com",
                 "body": "Hi Jordan,\n\nI've set up a lunch meeting with James Liu from Sequoia Capital. He's very interested in discussing our Series B and wants to learn more about our AI product roadmap.\n\nDetails:\n📅 Date: This Thursday\n🕐 Time: 12:30 PM\n📍 Location: Nobu Downtown\n\nI've sent a calendar hold. Please confirm your availability and I'll send the final confirmation.\n\nAlso, should I prepare an updated pitch deck or use the existing one?\n\nThanks,\nRachel"},
            ],
        },
        {
            "id": "em-7", "subject": "New Employee Onboarding — Week 1 Checklist",
            "sender_name": "HR Team", "sender_email": "hr@company.com",
            "preview": "Welcome aboard! Here's your week 1 onboarding checklist. Please complete the following items by Friday...",
            "received_at": (now - timedelta(hours=15)).isoformat(),
            "priority": "low", "responsibility": "assistant", "tint": "teal",
            "ai_summary": "Standard HR onboarding checklist for new hires. Routine administrative task.",
            "classification_reason": "HR administrative — assistant can coordinate.",
            "action_items": json.dumps(["Forward to new hire", "Set up orientation schedule"]),
            "messages": [
                {"from_name": "HR Team", "from_email": "hr@company.com",
                 "body": "Welcome aboard!\n\nHere's the Week 1 onboarding checklist for our new team members:\n\n☐ Complete I-9 and W-4 forms\n☐ Set up email and Slack accounts\n☐ Review employee handbook\n☐ Schedule 1:1 with manager\n☐ Complete security training\n☐ Set up development environment\n\nPlease ensure all items are completed by Friday.\n\nBest,\nHR Team"},
            ],
        },
        {
            "id": "em-8", "subject": "Urgent: Production Incident — API Latency Spike",
            "sender_name": "DevOps Alert", "sender_email": "alerts@company.com",
            "preview": "ALERT: API response times have exceeded 5s threshold. P95 latency at 8.2s. Engineering team has been notified...",
            "received_at": (now - timedelta(hours=2)).isoformat(),
            "priority": "urgent", "responsibility": "assistant", "tint": "orange",
            "ai_summary": "Production API latency incident. P95 at 8.2s (threshold 5s). Engineering team notified and investigating.",
            "classification_reason": "Technical incident — assistant should monitor and escalate if needed.",
            "important": 1, "unread": 1,
            "action_items": json.dumps(["Monitor incident status", "Escalate if not resolved in 1 hour"]),
            "messages": [
                {"from_name": "DevOps Alert", "from_email": "alerts@company.com",
                 "body": "🚨 PRODUCTION INCIDENT — HIGH SEVERITY\n\nService: Core API Gateway\nStarted: 2 hours ago\nStatus: Investigating\n\nMetrics:\n- P95 Latency: 8.2s (threshold: 5s)\n- Error Rate: 2.3% (threshold: 1%)\n- Affected Users: ~15%\n\nEngineering team has been paged. Current hypothesis is a database connection pool exhaustion.\n\nNext update in 30 minutes.\n\n— DevOps Monitoring"},
            ],
        },
        {
            "id": "em-9", "subject": "Conference Speaking Invitation — AI Summit 2025",
            "sender_name": "Emily Nakamura", "sender_email": "emily@aisummit.org",
            "preview": "Dear Jordan, we'd be honored to have you as a keynote speaker at AI Summit 2025. The event will be held in San Francisco...",
            "received_at": (now - timedelta(days=1)).isoformat(),
            "priority": "normal", "responsibility": "client", "tint": "indigo",
            "ai_summary": "Keynote speaking invitation for AI Summit 2025 in San Francisco. Requires CEO decision on participation.",
            "classification_reason": "Public speaking opportunity — needs CEO consideration.",
            "action_items": json.dumps(["Review event details", "Decide on participation"]),
            "deadline": (now + timedelta(days=14)).strftime("%Y-%m-%dT23:59:00"),
            "deadline_label": "RSVP by Dec 1",
            "messages": [
                {"from_name": "Emily Nakamura", "from_email": "emily@aisummit.org",
                 "body": "Dear Jordan,\n\nWe'd be honored to have you as a keynote speaker at AI Summit 2025.\n\nEvent Details:\n📅 March 15-17, 2025\n📍 Moscone Center, San Francisco\n👥 Expected attendance: 5,000+\n\nWe're particularly interested in your perspective on AI-powered productivity tools and the future of work.\n\nSpeaker benefits include:\n- Keynote slot (45 minutes)\n- VIP networking dinner\n- Full conference pass\n- Travel and accommodation covered\n\nPlease let us know by December 1st if you're interested.\n\nBest regards,\nEmily Nakamura\nProgram Director, AI Summit"},
            ],
        },
        {
            "id": "em-10", "subject": "Monthly Newsletter — Industry Digest",
            "sender_name": "TechWatch", "sender_email": "digest@techwatch.io",
            "preview": "This month in tech: AI regulation updates, cloud market shifts, and the latest in enterprise SaaS...",
            "received_at": (now - timedelta(days=1, hours=5)).isoformat(),
            "priority": "low", "responsibility": "assistant", "tint": "cyan",
            "ai_summary": "Monthly tech industry newsletter. Informational only — no action required.",
            "classification_reason": "Newsletter — low priority, informational.",
            "handled": 1,
            "messages": [
                {"from_name": "TechWatch", "from_email": "digest@techwatch.io",
                 "body": "📬 TechWatch Monthly Digest\n\nTop Stories:\n\n1. EU AI Act enters enforcement phase\n2. Cloud spending reaches $200B globally\n3. Enterprise AI adoption up 45% YoY\n4. Remote work tools market consolidation\n5. Cybersecurity spending forecast for 2025\n\nRead the full digest at techwatch.io/november\n\nUnsubscribe | Update preferences"},
            ],
        },
        {
            "id": "em-11", "subject": "Legal Review — Vendor Agreement with DataSync",
            "sender_name": "Katherine Osei", "sender_email": "k.osei@legalpartners.com",
            "preview": "Hi Alex, I've completed the review of the DataSync vendor agreement. There are three clauses that need attention...",
            "received_at": (now - timedelta(hours=6)).isoformat(),
            "priority": "high", "responsibility": "assistant", "tint": "rose",
            "ai_summary": "Legal review complete for DataSync vendor agreement. Three clauses flagged for revision before signing.",
            "classification_reason": "Legal matter — assistant can coordinate revisions before escalating for signature.",
            "action_items": json.dumps(["Review flagged clauses", "Coordinate revisions with legal", "Prepare for CEO signature"]),
            "deadline": (now + timedelta(days=5)).strftime("%Y-%m-%dT17:00:00"),
            "deadline_label": "Sign by next Friday",
            "messages": [
                {"from_name": "Katherine Osei", "from_email": "k.osei@legalpartners.com",
                 "body": "Hi Alex,\n\nI've completed the review of the DataSync vendor agreement. There are three clauses that need attention:\n\n1. Section 4.2 — Data retention period should be 90 days, not 180\n2. Section 7.1 — Indemnification clause is too broad\n3. Section 9.3 — Auto-renewal should require 60 days notice\n\nI've marked up the document with suggested revisions. Please coordinate with DataSync's legal team and let me know once they've responded.\n\nTarget: Finalize by next Friday for CEO signature.\n\nBest,\nKatherine Osei\nSenior Counsel, Legal Partners LLP"},
            ],
        },
        {
            "id": "em-12", "subject": "Team Offsite Planning — Venue Options",
            "sender_name": "Priya Sharma", "sender_email": "priya@company.com",
            "preview": "Hi Alex, I've narrowed down the venue options for the Q1 team offsite to three locations...",
            "received_at": (now - timedelta(hours=20)).isoformat(),
            "priority": "normal", "responsibility": "assistant", "tint": "amber",
            "ai_summary": "Three venue options for Q1 team offsite. Assistant to review and shortlist before presenting to leadership.",
            "classification_reason": "Event planning — assistant responsibility.",
            "action_items": json.dumps(["Compare venue options", "Get budget approval", "Book preferred venue"]),
            "messages": [
                {"from_name": "Priya Sharma", "from_email": "priya@company.com",
                 "body": "Hi Alex,\n\nI've narrowed down the venue options for the Q1 team offsite:\n\n1. The Grand Hotel — Downtown, $8,500/day, seats 100\n2. Lakeside Retreat — 45 min from office, $6,200/day, seats 80\n3. Innovation Hub — Tech district, $5,800/day, seats 60\n\nAll three are available Jan 15-17. I need to hold the booking by next Wednesday.\n\nWhich one should I move forward with? Or would you like to visit any of them first?\n\nThanks,\nPriya"},
            ],
        },
    ]

    for e in sample_emails:
        messages = e.pop("messages", [])
        unread = e.pop("unread", 0)
        important = e.pop("important", 0)
        handled = e.pop("handled", 0)

        conn.execute("""
            INSERT INTO emails (id, subject, sender_name, sender_email, preview, received_at,
                unread, starred, important, archived, priority, responsibility, tint,
                ai_summary, classification_reason, deadline, deadline_label,
                meeting_title, meeting_start, meeting_location, action_items, handled)
            VALUES (?,?,?,?,?,?, ?,0,?,0,?,?,?, ?,?,?,?, ?,?,?,?,?)
        """, (
            e["id"], e["subject"], e["sender_name"], e["sender_email"], e["preview"], e["received_at"],
            unread, important, e.get("priority", "normal"), e.get("responsibility", "assistant"), e.get("tint", "slate"),
            e.get("ai_summary", ""), e.get("classification_reason", ""), e.get("deadline"), e.get("deadline_label"),
            e.get("meeting_title"), e.get("meeting_start"), e.get("meeting_location"),
            e.get("action_items", "[]"), handled,
        ))

        for i, msg in enumerate(messages):
            msg_id = f"{e['id']}-msg-{i+1}"
            at = (datetime.fromisoformat(e["received_at"]) + timedelta(minutes=i)).isoformat()
            conn.execute(
                "INSERT INTO email_messages (id, email_id, from_name, from_email, at, body) VALUES (?,?,?,?,?,?)",
                (msg_id, e["id"], msg["from_name"], msg["from_email"], at, msg["body"]),
            )

    # Initial briefing
    briefing = generate_briefing_data(conn)
    conn.execute(
        "INSERT INTO briefings (id, user_id, data, source) VALUES (?,?,?,?)",
        (str(uuid.uuid4()), "u-asst", json.dumps(briefing), "generated"),
    )

    conn.commit()

# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup():
    init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
