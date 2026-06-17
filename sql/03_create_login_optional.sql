USE master;
GO

-- Необязательный скрипт. Запускайте от администратора SQL Server, если нужен отдельный пользователь для сайта.
IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'school_user')
BEGIN
    CREATE LOGIN school_user WITH PASSWORD = 'StrongPassword123!';
END;
GO

USE DaritNadezhduSchool;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'school_user')
BEGIN
    CREATE USER school_user FOR LOGIN school_user;
END;
GO

ALTER ROLE db_datareader ADD MEMBER school_user;
ALTER ROLE db_datawriter ADD MEMBER school_user;
GO
