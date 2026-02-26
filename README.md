# API Monitoring & Incident Response Platform

Production-ready API monitoring SaaS foundation built with Next.js 14 App Router, MongoDB, Redis, BullMQ, Node Cron, and Nodemailer.

## 1. Folder Structure

```text
src/
 ┣ app/
 ┃ ┣ actions/
 ┃ ┣ api/
 ┃ ┣ incidents/
 ┃ ┣ monitors/[id]/
 ┃ ┣ status/
 ┣ components/
 ┣ lib/
 ┃ ┣ db.ts
 ┃ ┣ redis.ts
 ┃ ┣ queue.ts
 ┃ ┣ mail.ts
 ┣ models/
 ┃ ┣ Monitor.ts
 ┃ ┣ Incident.ts
 ┣ worker/
 ┃ ┗ monitorWorker.ts
 ┣ jobs/
 ┃ ┗ monitorJob.ts
```

## 2. Project Setup

```bash
npm install
cp .env.example .env.local
```

Fill environment variables:

```env
MONGODB_URI=
REDIS_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ALERT_EMAIL_TO=
APP_URL=http://localhost:3000
```

## 3. Run Services

Run all processes (web + worker + scheduler):

```bash
npm run dev
```

Or run independently:

```bash
npm run dev:web
npm run dev:worker
npm run dev:scheduler
```

## 4. Implemented Features

- Monitor creation (Server Actions + API route)
- Async health checks (BullMQ + worker)
- Response time measurement (Axios timing)
- Incident detection and lifecycle (open/retry/recovered)
- Email alerts for down/recovery (Nodemailer)
- ISR status page (`/status`)
- Incident timeline (`/incidents`)
- Latency charts (Recharts)
- Dashboard (`/`)
- Monitoring scheduler (Node Cron)

## 5. API Routes

- `GET /api/monitors`
- `POST /api/monitors`
- `GET /api/incidents`
- `GET /api/status`
