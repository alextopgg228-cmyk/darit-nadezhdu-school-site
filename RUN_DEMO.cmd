@echo off
cd /d "%~dp0"
set DEMO_MODE=true
set PORT=3010
start http://127.0.0.1:3010
npm start
