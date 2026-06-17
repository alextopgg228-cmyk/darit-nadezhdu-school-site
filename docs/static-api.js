(function () {
  const nativeFetch = window.fetch.bind(window);
  const siteKey = 'hopeStaticSiteDataV1';
  const usersKey = 'hopeStaticUsersV1';
  const adminCode = 'hope-admin-2026';

  const defaultData = {
    organization: {
      OrganizationId: 1,
      ShortName: 'ОГБОУ «Центр образования для детей с особыми образовательными потребностями г. Смоленска»',
      FullName: 'Областное государственное бюджетное общеобразовательное учреждение «Центр образования для детей с особыми образовательными потребностями г. Смоленска»',
      Tagline: 'Школа, где дарят надежду!',
      Region: 'РФ, Смоленская область, г. Смоленск',
      Address: '214036, г. Смоленск, ул. Попова, д.56',
      Phone: '+7 (4812) 52-87-59',
      Email: 'spezshkola1-2@yandex.ru',
      WorkMode: 'Пн. - пт.: 08:00 - 19:00',
      StudyStartTime: '09:00',
      StudyWeek: '5 дней',
      HistoricalDate: '15 августа 1990 года',
      RegistrationDate: '18.01.1993 г.',
      Inn: '6731032577',
      Kpp: '673101001',
      Ogrn: '1026701439049'
    },
    directions: [
      { DirectionId: 1, Title: 'Дошкольное образование', Description: 'Образовательная работа с обучающимися с нарушением слуха.', SortOrder: 1 },
      { DirectionId: 2, Title: 'Начальное, основное и среднее образование', Description: 'Общее образование обучающихся с нарушением слуха с учетом особых образовательных потребностей.', SortOrder: 2 },
      { DirectionId: 3, Title: 'АООП и дистанционные технологии', Description: 'Реализация адаптированных основных образовательных программ с применением электронного обучения и дистанционных образовательных технологий.', SortOrder: 3 }
    ],
    contacts: [
      { ContactId: 1, Label: 'Адрес', Value: '214036, г. Смоленск, ул. Попова, д.56', SortOrder: 1 },
      { ContactId: 2, Label: 'Телефон/факс', Value: '+7 (4812) 52-87-59', SortOrder: 2 },
      { ContactId: 3, Label: 'E-mail', Value: 'spezshkola1-2@yandex.ru', SortOrder: 3 },
      { ContactId: 4, Label: 'Режим работы', Value: 'Пн. - пт.: 08:00 - 19:00', SortOrder: 4 },
      { ContactId: 5, Label: 'Часы приема', Value: 'Пн. - пт.: 10:00 - 15:00', SortOrder: 5 }
    ],
    leaders: [
      { LeaderId: 1, FullName: 'Коткина Наталья Александровна', Position: 'Директор', Phone: '8 (4812) 35-85-52', Email: 'spezshkola1-2@yandex.ru', SortOrder: 1 },
      { LeaderId: 2, FullName: 'Зайцева Наталья Рудольфовна', Position: 'Заместитель директора по УВР', Phone: '8 (4812) 52-87-59 (#109)', Email: 'spezshkola1-2@yandex.ru', SortOrder: 2 },
      { LeaderId: 3, FullName: 'Панина Марина Валерьевна', Position: 'Советник директора по воспитанию', Phone: '8 (4812) 55-78-95 (#110)', Email: 'panina.mv@dist67.ru', SortOrder: 3 },
      { LeaderId: 4, FullName: 'Петраченкова Татьяна Михайловна', Position: 'Заместитель директора по УВР', Phone: '8 (4812) 52-89-19 (#107)', Email: 'spezshkola1-2@yandex.ru', SortOrder: 4 },
      { LeaderId: 5, FullName: 'Потёмкина Надежда Константиновна', Position: 'Заместитель директора по УВР', Phone: '8 (4812) 55-78-95 (#104)', Email: 'spezshkola1-2@yandex.ru', SortOrder: 5 },
      { LeaderId: 6, FullName: 'Рудинский Виктор Валерьевич', Position: 'Заместитель директора по ИКТ', Phone: '8 (4812) 52-89-29 (#103)', Email: 'spezshkola1-2@yandex.ru', SortOrder: 6 }
    ],
    hotlines: [
      { HotlineId: 1, Title: 'Горячая линия', Phone: '+7 (4812) 52-87-59', Description: 'Контактный телефон образовательной организации.', SortOrder: 1 }
    ],
    news: [
      { NewsId: 1, Title: 'Официальная группа Центра образования', Body: 'На официальном сайте размещены ссылки на группу ВКонтакте и канал учреждения в МАХ.', PublishedDate: '2026-06-17', IsPinned: true, SourceUrl: 'https://shkola-darit-nadezhdu.gosuslugi.ru/' },
      { NewsId: 2, Title: 'Расписание для 1-4 и 5-11 классов', Body: 'На странице расписания представлены отдельные материалы для начальной и основной/средней школы.', PublishedDate: '2026-06-17', IsPinned: false, SourceUrl: 'https://shkola-darit-nadezhdu.gosuslugi.ru/roditelyam-i-uchenikam/raspisanie/' },
      { NewsId: 3, Title: 'Центр образования работает с 1990 года', Body: 'Историческая дата создания учреждения - 15 августа 1990 года.', PublishedDate: '2026-06-17', IsPinned: false, SourceUrl: 'https://shkola-darit-nadezhdu.gosuslugi.ru/svedeniya-ob-obrazovatelnoy-organizatsii/osnovnye-svedeniya/' }
    ],
    scheduleGroups: [
      { GroupId: 1, Title: '1-4 классы', Description: 'Официальный раздел расписания для начальной школы.', ImagePath: '/assets/schedule-1-4.png', SortOrder: 1 },
      { GroupId: 2, Title: '5-11 классы', Description: 'Официальный раздел расписания для основной и средней школы.', ImagePath: '/assets/schedule-5-11.png', SortOrder: 2 }
    ],
    scheduleItems: [
      { ScheduleItemId: 1, GroupId: 1, WeekDay: 'Понедельник', LessonTime: '09:00 - 09:40', ClassName: '1А', SubjectName: 'Русский язык', TeacherName: 'Учитель начальных классов', Room: '101' },
      { ScheduleItemId: 2, GroupId: 1, WeekDay: 'Понедельник', LessonTime: '09:50 - 10:30', ClassName: '2А', SubjectName: 'Математика', TeacherName: 'Учитель начальных классов', Room: '102' },
      { ScheduleItemId: 3, GroupId: 2, WeekDay: 'Вторник', LessonTime: '09:00 - 09:45', ClassName: '5А', SubjectName: 'Литература', TeacherName: 'Учитель русского языка', Room: '204' },
      { ScheduleItemId: 4, GroupId: 2, WeekDay: 'Вторник', LessonTime: '10:00 - 10:45', ClassName: '7Б', SubjectName: 'Физика', TeacherName: 'Учитель физики', Room: '305' }
    ]
  };

  const defaultUsers = [
    { id: 1, fullName: 'Администратор сайта', email: 'admin@hope.local', password: 'admin2026', role: 'admin' },
    { id: 2, fullName: 'Обычный пользователь', email: 'user@hope.local', password: 'user2026', role: 'user' }
  ];

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || structuredClone(fallback);
    } catch {
      return structuredClone(fallback);
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function json(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  function error(message, status = 400) {
    return json({ error: message }, status);
  }

  async function readBody(init) {
    if (!init || !init.body) {
      return {};
    }

    if (typeof init.body === 'string') {
      return JSON.parse(init.body || '{}');
    }

    return {};
  }

  function publicUser(user) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };
  }

  function makeToken(user) {
    return `static.${btoa(unescape(encodeURIComponent(JSON.stringify(publicUser(user)))))}`;
  }

  function userFromToken(token) {
    try {
      if (!token || !token.startsWith('static.')) {
        return null;
      }

      return JSON.parse(decodeURIComponent(escape(atob(token.slice(7)))));
    } catch {
      return null;
    }
  }

  function requireAdmin(init) {
    const header = init?.headers?.Authorization || init?.headers?.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const user = userFromToken(token);
    return user?.role === 'admin';
  }

  function nextId(rows, field) {
    return rows.reduce((max, row) => Math.max(max, Number(row[field]) || 0), 0) + 1;
  }

  function normalizePath(input) {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const projectPath = '/darit-nadezhdu-school-site';
    if (url.pathname.startsWith(`${projectPath}/api/`)) {
      return url.pathname.slice(projectPath.length);
    }

    return url.pathname;
  }

  window.fetch = async function staticFetch(input, init = {}) {
    const path = normalizePath(input);
    if (!path.startsWith('/api/')) {
      return nativeFetch(input, init);
    }

    const method = String(init.method || 'GET').toUpperCase();
    const data = readJson(siteKey, defaultData);
    const users = readJson(usersKey, defaultUsers);

    if (method === 'GET' && path === '/api/site') {
      return json({ source: 'github-pages', data });
    }

    if (method === 'GET' && path === '/api/health') {
      return json({ mode: 'github-pages', connected: false, message: 'Статическая версия сайта на GitHub Pages.' });
    }

    if (method === 'POST' && path === '/api/login') {
      const body = await readBody(init);
      const email = String(body.email || '').trim().toLowerCase();
      const user = users.find((item) => item.email.toLowerCase() === email && item.password === body.password);
      if (!user) {
        return error('Неверный email или пароль.', 401);
      }

      return json({ user: publicUser(user), token: makeToken(user) });
    }

    if (method === 'POST' && path === '/api/register') {
      const body = await readBody(init);
      const email = String(body.email || '').trim().toLowerCase();
      const role = body.role === 'admin' ? 'admin' : 'user';

      if (!body.fullName || !email || !body.password) {
        return error('Заполните все обязательные поля.');
      }

      if (String(body.password).length < 6) {
        return error('Пароль должен быть не короче 6 символов.');
      }

      if (role === 'admin' && String(body.adminCode || '') !== adminCode) {
        return error('Неверный код регистрации администратора.', 403);
      }

      if (users.some((item) => item.email.toLowerCase() === email)) {
        return error('Пользователь с таким email уже существует.');
      }

      const user = {
        id: nextId(users, 'id'),
        fullName: String(body.fullName).trim(),
        email,
        password: String(body.password),
        role
      };
      users.push(user);
      saveJson(usersKey, users);
      return json({ user: publicUser(user), token: makeToken(user) }, 201);
    }

    if (method === 'POST' && path === '/api/schedule') {
      if (!requireAdmin(init)) {
        return error('Это действие доступно только администратору.', 403);
      }

      const body = await readBody(init);
      const row = {
        ScheduleItemId: nextId(data.scheduleItems, 'ScheduleItemId'),
        GroupId: Number(body.groupId),
        WeekDay: String(body.weekDay || '').trim(),
        LessonTime: String(body.lessonTime || '').trim(),
        ClassName: String(body.className || '').trim(),
        SubjectName: String(body.subjectName || '').trim(),
        TeacherName: String(body.teacherName || '').trim(),
        Room: String(body.room || '').trim()
      };
      data.scheduleItems.push(row);
      saveJson(siteKey, data);
      return json({ row }, 201);
    }

    if (method === 'DELETE' && path.startsWith('/api/schedule/')) {
      if (!requireAdmin(init)) {
        return error('Это действие доступно только администратору.', 403);
      }

      const id = Number(path.split('/').pop());
      const before = data.scheduleItems.length;
      data.scheduleItems = data.scheduleItems.filter((item) => Number(item.ScheduleItemId) !== id);
      saveJson(siteKey, data);
      return json({ deleted: before !== data.scheduleItems.length });
    }

    if (method === 'POST' && path === '/api/news') {
      if (!requireAdmin(init)) {
        return error('Это действие доступно только администратору.', 403);
      }

      const body = await readBody(init);
      const row = {
        NewsId: nextId(data.news, 'NewsId'),
        Title: String(body.title || '').trim(),
        Body: String(body.body || '').trim(),
        PublishedDate: body.publishedDate || new Date().toISOString().slice(0, 10),
        IsPinned: Boolean(body.isPinned),
        SourceUrl: String(body.sourceUrl || '').trim() || null
      };
      data.news.unshift(row);
      saveJson(siteKey, data);
      return json({ row }, 201);
    }

    return error('Метод статического API не найден.', 404);
  };
}());
