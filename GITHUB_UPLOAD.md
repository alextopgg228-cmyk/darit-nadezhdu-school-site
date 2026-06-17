# Как загрузить на GitHub

Если репозиторий уже создан на GitHub, выполнить:

```powershell
git init
git add .
git commit -m "Create school portal with MSSQL backend"
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

Если GitHub попросит авторизацию, войти через браузер.

Для нового репозитория без `gh` CLI его нужно сначала создать вручную на GitHub, затем вставить его URL в команду `git remote add origin`.
