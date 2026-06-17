import sqlPackage from 'mssql';
import { appConfig, createSqlConfig } from './config.js';
import { demoData } from './demoData.js';

const sql = sqlPackage;
let poolPromise;
let lastConnectionError;
const demoState = JSON.parse(JSON.stringify(demoData));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canUseDemo() {
  return appConfig.demoMode === 'auto' || appConfig.demoMode === 'true';
}

function nextId(rows, field) {
  return rows.reduce((max, row) => Math.max(max, Number(row[field]) || 0), 0) + 1;
}

async function getPool() {
  if (appConfig.demoMode === 'true') {
    return null;
  }

  if (!poolPromise) {
    const pool = new sql.ConnectionPool(createSqlConfig());
    poolPromise = pool.connect().catch((error) => {
      poolPromise = undefined;
      lastConnectionError = error;
      throw error;
    });
  }

  const pool = await poolPromise;
  lastConnectionError = undefined;
  return pool;
}

function mapRecordsets(recordsets) {
  return {
    organization: recordsets[0]?.[0] || null,
    directions: recordsets[1] || [],
    contacts: recordsets[2] || [],
    leaders: recordsets[3] || [],
    hotlines: recordsets[4] || [],
    news: recordsets[5] || [],
    scheduleGroups: recordsets[6] || [],
    scheduleItems: recordsets[7] || []
  };
}

export async function getHealth() {
  if (appConfig.demoMode === 'true') {
    return { mode: 'demo', connected: false, message: 'Демо-режим включен принудительно.' };
  }

  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS ok;');
    return { mode: 'database', connected: true, database: createSqlConfig().database, message: 'Подключено к MS SQL Server.' };
  } catch (error) {
    if (canUseDemo()) {
      return { mode: 'demo', connected: false, database: createSqlConfig().database, message: 'SQL Server недоступен, используется демо-набор данных.', error: error.message };
    }

    return { mode: 'error', connected: false, database: createSqlConfig().database, message: 'Нет подключения к MS SQL Server.', error: error.message };
  }
}

export async function readSiteData() {
  if (appConfig.demoMode === 'true') {
    return { source: 'demo', data: clone(mapRecordsets([
      [demoState.organization],
      demoState.directions,
      demoState.contacts,
      demoState.leaders,
      demoState.hotlines,
      demoState.news,
      demoState.scheduleGroups,
      demoState.scheduleItems
    ])) };
  }

  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT TOP (1) * FROM dbo.Organization ORDER BY OrganizationId;
      SELECT * FROM dbo.Directions ORDER BY SortOrder, DirectionId;
      SELECT * FROM dbo.Contacts ORDER BY SortOrder, ContactId;
      SELECT * FROM dbo.Leaders ORDER BY SortOrder, LeaderId;
      SELECT * FROM dbo.Hotlines ORDER BY SortOrder, HotlineId;
      SELECT NewsId, Title, Body, CONVERT(varchar(10), PublishedDate, 23) AS PublishedDate, IsPinned, SourceUrl FROM dbo.News ORDER BY IsPinned DESC, PublishedDate DESC, NewsId DESC;
      SELECT * FROM dbo.ScheduleGroups ORDER BY SortOrder, GroupId;
      SELECT * FROM dbo.ScheduleItems ORDER BY GroupId, WeekDay, LessonTime, ScheduleItemId;
    `);

    return { source: 'database', data: mapRecordsets(result.recordsets) };
  } catch (error) {
    if (canUseDemo()) {
      return {
        source: 'demo',
        warning: error.message,
        data: clone(mapRecordsets([
          [demoState.organization],
          demoState.directions,
          demoState.contacts,
          demoState.leaders,
          demoState.hotlines,
          demoState.news,
          demoState.scheduleGroups,
          demoState.scheduleItems
        ]))
      };
    }

    throw error;
  }
}

export async function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (appConfig.demoMode === 'true') {
    return demoState.users.find((user) => user.Email.toLowerCase() === normalized) || null;
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Email', sql.NVarChar(200), normalized)
      .query('SELECT TOP (1) * FROM dbo.SiteUsers WHERE Email = @Email;');
    return result.recordset[0] || null;
  } catch (error) {
    if (canUseDemo()) {
      return demoState.users.find((user) => user.Email.toLowerCase() === normalized) || null;
    }
    throw error;
  }
}

export async function createUser({ fullName, email, passwordHash, role }) {
  const normalized = String(email || '').trim().toLowerCase();
  if (appConfig.demoMode === 'true') {
    const user = {
      UserId: nextId(demoState.users, 'UserId'),
      FullName: fullName,
      Email: normalized,
      PasswordHash: passwordHash,
      Role: role,
      CreatedAt: new Date().toISOString()
    };
    demoState.users.push(user);
    return user;
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('FullName', sql.NVarChar(200), fullName)
      .input('Email', sql.NVarChar(200), normalized)
      .input('PasswordHash', sql.NVarChar(255), passwordHash)
      .input('Role', sql.NVarChar(20), role)
      .query(`
        INSERT INTO dbo.SiteUsers (FullName, Email, PasswordHash, Role)
        OUTPUT inserted.UserId, inserted.FullName, inserted.Email, inserted.Role, inserted.CreatedAt
        VALUES (@FullName, @Email, @PasswordHash, @Role);
      `);
    return result.recordset[0];
  } catch (error) {
    if (canUseDemo()) {
      const user = {
        UserId: nextId(demoState.users, 'UserId'),
        FullName: fullName,
        Email: normalized,
        PasswordHash: passwordHash,
        Role: role,
        CreatedAt: new Date().toISOString()
      };
      demoState.users.push(user);
      return user;
    }
    throw error;
  }
}

export async function addScheduleItem(item) {
  if (appConfig.demoMode === 'true') {
    const row = { ScheduleItemId: nextId(demoState.scheduleItems, 'ScheduleItemId'), ...item };
    demoState.scheduleItems.push(row);
    return row;
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('GroupId', sql.Int, item.GroupId)
      .input('WeekDay', sql.NVarChar(30), item.WeekDay)
      .input('LessonTime', sql.NVarChar(50), item.LessonTime)
      .input('ClassName', sql.NVarChar(20), item.ClassName)
      .input('SubjectName', sql.NVarChar(150), item.SubjectName)
      .input('TeacherName', sql.NVarChar(200), item.TeacherName || null)
      .input('Room', sql.NVarChar(50), item.Room || null)
      .query(`
        INSERT INTO dbo.ScheduleItems (GroupId, WeekDay, LessonTime, ClassName, SubjectName, TeacherName, Room)
        OUTPUT inserted.*
        VALUES (@GroupId, @WeekDay, @LessonTime, @ClassName, @SubjectName, @TeacherName, @Room);
      `);
    return result.recordset[0];
  } catch (error) {
    if (canUseDemo()) {
      const row = { ScheduleItemId: nextId(demoState.scheduleItems, 'ScheduleItemId'), ...item };
      demoState.scheduleItems.push(row);
      return row;
    }
    throw error;
  }
}

export async function deleteScheduleItem(id) {
  if (appConfig.demoMode === 'true') {
    const before = demoState.scheduleItems.length;
    demoState.scheduleItems = demoState.scheduleItems.filter((item) => Number(item.ScheduleItemId) !== Number(id));
    return before !== demoState.scheduleItems.length;
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('ScheduleItemId', sql.Int, Number(id))
      .query('DELETE FROM dbo.ScheduleItems WHERE ScheduleItemId = @ScheduleItemId; SELECT @@ROWCOUNT AS deleted;');
    return Number(result.recordset[0]?.deleted || 0) > 0;
  } catch (error) {
    if (canUseDemo()) {
      const before = demoState.scheduleItems.length;
      demoState.scheduleItems = demoState.scheduleItems.filter((item) => Number(item.ScheduleItemId) !== Number(id));
      return before !== demoState.scheduleItems.length;
    }
    throw error;
  }
}

export async function addNews(item) {
  if (appConfig.demoMode === 'true') {
    const row = {
      NewsId: nextId(demoState.news, 'NewsId'),
      Title: item.Title,
      Body: item.Body,
      PublishedDate: item.PublishedDate,
      IsPinned: Boolean(item.IsPinned),
      SourceUrl: item.SourceUrl || null
    };
    demoState.news.unshift(row);
    return row;
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('Title', sql.NVarChar(250), item.Title)
      .input('Body', sql.NVarChar(1200), item.Body)
      .input('PublishedDate', sql.Date, item.PublishedDate)
      .input('IsPinned', sql.Bit, Boolean(item.IsPinned))
      .input('SourceUrl', sql.NVarChar(500), item.SourceUrl || null)
      .query(`
        INSERT INTO dbo.News (Title, Body, PublishedDate, IsPinned, SourceUrl)
        OUTPUT inserted.NewsId, inserted.Title, inserted.Body, CONVERT(varchar(10), inserted.PublishedDate, 23) AS PublishedDate, inserted.IsPinned, inserted.SourceUrl
        VALUES (@Title, @Body, @PublishedDate, @IsPinned, @SourceUrl);
      `);
    return result.recordset[0];
  } catch (error) {
    if (canUseDemo()) {
      const row = {
        NewsId: nextId(demoState.news, 'NewsId'),
        Title: item.Title,
        Body: item.Body,
        PublishedDate: item.PublishedDate,
        IsPinned: Boolean(item.IsPinned),
        SourceUrl: item.SourceUrl || null
      };
      demoState.news.unshift(row);
      return row;
    }
    throw error;
  }
}
