@echo off
REM Quick run script for development (Windows)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run the server
echo ================================
echo Starting StarCPay Backend...
echo API Documentation: http://localhost:8000/docs
echo ================================
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
