const app = document.querySelector('#app');
const roleBadge = document.querySelector('#roleBadge');
const openAuth = document.querySelector('#openAuth');
const closeAuth = document.querySelector('#closeAuth');
const authModal = document.querySelector('#authModal');
const logoutBtn = document.querySelector('#logoutBtn');
const authError = document.querySelector('#authError');
const basePath = (document.body.dataset.basePath || '').replace(/\/$/, '');

const state = {
  view: viewFromPath(location.pathname),
  site: null,
  source: 'loading',
  warning: '',
  user: JSON.parse(localStorage.getItem('hopeUser') || 'null'),
  token: localStorage.getItem('hopeToken') || ''
};

function viewFromPath(pathname) {
  const scopedPath = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || '/'
    : pathname;
  const clean = scopedPath.replace(/\/+$/, '') || '/';
  return {
    '/': 'home',
    '/about': 'about',
    '/schedule': 'schedule',
    '/team': 'team',
    '/contacts': 'contacts'
  }[clean] || 'home';
}

function pathFromView(view) {
  const path = {
    home: '/',
    about: '/about',
    schedule: '/schedule',
    team: '/team',
    contacts: '/contacts'
  }[view] || '/';
  return `${basePath}${path}`;
}

function assetPath(path) {
  if (!path) {
    return '';
  }

  if (/^(https?:|data:)/.test(path)) {
    return path;
  }

  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isAdmin() {
  return state.user?.role === 'admin';
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Ошибка запроса');
  }
  return payload;
}

function setUser(user, token) {
  state.user = user;
  state.token = token;
  localStorage.setItem('hopeUser', JSON.stringify(user));
  localStorage.setItem('hopeToken', token);
  updateAuthUi();
  render();
}

function logout() {
  state.user = null;
  state.token = '';
  localStorage.removeItem('hopeUser');
  localStorage.removeItem('hopeToken');
  updateAuthUi();
  render();
}

function updateAuthUi() {
  roleBadge.classList.toggle('role-badge--admin', isAdmin());
  if (!state.user) {
    roleBadge.textContent = 'Гость';
    logoutBtn.hidden = true;
    return;
  }

  roleBadge.textContent = isAdmin() ? 'Администратор' : 'Пользователь';
  logoutBtn.hidden = false;
}

function sourceBadge() {
  const text = state.source === 'database' ? 'Данные из MS SQL Server' : 'Демо-данные, SQL Server не подключен';
  return `<span class="role-badge ${state.source === 'database' ? '' : 'role-badge--admin'}">${text}</span>`;
}

async function loadSite() {
  app.innerHTML = '<section class="card"><h2>Загрузка данных...</h2><p>Получаем сведения центра образования.</p></section>';
  const payload = await api('/api/site');
  state.site = payload.data;
  state.source = payload.source;
  state.warning = payload.warning || '';
  render();
}

function activateNav() {
  document.querySelectorAll('[data-view]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.view === state.view);
  });
}

function setView(view, push = true) {
  state.view = view;
  if (push) {
    history.pushState({}, '', pathFromView(view));
  }
  render();
}

function render() {
  updateAuthUi();
  activateNav();

  if (!state.site) {
    return;
  }

  const views = {
    home: renderHome,
    about: renderAbout,
    schedule: renderSchedule,
    team: renderTeam,
    contacts: renderContacts
  };

  app.innerHTML = views[state.view]?.() || renderHome();
  bindViewEvents();
}

function renderHome() {
  const org = state.site.organization;
  const directions = state.site.directions.map((item) => `
    <article class="card">
      <h3>${escapeHtml(item.Title)}</h3>
      <p>${escapeHtml(item.Description)}</p>
    </article>
  `).join('');
  const news = state.site.news.slice(0, 3).map((item) => `
    <article class="card">
      <h3>${escapeHtml(item.Title)}</h3>
      <p>${escapeHtml(item.Body)}</p>
      <p class="muted">${escapeHtml(item.PublishedDate || '')}</p>
    </article>
  `).join('');

  return `
    <section class="hero">
      <div class="hero__content">
        <p class="eyebrow">Официальные данные центра образования</p>
        <h1>${escapeHtml(org.Tagline)}</h1>
        <p class="lead">${escapeHtml(org.ShortName)}</p>
        <div class="hero__actions">
          <button class="button button--primary" data-go="schedule" type="button">Открыть расписание</button>
          <button class="button" data-go="contacts" type="button">Контакты</button>
          ${sourceBadge()}
        </div>
        ${state.warning ? `<p class="form-note">Предупреждение: ${escapeHtml(state.warning)}</p>` : ''}
      </div>
      <div class="hero__image" role="img" aria-label="Фото центра образования"></div>
    </section>

    <section class="section">
      <div class="metric-row">
        <div class="metric"><strong>${escapeHtml(org.HistoricalDate)}</strong><span>историческая дата создания</span></div>
        <div class="metric"><strong>${escapeHtml(org.RegistrationDate)}</strong><span>дата регистрации</span></div>
        <div class="metric"><strong>09:00</strong><span>начало занятий</span></div>
        <div class="metric"><strong>5 дней</strong><span>учебная неделя</span></div>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <div>
          <p class="eyebrow">Направления</p>
          <h2>Чем занимается центр</h2>
          <p>Ключевые направления взяты с официальной страницы «О Центре».</p>
        </div>
      </div>
      <div class="grid grid--3">${directions}</div>
    </section>

    <section class="section">
      <div class="section__head">
        <div>
          <p class="eyebrow">Новости</p>
          <h2>Коротко о важном</h2>
        </div>
      </div>
      <div class="grid grid--3">${news}</div>
    </section>

    <section class="section banner-row">
      <img src="${assetPath('/assets/unity-2026.png')}" alt="Информационный баннер 2026">
      <img src="${assetPath('/assets/ministry-news.png')}" alt="Новости Министерства просвещения">
    </section>
  `;
}

function renderAbout() {
  const org = state.site.organization;
  const contacts = state.site.contacts;
  return `
    <section class="section">
      <div class="section__head">
        <div>
          <p class="eyebrow">О центре</p>
          <h2>${escapeHtml(org.ShortName)}</h2>
          <p>Страница собрана по данным разделов «О Центре» и «Основные сведения» официального сайта.</p>
        </div>
        ${sourceBadge()}
      </div>
      <div class="grid grid--2">
        <article class="card">
          <h3>Образовательная среда</h3>
          <p>Центр работает с детьми с особыми образовательными потребностями и делает акцент на качественном образовании, социальных навыках, творчестве и доступной среде.</p>
        </article>
        <article class="card">
          <h3>Официальные реквизиты</h3>
          <p>ИНН: ${escapeHtml(org.Inn)}. КПП: ${escapeHtml(org.Kpp)}. ОГРН: ${escapeHtml(org.Ogrn)}.</p>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <div>
          <p class="eyebrow">Контрольные данные</p>
          <h2>Режим и адрес</h2>
        </div>
      </div>
      <div class="data-list">
        ${contacts.map((item) => `<div class="data-row"><span>${escapeHtml(item.Label)}</span><strong>${escapeHtml(item.Value)}</strong></div>`).join('')}
      </div>
    </section>
  `;
}

function renderSchedule() {
  const groups = state.site.scheduleGroups;
  const groupMap = new Map(groups.map((group) => [Number(group.GroupId), group]));
  const rows = state.site.scheduleItems.map((item) => `
    <tr>
      <td>${escapeHtml(groupMap.get(Number(item.GroupId))?.Title || '')}</td>
      <td>${escapeHtml(item.WeekDay)}</td>
      <td>${escapeHtml(item.LessonTime)}</td>
      <td>${escapeHtml(item.ClassName)}</td>
      <td><strong>${escapeHtml(item.SubjectName)}</strong><br><span class="muted">${escapeHtml(item.TeacherName || '')}</span></td>
      <td>${escapeHtml(item.Room || '')}</td>
      ${isAdmin() ? `<td><button class="button button--small button--danger" data-delete-schedule="${item.ScheduleItemId}" type="button">Удалить</button></td>` : ''}
    </tr>
  `).join('');

  return `
    <section class="section">
      <div class="section__head">
        <div>
          <p class="eyebrow">Родителям и ученикам</p>
          <h2>Расписание</h2>
          <p>Официальная страница источника содержит разделы «Расписание 1-4 классы» и «Расписание 5-11 классы». Ниже добавлена удобная таблица для сайта и изображения источника.</p>
        </div>
        ${sourceBadge()}
      </div>

      <div class="schedule-layout">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Раздел</th>
                <th>День</th>
                <th>Время</th>
                <th>Класс</th>
                <th>Предмет</th>
                <th>Кабинет</th>
                ${isAdmin() ? '<th>Действие</th>' : ''}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <aside class="schedule-source">
          ${groups.map((group) => `
            <article class="card">
              <h3>${escapeHtml(group.Title)}</h3>
              <p>${escapeHtml(group.Description)}</p>
              ${group.ImagePath ? `<img class="source-image" src="${escapeHtml(assetPath(group.ImagePath))}" alt="${escapeHtml(group.Title)}">` : ''}
            </article>
          `).join('')}
        </aside>
      </div>

      ${isAdmin() ? renderAdminPanel(groups) : '<p class="form-note section">Войдите как администратор, чтобы добавлять уроки и новости.</p>'}
    </section>
  `;
}

function renderAdminPanel(groups) {
  return `
    <section class="admin-panel">
      <div class="section__head">
        <div>
          <p class="eyebrow">Администрирование</p>
          <h2>Панель администратора</h2>
          <p>Изменения сохраняются в MS SQL Server. Если сервер недоступен, они работают в демо-памяти до перезапуска.</p>
        </div>
      </div>
      <div class="admin-forms">
        <form id="scheduleForm" class="form-stack">
          <h3>Добавить урок</h3>
          <label>Раздел
            <select name="groupId" required>
              ${groups.map((group) => `<option value="${group.GroupId}">${escapeHtml(group.Title)}</option>`).join('')}
            </select>
          </label>
          <label>День недели<input name="weekDay" value="Вторник" required></label>
          <label>Время<input name="lessonTime" value="11:00 - 11:45" required></label>
          <label>Класс<input name="className" value="5-11" required></label>
          <label>Предмет<input name="subjectName" value="Информатика" required></label>
          <label>Преподаватель<input name="teacherName" value="Учитель-предметник"></label>
          <label>Кабинет<input name="room" value="учебный кабинет"></label>
          <button class="button button--primary" type="submit">Сохранить урок</button>
        </form>

        <form id="newsForm" class="form-stack">
          <h3>Добавить новость</h3>
          <label>Заголовок<input name="title" value="Новое объявление центра" required></label>
          <label>Дата<input name="publishedDate" type="date" value="${new Date().toISOString().slice(0, 10)}"></label>
          <label>Текст<textarea name="body" required>Информация добавлена техническим администратором сайта.</textarea></label>
          <label>Источник<input name="sourceUrl" value="https://shkola-darit-nadezhdu.gosuslugi.ru/"></label>
          <label><span><input name="isPinned" type="checkbox"> Закрепить</span></label>
          <button class="button button--primary" type="submit">Сохранить новость</button>
        </form>
      </div>
    </section>
  `;
}

function renderTeam() {
  return `
    <section class="section">
      <div class="section__head">
        <div>
          <p class="eyebrow">Наша школа</p>
          <h2>Администрация</h2>
          <p>Данные взяты с официальной страницы «Администрация».</p>
        </div>
        ${sourceBadge()}
      </div>
      <div class="grid grid--3">
        ${state.site.leaders.map((leader) => `
          <article class="card leader">
            <h3>${escapeHtml(leader.FullName)}</h3>
            <div class="leader__position">${escapeHtml(leader.Position)}</div>
            <div class="muted">${escapeHtml(leader.Phone || '')}</div>
            <div class="muted">${escapeHtml(leader.Email || '')}</div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderContacts() {
  return `
    <section class="section">
      <div class="section__head">
        <div>
          <p class="eyebrow">Контакты</p>
          <h2>Как связаться с центром</h2>
          <p>Адрес, режим работы и телефоны взяты с официальной страницы «Контакты».</p>
        </div>
        ${sourceBadge()}
      </div>
      <div class="grid grid--2">
        <div class="data-list">
          ${state.site.contacts.map((item) => `<div class="data-row"><span>${escapeHtml(item.Label)}</span><strong>${escapeHtml(item.Value)}</strong></div>`).join('')}
        </div>
        <article class="card">
          <h3>Как добраться</h3>
          <p>Адрес: 214036, г. Смоленск, ул. Попова, д.56. На официальной странице указаны маршруты от железнодорожного вокзала и автовокзала.</p>
          <img class="source-image" src="${assetPath('/assets/map.png')}" alt="Карта проезда">
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <div>
          <p class="eyebrow">Горячие линии</p>
          <h2>Полезные телефоны</h2>
        </div>
      </div>
      <div class="grid grid--3">
        ${state.site.hotlines.map((item) => `<article class="card"><h3>${escapeHtml(item.Title)}</h3><p>${escapeHtml(item.Value)}</p></article>`).join('')}
      </div>
    </section>
  `;
}

function bindViewEvents() {
  app.querySelectorAll('[data-go]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.go));
  });

  app.querySelector('#scheduleForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      await api('/api/schedule', { method: 'POST', body: JSON.stringify(data) });
      await loadSite();
      setView('schedule', false);
    } catch (error) {
      alert(error.message);
    }
  });

  app.querySelector('#newsForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.isPinned = formData.has('isPinned');
    try {
      await api('/api/news', { method: 'POST', body: JSON.stringify(data) });
      await loadSite();
      setView('home', false);
    } catch (error) {
      alert(error.message);
    }
  });

  app.querySelectorAll('[data-delete-schedule]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!confirm('Удалить урок из расписания?')) {
        return;
      }
      try {
        await api(`/api/schedule/${button.dataset.deleteSchedule}`, { method: 'DELETE' });
        await loadSite();
        setView('schedule', false);
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-view]');
  if (!link) {
    return;
  }
  event.preventDefault();
  setView(link.dataset.view);
});

window.addEventListener('popstate', () => {
  state.view = viewFromPath(location.pathname);
  render();
});

openAuth.addEventListener('click', () => {
  authError.textContent = '';
  authModal.hidden = false;
});

closeAuth.addEventListener('click', () => {
  authModal.hidden = true;
});

authModal.addEventListener('click', (event) => {
  if (event.target === authModal) {
    authModal.hidden = true;
  }
});

logoutBtn.addEventListener('click', logout);

document.querySelector('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  authError.textContent = '';
  try {
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const payload = await api('/api/login', { method: 'POST', body: JSON.stringify(data) });
    setUser(payload.user, payload.token);
    authModal.hidden = true;
  } catch (error) {
    authError.textContent = error.message;
  }
});

document.querySelector('#registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  authError.textContent = '';
  try {
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const payload = await api('/api/register', { method: 'POST', body: JSON.stringify(data) });
    setUser(payload.user, payload.token);
    authModal.hidden = true;
  } catch (error) {
    authError.textContent = error.message;
  }
});

updateAuthUi();
loadSite().catch((error) => {
  app.innerHTML = `<section class="card"><h2>Ошибка загрузки</h2><p>${escapeHtml(error.message)}</p></section>`;
});
