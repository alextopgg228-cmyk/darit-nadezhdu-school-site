USE DaritNadezhduSchool;
GO

-- Основные сведения об организации
SELECT FullName, ShortName, Tagline, Address, HistoricalDate, RegistrationDate
FROM dbo.Organization;

-- Контакты и режим работы
SELECT Label, Value, Description
FROM dbo.Contacts
ORDER BY SortOrder;

-- Администрация центра образования
SELECT FullName, Position, Phone, Email
FROM dbo.Leaders
ORDER BY SortOrder;

-- Расписание с группой классов
SELECT
    g.Title AS ScheduleGroup,
    i.WeekDay,
    i.LessonTime,
    i.ClassName,
    i.SubjectName,
    i.TeacherName,
    i.Room
FROM dbo.ScheduleItems i
INNER JOIN dbo.ScheduleGroups g ON i.GroupId = g.GroupId
ORDER BY g.SortOrder, i.WeekDay, i.LessonTime;

-- Пользователи сайта по ролям
SELECT UserId, FullName, Email, Role, CreatedAt
FROM dbo.SiteUsers
ORDER BY CreatedAt;
