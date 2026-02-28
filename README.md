# Jeffrey HQ — Mission Control Dashboard

Das interne Dashboard für das **Dealsky AI Agent Netzwerk**. Gebaut mit Next.js 14 (App Router), Tailwind CSS, und einfacher Password-Auth via signed JWT Cookies.

---

## Features

- 🔐 **Password Auth** — Shared Secret, JWT-Session (7 Tage), kein OAuth
- 🤖 **Agent Übersicht** — 5 Agenten mit Status, Modell, Skills
- 📋 **Task Board** — Kanban: Scheduled → Running → Done
- ⏰ **Cron Jobs** — Übersicht aller geplanten Agent-Jobs
- 🌑 **Dark Mode** — Professionelles Design, Akzentfarbe Indigo
- 🚫 **SEO-Block** — noindex überall, robots.txt Disallow: /

---

## Local Development

```bash
# 1. Clone / navigate to project
cd jeffrey-hq

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local and set your password + secret

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

### .env.local Beispiel

```env
HQ_PASSWORD=mein-sicheres-passwort
SESSION_SECRET=super-random-min-32-chars-geheim!!
```

> **Tipp:** Session Secret generieren mit:
> ```bash
> openssl rand -base64 32
> ```

---

## Vercel Deployment

### 1. Repository vorbereiten

```bash
git init
git add .
git commit -m "feat: Jeffrey HQ initial deploy"
git remote add origin https://github.com/dealskyxassistant/jeffrey-hq.git
git push -u origin main
```

### 2. Vercel CLI Deploy

```bash
# Install Vercel CLI (einmalig)
npm i -g vercel

# Deploy
vercel

# Folge dem Setup-Wizard:
# - Framework: Next.js (auto-detected)
# - Root Directory: ./
# - Build Command: next build
```

### 3. Environment Variables setzen

In Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|---|---|---|
| `HQ_PASSWORD` | dein-passwort | Production, Preview |
| `SESSION_SECRET` | 32+ char random string | Production, Preview |

**Oder via CLI:**
```bash
vercel env add HQ_PASSWORD
vercel env add SESSION_SECRET
```

### 4. Production Deploy

```bash
vercel --prod
```

---

## Custom Domain (jeffrey-hq.dealsky.io)

### In Vercel Dashboard:
1. Project → **Settings** → **Domains**
2. Domain eingeben: `hq.dealsky.io`
3. **Add** klicken

### DNS-Einträge bei deinem Domain-Provider:

**Option A — CNAME (empfohlen für Subdomain):**
```
Type:  CNAME
Name:  hq
Value: cname.vercel-dns.com
TTL:   Auto
```

**Option B — A-Record (für Apex Domain):**
```
Type:  A
Name:  @
Value: 76.76.21.21
TTL:   Auto
```

### SSL:
Vercel stellt automatisch ein kostenloses SSL-Zertifikat (Let's Encrypt) aus. Kein Setup nötig.

### Propagation:
DNS-Änderungen können 0–48h dauern. Status prüfen:
```bash
dig hq.dealsky.io
# oder
nslookup hq.dealsky.io
```

---

## Architektur

```
jeffrey-hq/
├── app/
│   ├── layout.tsx          # Root Layout (noindex meta)
│   ├── page.tsx            # Dashboard (agents + cron)
│   ├── login/page.tsx      # Login Page
│   ├── agents/page.tsx     # Agent Detail View
│   ├── tasks/page.tsx      # Kanban Task Board
│   └── api/
│       ├── auth/route.ts   # POST login / DELETE logout
│       └── tasks/route.ts  # GET/POST/PATCH tasks
├── components/
│   ├── Nav.tsx             # Navigation + Logout
│   ├── AgentCard.tsx       # Agent Card Component
│   └── TaskBoard.tsx       # Kanban Board (Client)
├── data/
│   └── tasks.json          # Task Daten (editierbar)
├── middleware.ts            # JWT Auth Guard
├── public/robots.txt        # Disallow: /
└── vercel.json             # Vercel Config + Security Headers
```

## Auth Flow

```
Request → middleware.ts
  ├── /login, /api/auth → Public (allow)
  ├── Cookie "hq_session" present?
  │   ├── Valid JWT → Next()
  │   └── Invalid JWT → Redirect /login + clear cookie
  └── No cookie → Redirect /login

POST /api/auth
  ├── password === HQ_PASSWORD?
  │   ├── ✅ Sign JWT (7d) → Set cookie → 200
  │   └── ❌ 401
```

---

## Tasks API

```bash
# Alle Tasks laden
GET /api/tasks

# Task erstellen
POST /api/tasks
{ "status": "scheduled", "title": "...", "agent": "Jeffrey", "description": "..." }

# Task verschieben
PATCH /api/tasks
{ "id": "...", "fromStatus": "scheduled", "toStatus": "running" }
```

---

## Agenten

| Agent | Emoji | Modell | Rolle |
|---|---|---|---|
| Jeffrey | 🧠 | Claude Sonnet | Orchestrator |
| Leads | 🔍 | GPT-4o | Lead Recherche |
| Copy | ✍️ | Claude Sonnet | Outreach Copy |
| Coding | 💻 | Claude Sonnet | Dev |
| Research | 🔬 | GPT-4o | Marktanalyse |

---

Built with ❤️ by Jeffrey (Dealsky AI Agent Network)
