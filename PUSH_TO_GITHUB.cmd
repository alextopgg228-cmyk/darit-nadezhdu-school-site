@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo This script uploads the project to an existing GitHub repository.
echo Create an empty GitHub repo first, then paste its HTTPS URL.
echo Example: https://github.com/USER/darit-nadezhdu-school-site.git
echo.

set /p REPO_URL=GitHub repository URL: 
if "%REPO_URL%"=="" (
  echo Repository URL is empty.
  pause
  exit /b 1
)

git init
git config user.name "Codex"
git config user.email "codex@example.local"
git branch -M main
git add .
git commit -m "Initial school portal project"
git remote remove origin 2>nul
git remote add origin "%REPO_URL%"
git push -u origin main

echo.
echo If push worked, open the repository URL above.
pause
