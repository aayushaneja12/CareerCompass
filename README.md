# CareerCompass

This project is developed as part of the **Bachelor of Data Science Capstone Project** at **SP Jain School of Global Management**.

The AI agent, named **CareerCompass**, supports the **Professional Readiness Program (PRP)** by providing students and mentors with a single platform for quick, reliable, and personalized assistance.

---

## Overview

Students often ask similar questions about CVs, LinkedIn profiles, cover letters, interviews, immigration and work rights, and skill development. Mentors spend valuable time answering repetitive queries instead of focusing on one-on-one coaching.

**CareerCompass** is a conversational assistant that:
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
git clone https://github.com/drheaa/CareerCompass-prp-ai-agent
cd CareerCompass-prp-ai-agent
```

### 2. Create a virtual environment

macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

Windows (PowerShell):
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Set up the environment file

Create a `.env` file in the project root and add your Supabase and AI credentials. Example:

```env
# -------- SUPABASE CONFIG --------
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_DB_URL=postgresql://postgres:<your-db-password>@<your-project-id>.supabase.co:5432/postgres?sslmode=require

# -------- LLM / AI CONFIG --------
OPENAI_API_KEY=<your-openai-api-key>
LANGCHAIN_API_KEY=<your-langchain-or-langgraph-api-key>
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com

# -------- APP CONFIG --------
ENV=development
PORT=8000
SECRET_KEY=<random-string-for-fastapi>
LOG_LEVEL=info
```

### 5. Run the backend (FastAPI)

```bash
uvicorn backend.main:app --reload
```

### 6. Run the frontend (Streamlit)

```bash
streamlit run frontend/app.py
```

---

## Database Setup (Supabase)

All SQL files are in the `supabase/` folder. Run them in order using the Supabase SQL editor or the CLI.

Example local steps (installing the Postgres client and running a helper script):

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

## How CareerCompass Works

CareerCompass connects three main layers:

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

- Backend: Python, FastAPI, LangChain
- Frontend: Streamlit or React
- Database: Supabase (PostgreSQL)
- AI/NLP: OpenAI API, spaCy, Hugging Face
- Other Tools: Pandas, NumPy, Git, VS Code, Figma

---

## Team

- Trisha Mukherjee
- Devanshi Rhea Aucharaz
- Makhabat Zhyrgalbekova
- Aayush Aneja

