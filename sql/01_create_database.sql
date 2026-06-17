IF DB_ID(N'DaritNadezhduSchool') IS NULL
BEGIN
    CREATE DATABASE DaritNadezhduSchool;
END;
GO

USE DaritNadezhduSchool;
GO

IF OBJECT_ID(N'dbo.ScheduleItems', N'U') IS NOT NULL DROP TABLE dbo.ScheduleItems;
IF OBJECT_ID(N'dbo.ScheduleGroups', N'U') IS NOT NULL DROP TABLE dbo.ScheduleGroups;
IF OBJECT_ID(N'dbo.News', N'U') IS NOT NULL DROP TABLE dbo.News;
IF OBJECT_ID(N'dbo.Hotlines', N'U') IS NOT NULL DROP TABLE dbo.Hotlines;
IF OBJECT_ID(N'dbo.Leaders', N'U') IS NOT NULL DROP TABLE dbo.Leaders;
IF OBJECT_ID(N'dbo.Contacts', N'U') IS NOT NULL DROP TABLE dbo.Contacts;
IF OBJECT_ID(N'dbo.Directions', N'U') IS NOT NULL DROP TABLE dbo.Directions;
IF OBJECT_ID(N'dbo.SiteUsers', N'U') IS NOT NULL DROP TABLE dbo.SiteUsers;
IF OBJECT_ID(N'dbo.Organization', N'U') IS NOT NULL DROP TABLE dbo.Organization;
GO

CREATE TABLE dbo.Organization (
    OrganizationId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(400) NOT NULL,
    ShortName NVARCHAR(300) NOT NULL,
    Tagline NVARCHAR(200) NOT NULL,
    Region NVARCHAR(200) NOT NULL,
    Address NVARCHAR(300) NOT NULL,
    HistoricalDate NVARCHAR(100) NULL,
    RegistrationDate NVARCHAR(100) NULL,
    Inn NVARCHAR(20) NULL,
    Kpp NVARCHAR(20) NULL,
    Ogrn NVARCHAR(30) NULL,
    SourceUrl NVARCHAR(500) NOT NULL
);

CREATE TABLE dbo.Directions (
    DirectionId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(250) NOT NULL,
    Description NVARCHAR(700) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0
);

CREATE TABLE dbo.Contacts (
    ContactId INT IDENTITY(1,1) PRIMARY KEY,
    Label NVARCHAR(100) NOT NULL,
    Value NVARCHAR(300) NOT NULL,
    Description NVARCHAR(500) NULL,
    SortOrder INT NOT NULL DEFAULT 0
);

CREATE TABLE dbo.Leaders (
    LeaderId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(200) NOT NULL,
    Position NVARCHAR(250) NOT NULL,
    Phone NVARCHAR(100) NULL,
    Email NVARCHAR(150) NULL,
    SortOrder INT NOT NULL DEFAULT 0
);

CREATE TABLE dbo.Hotlines (
    HotlineId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(300) NOT NULL,
    Value NVARCHAR(200) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0
);

CREATE TABLE dbo.News (
    NewsId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(250) NOT NULL,
    Body NVARCHAR(1200) NOT NULL,
    PublishedDate DATE NOT NULL,
    IsPinned BIT NOT NULL DEFAULT 0,
    SourceUrl NVARCHAR(500) NULL
);

CREATE TABLE dbo.ScheduleGroups (
    GroupId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    ImagePath NVARCHAR(200) NULL,
    SourceUrl NVARCHAR(500) NULL,
    SortOrder INT NOT NULL DEFAULT 0
);

CREATE TABLE dbo.ScheduleItems (
    ScheduleItemId INT IDENTITY(1,1) PRIMARY KEY,
    GroupId INT NOT NULL,
    WeekDay NVARCHAR(30) NOT NULL,
    LessonTime NVARCHAR(50) NOT NULL,
    ClassName NVARCHAR(20) NOT NULL,
    SubjectName NVARCHAR(150) NOT NULL,
    TeacherName NVARCHAR(200) NULL,
    Room NVARCHAR(50) NULL,
    CONSTRAINT FK_ScheduleItems_Groups FOREIGN KEY (GroupId) REFERENCES dbo.ScheduleGroups(GroupId) ON DELETE CASCADE
);

CREATE TABLE dbo.SiteUsers (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_SiteUsers_Role CHECK (Role IN (N'admin', N'user'))
);
GO

INSERT INTO dbo.Organization
    (FullName, ShortName, Tagline, Region, Address, HistoricalDate, RegistrationDate, Inn, Kpp, Ogrn, SourceUrl)
VALUES
    (N'Областное государственное бюджетное общеобразовательное учреждение «Центр образования для детей с особыми образовательными потребностями г. Смоленска»',
     N'ОГБОУ «Центр образования для детей с особыми образовательными потребностями г. Смоленска»',
     N'Школа, где дарят надежду!',
     N'РФ, Смоленская область, г. Смоленск',
     N'214036, г. Смоленск, ул. Попова, д.56',
     N'15 августа 1990 года',
     N'18.01.1993 г.',
     N'6731032577',
     N'673101001',
     N'1026701439049',
     N'https://shkola-darit-nadezhdu.gosuslugi.ru/');

INSERT INTO dbo.Directions (Title, Description, SortOrder) VALUES
    (N'Дошкольное образование', N'Образовательная работа с обучающимися с нарушением слуха.', 1),
    (N'Начальное, основное и среднее образование', N'Общее образование обучающихся с нарушением слуха с учетом особых образовательных потребностей.', 2),
    (N'АООП и дистанционные технологии', N'Реализация адаптированных основных образовательных программ с применением электронного обучения и дистанционных образовательных технологий.', 3);

INSERT INTO dbo.Contacts (Label, Value, Description, SortOrder) VALUES
    (N'Телефон/факс', N'+7 (4812) 52-87-59', N'Основной контактный телефон центра образования.', 1),
    (N'Электронная почта', N'spezshkola1-2@yandex.ru', N'Официальная электронная почта учреждения.', 2),
    (N'Адрес', N'214036, г. Смоленск, ул. Попова, д.56', N'Юридический и фактический адрес.', 3),
    (N'Режим работы', N'Пн. - пт.: 08:00 - 19:00', N'Режим работы по данным официального сайта.', 4),
    (N'Часы приема граждан', N'Пн. - пт.: 10:00 - 15:00', N'Время приема граждан.', 5),
    (N'Начало занятий', N'09:00', N'Время начала учебных занятий.', 6),
    (N'Учебная неделя', N'5 дней', N'Продолжительность учебной недели.', 7);

INSERT INTO dbo.Leaders (FullName, Position, Phone, Email, SortOrder) VALUES
    (N'Коткина Наталья Александровна', N'Директор', N'8 (4812) 35-85-52', N'spezshkola1-2@yandex.ru', 1),
    (N'Зайцева Наталья Рудольфовна', N'Заместитель директора по УВР', N'8 (4812) 52-87-59 (#109)', N'spezshkola1-2@yandex.ru', 2),
    (N'Панина Марина Валерьевна', N'Советник директора по воспитанию и взаимодействию с детскими общественными объединениями', N'8 (4812) 55-78-95 (#110)', N'panina.mv@dist67.ru', 3),
    (N'Петраченкова Татьяна Михайловна', N'Заместитель директора по УВР', N'8 (4812) 52-89-19 (#107)', N'spezshkola1-2@yandex.ru', 4),
    (N'Потёмкина Надежда Константиновна', N'Заместитель директора по УВР', N'8 (4812) 55-78-95 (#104)', N'spezshkola1-2@yandex.ru', 5),
    (N'Рудинский Виктор Валерьевич', N'Заместитель директора по ИКТ', N'8 (4812) 52-89-29 (#103)', N'spezshkola1-2@yandex.ru', 6);

INSERT INTO dbo.Hotlines (Title, Value, SortOrder) VALUES
    (N'Горячая линия по организации работы детских садов', N'8 (4812) 29-27-24', 1),
    (N'Горячая линия по организации работы общеобразовательных организаций', N'8 (4812) 29-27-55', 2),
    (N'Горячая линия по организации бесплатного питания для учащихся 1-4 классов', N'8 (4812) 29-27-41', 3),
    (N'Горячая линия ЕГЭ', N'8 (4812) 29-27-60', 4),
    (N'Горячая линия ОГЭ', N'8 (4812) 29-27-46', 5),
    (N'Телефон доверия ЕГЭ', N'+7 (495) 104-68-38', 6);

INSERT INTO dbo.News (Title, Body, PublishedDate, IsPinned, SourceUrl) VALUES
    (N'Официальная группа Центра образования', N'На официальном сайте размещены ссылки на группу ВКонтакте и канал учреждения в МАХ.', '2026-06-17', 1, N'https://shkola-darit-nadezhdu.gosuslugi.ru/'),
    (N'Расписание для 1-4 и 5-11 классов', N'На странице расписания представлены отдельные материалы для начальной и основной/средней школы.', '2026-06-17', 1, N'https://shkola-darit-nadezhdu.gosuslugi.ru/roditelyam-i-uchenikam/raspisanie/'),
    (N'Центр образования работает с 1990 года', N'Историческая дата создания учреждения - 15 августа 1990 года.', '2026-06-17', 0, N'https://shkola-darit-nadezhdu.gosuslugi.ru/svedeniya-ob-obrazovatelnoy-organizatsii/osnovnye-svedeniya/');

INSERT INTO dbo.ScheduleGroups (Title, Description, ImagePath, SourceUrl, SortOrder) VALUES
    (N'1-4 классы', N'Официальный раздел расписания для начальной школы.', N'/assets/schedule-1-4.png', N'https://shkola-darit-nadezhdu.gosuslugi.ru/roditelyam-i-uchenikam/raspisanie/', 1),
    (N'5-11 классы', N'Официальный раздел расписания для основной и средней школы.', N'/assets/schedule-5-11.png', N'https://shkola-darit-nadezhdu.gosuslugi.ru/roditelyam-i-uchenikam/raspisanie/', 2);

INSERT INTO dbo.ScheduleItems (GroupId, WeekDay, LessonTime, ClassName, SubjectName, TeacherName, Room) VALUES
    (1, N'Понедельник', N'09:00 - 09:40', N'1-4', N'Русский язык', N'Педагог начальной школы', N'начальный блок'),
    (1, N'Понедельник', N'09:55 - 10:35', N'1-4', N'Математика', N'Педагог начальной школы', N'начальный блок'),
    (2, N'Понедельник', N'09:00 - 09:45', N'5-11', N'Математика', N'Учитель-предметник', N'учебный кабинет'),
    (2, N'Понедельник', N'10:00 - 10:45', N'5-11', N'Русский язык', N'Учитель-предметник', N'учебный кабинет');

INSERT INTO dbo.SiteUsers (FullName, Email, PasswordHash, Role) VALUES
    (N'Технический администратор', N'admin@hope.local', N'$2b$10$Y6P3mioKKwZUgb7qUBbLre.iRML72MLyn0oOtd9KTbdPA5RncIB.2', N'admin'),
    (N'Обычный пользователь', N'user@hope.local', N'$2b$10$.46P5RNcOI/8bM67Ad6Jy.OKxjYEcXIR7RYUVw4CiiLaVul1VnH.i', N'user');
GO
