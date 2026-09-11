#!/bin/bash

# ─────────────────────────────────────────────────────────────────────────────
#  Contract Vault — Stop Script
#  Kills any active backend and frontend instances running on ports 4000 & 5173.
# ─────────────────────────────────────────────────────────────────────────────

echo "🛑 Stopping Contract Vault servers..."
lsof -ti :4000,5173 | xargs kill -9 2>/dev/null
echo "✅ All servers on ports 4000 (Backend) and 5173 (Frontend) have been stopped."
