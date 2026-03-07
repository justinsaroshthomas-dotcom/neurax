@echo off
color 0A
title Neurax - IBM Team 63

echo ==================================================================
echo   NEURAMED SYSTEM - IBM TEAM 63
echo   Lead: Justin Thomas
echo   Team: Devika NS, Krishnajith Vijay, Sivaranjps
echo ==================================================================
echo.
echo   Initializing Deep Learning Pipeline and Next.js Dashboard...
echo.

:: Kill existing node and python servers to prevent port conflicts
echo [1/5] Cleaning up old processes (Ports 3000, 5000)...
call npx kill-port 3000 5000 2>nul
taskkill /F /IM python.exe /T 2>nul

echo.
echo [2/5] Installing Python Dependencies (scikit-learn, pandas, etc.)...
pip install -r ml/requirements.txt

echo.
echo [3/5] Fetching 41-Disease Kaggle Dataset ^& Training Neural Network...
python ml/train.py

echo.
echo [4/5] Starting Flask ML Prediction Server (background port 5000)...
start /B python ml/server.py

echo.
echo [5/5] Starting Next.js Frontend Development Server (port 3000)...
echo.
echo   The frontend will open at http://localhost:3000
echo ==================================================================

call npm run dev
