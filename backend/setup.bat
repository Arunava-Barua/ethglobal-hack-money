@echo off
REM StarCPay Backend Setup Script for Windows

echo ================================
echo StarCPay Backend Setup
echo ================================
echo.

REM Check Python version
echo Checking Python version...
python --version
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo.

REM Check for .env file
if not exist .env (
    echo .env file not found!
    echo Creating .env from template...
    copy .env.example .env
    echo .env file created. Please edit it with your actual values.
) else (
    echo .env file already exists.
)
echo.

REM Check for private key
if not exist starcpay.2026-02-06.private-key.pem (
    echo GitHub App private key not found!
    echo Please add starcpay.2026-02-06.private-key.pem to this directory.
) else (
    echo Private key file found.
)
echo.

echo ================================
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file with your actual values
echo 2. Add your GitHub App private key file
echo 3. Run: uvicorn app.main:app --reload
echo.
echo Documentation: http://localhost:8000/docs
echo ================================
pause
