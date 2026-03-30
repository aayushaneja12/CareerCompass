# PRP AI Agent 

This project is developed as part of the **Bachelor of Data Science Capstone Project I** at **SP Jain School of Global Management**.

The AI agent, named **Mentra**, supports the **Professional Readiness Program (PRP)** by providing students and mentors with a single platform for quick, reliable, and personalized assistance.

---

## Overview

Students often ask similar questions about CVs, LinkedIn profiles, cover letters, interviews, immigration and work rights, and skill development. Mentors spend valuable time answering repetitive queries instead of focusing on one-on-one coaching.

**Mentra** is a conversational assistant that:
- Answers questions about professional readiness, PRP events, and mentoring.
- Helps with career preparation topics such as CVs, LinkedIn, and interviews.
- Redirects students to schedule one-on-one sessions with mentors when needed.
- Automates routine administrative tasks like attendance tracking and progress summaries.
- Connects to anonymized PRP data through a secure Supabase database.

---

## Folder Structure

- prp-ai-agent/
    - backend/             # FastAPI backend and business logic
        - main.py
        - routes/
        - services/
    - frontend/            # Streamlit or React interface
        - app.py
        - components/
    - supabase/            # SQL setup and database schema
        - schema_enums.sql
        - core_tables.sql
        - booking_system.sql
        - indexes.sql
        - rls_policies.sql
        - views.sql
        - seed_data.sql
    - data/                # Sample or anonymized PRP data
        - sample_prp.csv
    - venv/                # Python virtual environment (not committed)
    - .env                 # Environment variables (Supabase URL, keys)
    - requirements.txt     # Python dependencies
    - README.md            # Project documentation
    - .gitignore

---

## Setting Up the Project

### 1. Clone the repository

```bash
git clone https://github.com/drheaa/mentra-prp-ai-agent
cd mentra-prp-ai-agent
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
cd supabase
sudo apt install postgresql-client    # or use your platform's package manager
chmod +x run_all.sh                   # make the script executable
bash run_all.sh                       # run the database setup
```

This creates PRP tables, views, and policies used by the AI agent.

---

## Features

- Conversational query handling for PRP students and mentors.
- Integration with anonymized PRP and JPT data.
- Mentor session scheduling with Zoom link placeholders.
- Role-based access via Supabase Row-Level Security (RLS).
- Lightweight design using open-source tools.

---

## How Mentra Works

Mentra connects three main layers:

1. User Interaction Layer (Frontend)
     - Students and mentors interact via a Streamlit or React chat UI.

2. AI Processing Layer (Backend)
     - FastAPI backend uses LangChain and OpenAI APIs to interpret intent (CV advice, event info, booking requests) and interact with the database.

3. Data Layer (Supabase)
     - PRP data (events, attendance, mentoring sessions, skills, bookings) stored in a Supabase Postgres DB with RLS to ensure proper access control.

Simple flow:
- Student/Mentor → Frontend (Chat UI)
-         ↓
-      FastAPI Backend → LangChain → OpenAI API
-         ↓
-      Supabase Database (PRP Data + Bookings)
-         ↓
-   Response / Action (Answer or Schedule Session)

---

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

