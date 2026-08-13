# Risk & Issue Register — Akij Resource

Interactive web app for recording and monitoring project control risks, issues and
changes during execution. Mirrors the existing **Risk Assessment Form** (Google Forms)
and **Risk Assessment Log** (Google Sheets) but as a self-hosted, interactive register
with dashboards, status tracking and a likelihood × impact heat map.

Built with **Next.js 16 (App Router), TypeScript and Tailwind CSS**. Deploys to
**Vercel** as a global app.

## Features

- **Dashboard** — KPIs (total / open / escalated / high-risk), likelihood × impact
  heat map, risks by category and by project, recent risks.
- **Risk Register** — searchable, filterable table (category, status, project,
  likelihood, impact).
- **New Risk** — form with the exact fields of the Google Form:
  Email, Project ID, Risk ID (auto-suggested), Date of Raising, Project Name,
  Project Zone/Area, Identifier Name & Employee ID, Category, Description,
  Likelihood, Impact, Responsible, Accountable, Mitigation Plan, Status, Attachment.
- **Risk Detail** — full record plus a timestamped update log for tracking status
  changes (Open → Mitigating → Closed / Escalated).

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app seeds 6 sample risks on first run. Without a
database configured, risks are stored in `data/risks.json` (dev only).

## Deploying to Vercel

### Option A — with a database (recommended)

1. Push this folder to a GitHub/GitLab repo.
2. In Vercel, click **Add New → Project** and import the repo.
3. While on the project page, go to **Storage** → **Create Database** → **Postgres**
   (Vercel's managed Postgres, free tier available). This automatically provides the
   `POSTGRES_URL` environment variable to your deployment.
4. Vercel detects Next.js automatically — build command `npm run build`, output
   `next build`. Click **Deploy**.
5. When the app's data layer sees `POSTGRES_URL`, it creates the `risks` table and
   persists there.

### Option B — quick preview (no database)

Import the repo to Vercel and deploy as-is. Pages and forms work, but data is written
to the ephemeral filesystem and will reset — only use this for a demo.

## Configuration

| Variable        | Purpose                                       |
| --------------- | --------------------------------------------- |
| `POSTGRES_URL`  | Set automatically by Vercel Postgres storage. When present the app uses Postgres instead of the local JSON file. |

## API

- `GET /api/risks` — list all risks
- `POST /api/risks` — create a risk
- `GET /api/risks/[id]` — get one risk
- `POST /api/risks/[id]` — add a status update

## Project structure

```
src/
  app/
    page.tsx            # dashboard
    risks/page.tsx      # register (client, filters)
    risks/new/page.tsx  # new risk form
    risks/[id]/page.tsx # detail + update history
    api/risks/          # REST API
  components/           # chip, panel, header
  lib/
    risk.ts             # types, constants, scoring
    store.ts            # JSON file store (dev)
    postgres-store.ts   # Vercel Postgres store
    db.ts               # storage selector + seed
    seed.ts             # sample risks
    validate.ts         # form validation
```
