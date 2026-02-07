@echo off
echo ============================================================
echo WEBHOOK MONITOR - Watching for incoming webhooks
echo ============================================================
echo.
echo Backend output file:
echo C:\Users\shukl\AppData\Local\Temp\claude\C--Data-eth-online-arc-solution-ethglobal-hack-money-backend\tasks\b92279b.output
echo.
echo Watching for webhook events...
echo Press Ctrl+C to stop
echo.
echo ============================================================
echo.

powershell -Command "Get-Content 'C:\Users\shukl\AppData\Local\Temp\claude\C--Data-eth-online-arc-solution-ethglobal-hack-money-backend\tasks\b92279b.output' -Wait -Tail 30"
