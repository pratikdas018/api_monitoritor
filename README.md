# API Monitoring SaaS Platform

Production-ready API monitoring and incident response platform built with Next.js 14, MongoDB, Redis, BullMQ, and Nodemailer.

## Overview

This platform monitors API endpoints on a schedule, records uptime and latency, creates incidents on failure, auto-resolves incidents on recovery, and exposes both:

- Public landing page (`/`)
- Login page (`/login`)
- Internal dashboard (`/dashboard`)
- Public status page (`/status`)

## Tech Stack

- Next.js 14 App Router
- TypeScript + Tailwind CSS
- MongoDB + Mongoose
- Redis + BullMQ
- Node Cron scheduler
- Axios monitoring engine
- Nodemailer alerting
- Recharts analytics

## Project Structure

```text
src/
  app/
    actions/
    api/
      incidents/
      monitors/
      status/
    incidents/
    monitors/[id]/
    status/
  components/
    status/
  jobs/
    monitorJob.ts
  lib/
    alerts.ts
    alertChannels.ts
    db.ts
    projects.ts
    regions.ts
    redis.ts
    queue.ts
    mail.ts
    monitoring.ts
    queries.ts
    uptime.ts
  models/
    AlertChannel.ts
    CheckHistory.ts
    Monitor.ts
    Incident.ts
    Project.ts
  worker/
    monitorWorker.ts
```

## Features

- Monitor creation with interval selection (1/5/10 min)
- Project/workspace grouping for monitors
- Async checks via BullMQ worker
- Scheduler-based dispatch via Node Cron
- Multi-region checks (India/US/Europe)
- Retry strategy (10s -> 30s -> incident creation)
- Uptime, latency, and check-history tracking
- Incident lifecycle:
  - create `OPEN` on failure
  - retry updates while still failing
  - auto-resolve to `RESOLVED` on recovery
- Alert channels: Email, Slack webhook, Discord webhook, Telegram bot
- High latency alerting
- SLA badges per monitor:
  - 99%
  - 99.9%
  - 99.99%
- Performance metrics: avg latency, P95 latency, error rate, status-code distribution
- Public status page with operational banner, service list, incident history, and latency trend
- Responsive SaaS-style UI + global footer

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required/used variables:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/api_monitor
REDIS_URL=redis://127.0.0.1:6379

DEFAULT_MONITOR_TIMEOUT_MS=10000
MONITOR_SCHEDULER_CRON=*/1 * * * *
MONITOR_WORKER_CONCURRENCY=5
MONITOR_REGIONS=India,US,Europe
MONITOR_ENQUEUE_TIMEOUT_MS=4500
MONITOR_CREATE_INLINE_TIMEOUT_MS=2500
MONITOR_HIGH_LATENCY_MS=2000
DISPLAY_TIMEZONE=Asia/Kolkata

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<email>
SMTP_PASS=<app-password>
SMTP_FROM=<email>
ALERT_EMAIL_TO=<comma-separated-emails>

APP_URL=http://localhost:3000
APP_LOGIN_EMAIL=admin@apimonitor.local
APP_LOGIN_PASSWORD=admin123
```

Production note:
- Set `REDIS_URL` explicitly in all runtimes (web, worker, scheduler). In production, missing `REDIS_URL` now fails fast instead of falling back to localhost.

## Getting Started

Install dependencies:

```bash
npm install
```

Run all services together:

```bash
npm run dev
```

This starts:

- Web app (`npm run dev:web`)
- Worker (`npm run dev:worker`)
- Scheduler (`npm run dev:scheduler`)

## Scripts

- `npm run dev` - run web + worker + scheduler
- `npm run dev:web` - Next.js app only
- `npm run dev:worker` - BullMQ worker only
- `npm run dev:scheduler` - cron scheduler only
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint checks

## API Routes

- `GET /api/monitors`
- `POST /api/monitors`
- `GET /api/incidents`
- `GET /api/status`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/history`

## Pages

- `/` - internal monitoring dashboard
- `/` - public landing page
- `/login` - login page
- `/dashboard` - internal monitoring dashboard (protected)
- `/incidents` - incident timeline
- `/monitors/[id]` - monitor details + latency + incidents
- `/status` - public status page (no auth)

## Uptime and SLA

Uptime is calculated as:

```text
uptimePercentage = (totalChecks - failureCount) / totalChecks * 100
```

SLA status is evaluated against targets:

- 99%
- 99.9%
- 99.99%

Badge rules:

- `MET` = green
- `BREACHED` = red

## Troubleshooting

- If monitor creation succeeds but shows an error message, restart all processes and verify Redis/SMTP config.
- If worker cannot connect to Redis, ensure Redis is running on `REDIS_URL`.
- If emails are not sent, verify SMTP host/port/security and app password.
- If MongoDB fails with TLS/network errors, validate Atlas network access and URI format.

## Build Validation

Typical validation flow:

```bash
npm run lint
npx tsc --noEmit
npm run build
```
