@echo off
cd /d "%~dp0"
set DEMO_MODE=false
set PORT=3010
set DB_SERVER=localhost
set DB_INSTANCE=SQLEXPRESS
set DB_PORT=
set DB_DATABASE=DaritNadezhduSchool
set DB_USER=school_user
set DB_PASSWORD=StrongPassword123!
start http://127.0.0.1:3010
npm start
