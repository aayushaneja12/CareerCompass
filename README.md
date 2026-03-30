# CareerCompass

CareerCompass is an AI-powered career readiness platform built for the Professional Readiness Program (PRP) at SP Jain School of Global Management.

It combines:
- a FastAPI backend with LangGraph workflow routing
- a React + Vite frontend with Supabase authentication
- a Supabase PostgreSQL database for conversations and career analytics data

## Overview

CareerCompass helps students with:
- guided career chat support
- profile management
- skill gap analysis for target roles
- personalized career roadmap generation
- resume review and ATS-focused feedback
- project idea generation for portfolio building
- weekly progress tracking

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query
- Backend: Python, FastAPI, LangGraph, LangChain
- Database/Auth: Supabase (PostgreSQL + Auth)
- LLM integration in services: Groq (`llama-3.3-70b-versatile`)

## Repository Structure

```text
CareerCompass/
|- backend/
|  |- app.py                    # FastAPI API entrypoint
|  |- cli.py                    # Local terminal chat runner
|  |- graphstructure.py         # LangGraph workflow wiring
|  |- intent.py                 # Rule-based intent classifier
|  |- models/                   # Pydantic models
|  |- services/                 # Profile/career/resume services
|  |- tools/                    # Graph tool nodes
|- frontend/
|  |- src/
|  |  |- pages/                 # Auth, chat, profile, skill gap, roadmap, resume, projects, progress
|  |  |- hooks/                 # State + API hooks
|  |  |- integrations/supabase/ # Supabase client + API wrappers
|  |- package.json
|- supabase/
|  |- schema_enums.sql
|  |- core_tables.sql
|  |- booking_system.sql
|  |- career_copilot_schema.sql
|  |- indexes.sql
|  |- rls_policies.sql
|  |- views.sql
|  |- seed_data.sql
|  |- run_all.sh
|- requirements.txt
|- README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Supabase project (URL + keys)
- Groq API key

## Environment Variables

Create a root `.env` file:

```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GROQ_API_KEY=<your-groq-api-key>

# Needed only if using psql script in supabase/run_all.sh
SUPABASE_DB_URL=postgresql://postgres:<password>@<your-project-id>.supabase.co:5432/postgres?sslmode=require
```

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-or-publishable-key>

# Optional (defaults to http://localhost:8000)
VITE_API_URL=http://localhost:8000
```

## Installation

### 1. Clone repository

```bash
git clone <your-repo-url>
cd CareerCompass
```

### 2. Backend setup

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Frontend setup

```bash
cd frontend
npm install
cd ..
```

## Running the Application

Open two terminals from project root.

Terminal 1 (backend):

```bash
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

Default URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Backend API Endpoints

- `GET /health`
- `POST /chat`
- `GET /profile`
- `PUT /profile`
- `POST /skill-gap`
- `POST /roadmap`
- `GET /roadmap/{roadmap_id}`
- `POST /resume-review`
- `POST /projects`
- `GET /progress`
- `PUT /progress`

Notes:
- Most endpoints require `Authorization: Bearer <supabase_access_token>`.
- The frontend obtains and forwards this token from Supabase session state.

## Frontend Routes

- `/auth` (public)
- `/` chat dashboard (protected)
- `/profile` (protected)
- `/skill-gap` (protected)
- `/roadmap` (protected)
- `/resume` (protected)
- `/projects` (protected)
- `/progress` (protected)
- `/about` (protected)
- `/service/:serviceId` (protected)

## Database Setup (Supabase)

Run SQL in this order from the Supabase SQL editor or `psql`:

1. `schema_enums.sql`
2. `core_tables.sql`
3. `booking_system.sql`
4. `career_copilot_schema.sql`
5. `indexes.sql`
6. `rls_policies.sql`
7. `views.sql`
8. `seed_data.sql`

Important:
- `career_copilot_schema.sql` creates tables used by current APIs (`user_profiles`, `roadmaps`, `roadmap_items`, `skill_gap_reports`, `resume_reviews`, `saved_projects`, `progress_metrics`).
- `supabase/run_all.sh` includes `career_copilot_schema.sql` and applies the full schema sequence.

## Optional: CLI Chat Mode

For quick backend graph testing in terminal:

```bash
python -m backend.cli
```

## Available Frontend Scripts

Run from `frontend/`:

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run build:dev` - development mode build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint

## Notes and Troubleshooting

- If backend fails with missing Supabase credentials, check root `.env` values.
- If frontend gets unauthorized API errors, sign out/in to refresh session token.
- If `VITE_API_URL` is omitted, frontend defaults to `http://localhost:8000`.
- If you see missing package errors for Groq integration, install dependencies from `requirements.txt` and ensure your environment is activated.

## Team

- Trisha Mukherjee
- Devanshi Rhea Aucharaz
- Makhabat Zhyrgalbekova
- Aayush Aneja