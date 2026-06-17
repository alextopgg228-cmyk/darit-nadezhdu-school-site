import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { appConfig } from './config.js';
import { addNews, addScheduleItem, createUser, deleteScheduleItem, findUserByEmail, getHealth, readSiteData } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

class HttpError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function readText(value, name, maxLength = 300) {
  const text = String(value || '').trim();
  if (!text) {
    throw new HttpError(`Поле "${name}" обязательно.`);
  }
  if (text.length > maxLength) {
    throw new HttpError(`Поле "${name}" слишком длинное.`);
  }
  return text;
}

function publicUser(user) {
  return {
    id: user.UserId,
    fullName: user.FullName,
    email: user.Email,
    role: user.Role
  };
}

function signUser(user) {
  return jwt.sign(publicUser(user), appConfig.jwtSecret, { expiresIn: '7d' });
}

function requireAuth(request, _response, next) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    next(new HttpError('Нужен вход в аккаунт.', 401));
    return;
  }

  try {
    request.user = jwt.verify(token, appConfig.jwtSecret);
    next();
  } catch {
    next(new HttpError('Сессия устарела, войдите снова.', 401));
  }
}

function requireAdmin(request, response, next) {
  requireAuth(request, response, (error) => {
    if (error) {
      next(error);
      return;
    }

    if (request.user.role !== 'admin') {
      next(new HttpError('Это действие доступно только администратору.', 403));
      return;
    }

    next();
  });
}

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

app.get('/api/health', asyncRoute(async (_request, response) => {
  response.json(await getHealth());
}));

app.get('/api/site', asyncRoute(async (_request, response) => {
  response.json(await readSiteData());
}));

app.post('/api/register', asyncRoute(async (request, response) => {
  const fullName = readText(request.body.fullName, 'ФИО', 200);
  const email = readText(request.body.email, 'email', 200).toLowerCase();
  const password = readText(request.body.password, 'пароль', 100);
  const role = request.body.role === 'admin' ? 'admin' : 'user';

  if (password.length < 6) {
    throw new HttpError('Пароль должен быть не короче 6 символов.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError('Введите корректный email.');
  }

  if (role === 'admin' && String(request.body.adminCode || '') !== appConfig.adminRegistrationCode) {
    throw new HttpError('Неверный код регистрации администратора.', 403);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new HttpError('Пользователь с таким email уже существует.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ fullName, email, passwordHash, role });
  response.status(201).json({ user: publicUser(user), token: signUser(user) });
}));

app.post('/api/login', asyncRoute(async (request, response) => {
  const email = readText(request.body.email, 'email', 200).toLowerCase();
  const password = readText(request.body.password, 'пароль', 100);
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.PasswordHash))) {
    throw new HttpError('Неверный email или пароль.', 401);
  }

  response.json({ user: publicUser(user), token: signUser(user) });
}));

app.get('/api/me', requireAuth, (request, response) => {
  response.json({ user: request.user });
});

app.post('/api/schedule', requireAdmin, asyncRoute(async (request, response) => {
  const item = {
    GroupId: Number(request.body.groupId),
    WeekDay: readText(request.body.weekDay, 'день недели', 30),
    LessonTime: readText(request.body.lessonTime, 'время', 50),
    ClassName: readText(request.body.className, 'класс', 20),
    SubjectName: readText(request.body.subjectName, 'предмет', 150),
    TeacherName: String(request.body.teacherName || '').trim() || null,
    Room: String(request.body.room || '').trim() || null
  };

  if (!Number.isInteger(item.GroupId) || item.GroupId <= 0) {
    throw new HttpError('Выберите группу расписания.');
  }

  response.status(201).json({ row: await addScheduleItem(item) });
}));

app.delete('/api/schedule/:id', requireAdmin, asyncRoute(async (request, response) => {
  const deleted = await deleteScheduleItem(request.params.id);
  response.json({ deleted });
}));

app.post('/api/news', requireAdmin, asyncRoute(async (request, response) => {
  const item = {
    Title: readText(request.body.title, 'заголовок', 250),
    Body: readText(request.body.body, 'текст новости', 1200),
    PublishedDate: request.body.publishedDate || new Date().toISOString().slice(0, 10),
    IsPinned: Boolean(request.body.isPinned),
    SourceUrl: String(request.body.sourceUrl || '').trim() || null
  };
  response.status(201).json({ row: await addNews(item) });
}));

app.get('*', (_request, response) => {
  response.sendFile(path.join(publicDir, 'index.html'));
});

app.use((error, _request, response, _next) => {
  const statusCode = error.statusCode || 500;
  response.status(statusCode).json({ error: error.message || 'Ошибка сервера' });
});

app.listen(appConfig.port, appConfig.host, () => {
  console.log(`School portal: http://${appConfig.host}:${appConfig.port}`);
});
