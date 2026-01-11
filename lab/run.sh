#!/bin/bash

# Start the FastAPI Backend
echo "🚀 Starting Backend (FastAPI)..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 &
BACKEND_PID=$!

# Start the Next.js Frontend
echo "✨ Starting Frontend (Next.js)..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "✅ Application is starting!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"

# Stop both when script exits
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
