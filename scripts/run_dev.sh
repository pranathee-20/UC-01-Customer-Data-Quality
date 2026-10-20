#!/usr/bin/env bash
# Development startup helper script for UC-01 Customer Data Quality SaaS (Module 1)

echo "=== Starting UC-01 Customer Data Quality SaaS Development Environment ==="

# 1. Start Backend in background
echo "Starting FastAPI backend on port 8000..."
cd backend
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3.12 -m venv .venv || python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt > /dev/null 2>&1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# 2. Start Frontend
echo "Starting React frontend on port 3001..."
npm install
npm run dev -- --port 3001 --host 0.0.0.0 &
FRONTEND_PID=$!

echo "=== UC-01 Services Started Successfully ==="
echo "Backend PID: $BACKEND_PID (http://localhost:8000)"
echo "Frontend PID: $FRONTEND_PID (http://localhost:3001)"
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
