#!/bin/bash

# ─────────────────────────────────────────────────────────────────────────────
#  Contract Vault — Unified Launcher Script
#  Starts Backend & Frontend together and cleans up all processes on Ctrl+C.
# ─────────────────────────────────────────────────────────────────────────────

# Kill existing processes on ports 4000 & 5173 first if any exist
lsof -ti :4000,5173 | xargs kill -9 2>/dev/null

cleanup() {
  echo ""
  echo "🛑 Stopping Contract Vault..."
  if [ -n "$BACKEND_PID" ]; then kill -9 $BACKEND_PID 2>/dev/null; fi
  if [ -n "$FRONTEND_PID" ]; then kill -9 $FRONTEND_PID 2>/dev/null; fi
  lsof -ti :4000,5173 | xargs kill -9 2>/dev/null
  echo "✅ Backend and Frontend servers stopped cleanly."
  exit 0
}

# Trap Ctrl+C (SIGINT) and termination signals
trap cleanup SIGINT SIGTERM EXIT

echo "🏛  Starting Contract Vault Applications..."

# 1. Start Backend Server
echo "⚡ Starting Backend API on http://localhost:4000..."
(cd backend && node server.js) &
BACKEND_PID=$!

# Wait briefly for backend to spin up
sleep 1.5

# 2. Start Frontend Dev Server
echo "🌐 Starting React Frontend on http://localhost:5173..."
(cd web2 && npm run dev) &
FRONTEND_PID=$!

sleep 1.5

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  ✅  CONTRACT VAULT IS LIVE!"
echo "  🌐  Frontend UI:  http://localhost:5173"
echo "  ⚡  Backend API:   http://localhost:4000"
echo "════════════════════════════════════════════════════════════"
echo "  💡  Press [Ctrl + C] in this window to stop everything."
echo "════════════════════════════════════════════════════════════"
echo ""

# Keep script alive and waiting for signals
wait
