# CareerCompass (Mentra)

CareerCompass is an AI-powered career readiness assistant built for the PRP context at SP Jain School of Global Management. It combines a FastAPI backend, a React frontend, and Supabase to support guided career development workflows.

## What It Does

- Authenticated chat assistant for PRP and career guidance.
- Skill gap analysis for a target role.
- Personalized career roadmap generation.
- Resume review and improvement suggestions.
- Portfolio project idea generation.
- Weekly progress tracking.

## Current Architecture

- Frontend: React + Vite + TypeScript (in `frontend/`)
- Backend API: FastAPI + LangGraph/LangChain workflow (in `backend/`)
- Database and Auth: Supabase (PostgreSQL + Supabase Auth)
- LLM provider currently used in backend services: Groq (`GROQ_API_KEY`)

## Repository Structure

```text
CareerCompass/
|- backend/
|  |- app.py                  # FastAPI app entrypoint
|  |- graphstructure.py       # LangGraph workflow and routing
|  |- cli.py                  # Local CLI chat mode
|  |- intent.py               # Rule-based intent classifier
|  |- services/               # Profile/career/resume service layer
|  |- tools/                  # Tool nodes used by graph
|  |- models/                 # Pydantic request/response models
|- frontend/
|  |- src/
|  |  |- pages/               # Auth/chat/feature pages
|  |  |- integrations/        # Supabase + API clients
|  |- package.json
|- supabase/
|  |- schema_enums.sql
|  |- core_tables.sql
|  |- booking_system.sql
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
- A Supabase project (URL + keys)
- A Groq API key

## Setup

### 1. Clone and enter project

```bash
git clone <your-repo-url>
cd CareerCompass
```

### 2. Backend setup

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install Python dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Frontend setup

```bash
cd frontend
npm install
cd ..
```

## Environment Variables

Create these files before running the app.

### Root `.env` (backend)

```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Required by current LLM services
GROQ_API_KEY=<your-groq-api-key>

# Optional: only needed for running supabase/run_all.sh
SUPABASE_DB_URL=postgresql://postgres:<password>@<your-project-id>.supabase.co:5432/postgres?sslmode=require
```

### `frontend/.env.local`

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-or-publishable-key>

# Optional (defaults to http://localhost:8000)
VITE_API_URL=http://localhost:8000
```

## Run The Project

Open two terminals from project root.

### Terminal 1: backend API

```bash
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2: frontend

```bash
cd frontend
npm run dev
```

Frontend will usually run on `http://localhost:5173`.

## API Endpoints (Current)

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

Most endpoints require `Authorization: Bearer <supabase_access_token>`.

## Supabase SQL Setup

Run SQL files in this order (via Supabase SQL editor or `psql`):

1. `schema_enums.sql`
2. `core_tables.sql`
3. `booking_system.sql`
4. `indexes.sql`
5. `rls_policies.sql`
6. `views.sql`
7. `seed_data.sql`

If your environment has `psql` and `SUPABASE_DB_URL`, you can run:

```bash
bash supabase/run_all.sh
```

## Optional Local CLI Mode

You can also run a simple terminal chat loop for backend workflow testing:

```bash
python -m backend.cli
```

## Tech Stack

- Backend: Python, FastAPI, LangGraph, LangChain
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Data/Auth: Supabase (PostgreSQL + Auth)
- AI: Groq (Llama 3.3 70B), plus supporting NLP libraries in `requirements.txt`

## Team

- Trisha Mukherjee
- Devanshi Rhea Aucharaz
- Makhabat Zhyrgalbekova
- Aayush Aneja

