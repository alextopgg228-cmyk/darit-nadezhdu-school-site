# Школа, где дарят надежду

Простой школьный портал по мотивам официального сайта:
https://shkola-darit-nadezhdu.gosuslugi.ru/

Проект содержит:

- сайт на HTML, CSS, JavaScript;
- сервер Node.js + Express;
- подключение к MS SQL Server через пакет `mssql`;
- регистрацию обычного пользователя и администратора;
- вход по ролям;
- админ-панель для добавления новостей и уроков;
- SQL-скрипты для создания базы данных.

## Быстрый запуск

```powershell
npm install
npm start
```

Открыть сайт:

```text
http://127.0.0.1:3010
```

Если MS SQL Server не подключен, сайт сам откроется в демо-режиме.

## Демо-аккаунты

Администратор:

```text
admin@hope.local
admin2026
```

Обычный пользователь:

```text
user@hope.local
user2026
```

Код регистрации администратора:

```text
hope-admin-2026
```

## MS SQL Server

1. Открыть SQL Server Management Studio.
2. Выполнить файл `sql/01_create_database.sql`.
3. При необходимости выполнить `sql/03_create_login_optional.sql`.
4. Скопировать `.env.example` в `.env`.
5. Проверить параметры подключения в `.env`.
6. Запустить сайт командой `npm start`.

Примеры SQL-запросов находятся в `sql/02_sample_queries.sql`.

## Важно про GitHub

GitHub Pages не умеет подключаться к MS SQL Server напрямую. Поэтому на GitHub загружается исходный код проекта и SQL-файлы. Для работы с базой сайт нужно запускать как Node.js приложение локально или на сервере.
