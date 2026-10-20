# UC-01 — Customer Data Quality SaaS (Module 1 Foundation)

## Architecture & Mandatory Stack
- **Frontend**: React + TypeScript + Vite (`/frontend` and root SPA).
- **Backend**: Python 3.12 + FastAPI + Uvicorn (`/backend`).
- **Database**: Microsoft Azure SQL Database accessed exclusively via SQLAlchemy 2.0 Core and Microsoft ODBC Driver 18 + pyodbc. No ORM models or declarative Base.
- **Migrations**: Alembic with explicit SQL statements executed via `op.execute`.
- **Authentication**: JWT with tenant and role claims.
- **Testing**: pytest (HTTP & concurrency tests).
- **Hosting & Storage**: Azure Container Apps + Private Azure Blob Storage.
- **Infrastructure**: Terraform (`/infra`).

---

## Directory Structure
```
frontend/
  src/
  package.json
  vite.config.ts
  tsconfig.json
backend/
  app/
    __init__.py
    main.py
    config.py
    database.py
  migrations/
  tests/
  requirements.txt
infra/
scripts/
skills/customer-quality/SKILL.md
evidence/
.env.example
.gitignore
Dockerfile
README.md
```

---

## Instructions: Running Frontend and Backend Separately

### 1. Backend Setup & Run (FastAPI)
Open a terminal in the project root:
```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Health Check: `http://localhost:8000/health`
- Tools API: `http://localhost:8000/tools`
- Subscription API: `http://localhost:8000/subscription`
- Interactive API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup & Run (React + Vite)
Open a second terminal in the project root:
```bash
# Using root frontend or frontend/ directory
npm install
npm run dev
# Or for frontend/ specifically:
cd frontend
npm install
npm run dev -- --port 3001 --host 0.0.0.0
```
- Access Frontend Dashboard: `http://localhost:3000` (or `http://localhost:3001`)

### 3. Running Tests
```bash
cd backend
source .venv/bin/activate
pytest -v
```

---

## Files That Module 2 Should Extend
Module 2 (Batch Ingestion & Validation Pipeline) will extend:
1. `backend/app/main.py`: Add batch file upload routes supporting private Azure Blob Storage.
2. `backend/migrations/versions/`: Add migration scripts for batch tracking and validation error logs.
3. `backend/app/database.py`: Add connection pooling helpers for batch processing.
4. `frontend/src/App.tsx`: Add batch upload and file processing progress dashboard components.
5. `backend/tests/`: Add tests for CSV/JSON batch parsing and blob upload security.
