const defaultContent = {
  ru: {
    'nav.services': 'Услуги',
    'nav.cases': 'Кейсы',
    'nav.contact': 'Контакты',
    'buttons.admin': 'Панель',
    'hero.eyebrow': 'QA студия',
    'hero.title': 'Tiny fixes. Big impact.',
    'hero.subtitle': 'Тестируем UI/UX, API и продукт целиком, чтобы релизы были предсказуемыми, а пользователи — довольными.',
    'hero.cta': 'Запланировать ревью',
    'hero.support': 'Ответим в течение рабочего дня.',
    'card.title': 'Refine your product.',
    'card.body': 'Команда Tinery помогает продуктам расти за счёт аккуратного тестирования интерфейсов, сценариев и интеграций.',
    'card.pill': 'UI/UX · API · e2e',
    'services.eyebrow': 'Что делаем',
    'services.title': 'Сфокусированы на опыте пользователя',
    'services.desc': 'Собираем стек тестов, который закрывает риски: от first-click тестирования прототипов до нагрузочных прогонов и e2e.',
    'cases.eyebrow': 'Недавние проекты',
    'cases.title': 'Растим метрики вместе с вами',
    'cases.desc': 'Каждый спринт завершается понятным отчётом, а все шаги доступны в вашей админке или CI.',
    'contact.eyebrow': 'Свяжитесь с нами',
    'contact.title': 'Начнём с короткого созвона',
    'contact.desc': 'Разберём риски релиза и предложим быстрый план тестирования: smoke, API, UI, чек-листы.',
    'contact.emailLabel': 'Почта',
    'contact.phoneLabel': 'Телефон',
    'contact.chatLabel': 'Чат',
    'contact.chatValue': 'Telegram @tineryqa',
    'admin.eyebrow': 'Управление',
    'admin.title': 'Панель Tinery',
    'admin.language': 'Язык для правок',
    'admin.heroTitle': 'Хиро заголовок',
    'admin.heroSubtitle': 'Хиро подзаголовок',
    'admin.servicesDesc': 'Описание блока услуг',
    'admin.casesDesc': 'Описание блока кейсов',
    'admin.contactDesc': 'Описание контактов',
    'admin.serviceList': 'Список услуг (по строке)',
    'admin.serviceHelp': 'Каждая строка — отдельная карточка услуги.',
    'admin.save': 'Сохранить',
    'admin.reset': 'Сбросить изменения',
    'admin.statsEyebrow': 'Аналитика',
    'admin.statsTitle': 'Посещения сайта',
    'admin.resetStats': 'Очистить статистику',
    'admin.total': 'Всего визитов',
    'admin.today': 'Сегодня',
    'admin.last': 'Последний визит'
  },
  en: {
    'nav.services': 'Services',
    'nav.cases': 'Cases',
    'nav.contact': 'Contact',
    'buttons.admin': 'Admin',
    'hero.eyebrow': 'QA studio',
    'hero.title': 'Tiny fixes. Big impact.',
    'hero.subtitle': 'We test UI/UX, APIs, and end-to-end journeys so your releases stay predictable and users stay delighted.',
    'hero.cta': 'Book a review',
    'hero.support': 'We respond within one business day.',
    'card.title': 'Refine your product.',
    'card.body': 'Tinery helps products grow through thoughtful testing of interfaces, scenarios, and integrations.',
    'card.pill': 'UI/UX · API · e2e',
    'services.eyebrow': 'What we do',
    'services.title': 'Obsessed with user experience',
    'services.desc': 'We assemble a test stack that blocks risk: from first-click prototype tests to load runs and e2e.',
    'cases.eyebrow': 'Recent work',
    'cases.title': 'We ship growth with you',
    'cases.desc': 'Each sprint ends with a clear report, and every step is visible in your admin panel or CI.',
    'contact.eyebrow': 'Contact',
    'contact.title': 'Start with a quick call',
    'contact.desc': 'We’ll map your release risks and propose a fast testing plan: smoke, API, UI, checklists.',
    'contact.emailLabel': 'Email',
    'contact.phoneLabel': 'Phone',
    'contact.chatLabel': 'Chat',
    'contact.chatValue': 'Telegram @tineryqa',
    'admin.eyebrow': 'Control',
    'admin.title': 'Tinery Panel',
    'admin.language': 'Language to edit',
    'admin.heroTitle': 'Hero headline',
    'admin.heroSubtitle': 'Hero subhead',
    'admin.servicesDesc': 'Services description',
    'admin.casesDesc': 'Cases description',
    'admin.contactDesc': 'Contact description',
    'admin.serviceList': 'Services list (one per line)',
    'admin.serviceHelp': 'Each line will render as its own service card.',
    'admin.save': 'Save',
    'admin.reset': 'Reset changes',
    'admin.statsEyebrow': 'Analytics',
    'admin.statsTitle': 'Site visits',
    'admin.resetStats': 'Clear statistics',
    'admin.total': 'Total visits',
    'admin.today': 'Today',
    'admin.last': 'Last visit'
  }
};

const services = {
  ru: ['UX-аудит и сценарии', 'API тестирование и контрактные проверки', 'Нагрузочные прогоны', 'E2E автотесты и репорты'],
  en: ['UX review & flows', 'API testing and contract checks', 'Load & performance', 'E2E automation and reporting']
};

const caseHighlights = {
  ru: [
    { title: 'Fintech · 4 млн MAU', desc: 'Покрыли API 120+ контрактными тестами, ускорили релизную ветку на 1 день.' },
    { title: 'EdTech · платформа курсов', desc: 'Запустили UX-ревью онбординга и снизили отток trial на 14%.' },
    { title: 'Health · мобильное приложение', desc: 'Настроили e2e-пайплайн, подняли доверие к релизам и сократили количество хотфиксов.' }
  ],
  en: [
    { title: 'Fintech · 4M MAU', desc: 'Added 120+ contract tests for the API and freed a full day in the release branch.' },
    { title: 'EdTech · learning platform', desc: 'Ran UX review of onboarding, cutting trial churn by 14%.' },
    { title: 'Health · mobile app', desc: 'Built an end-to-end pipeline, lifting release confidence and reducing hotfixes.' }
  ]
};

const storageKeys = {
  overrides: 'tinery-content-overrides',
  language: 'tinery-language',
  stats: 'tinery-visit-stats'
};

let currentLang = localStorage.getItem(storageKeys.language) || 'ru';

function loadOverrides() {
  const raw = localStorage.getItem(storageKeys.overrides);
  return raw ? JSON.parse(raw) : {};
}

function saveOverrides(overrides) {
  localStorage.setItem(storageKeys.overrides, JSON.stringify(overrides));
}

function mergedContent(lang) {
  const overrides = loadOverrides();
  return { ...defaultContent[lang], ...(overrides[lang] || {}) };
}

function renderText() {
  const content = mergedContent(currentLang);
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-content-key]').forEach((node) => {
    const key = node.dataset.contentKey;
    node.textContent = content[key] || '';
  });

  renderServices();
  renderCases();
  highlightLangButton();
  syncAdminForm();
}

function renderServices() {
  const container = document.getElementById('serviceTiles');
  container.innerHTML = '';
  const content = loadOverrides();
  const customList = content[currentLang]?.servicesList;
  const list = customList ? customList.split('\n').filter(Boolean) : services[currentLang];

  list.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'tile';
    const title = document.createElement('h3');
    title.textContent = item;
    const desc = document.createElement('p');
    desc.textContent = currentLang === 'ru' ? 'Подбираем формат под ваш стек и скорость релизов.' : 'We tailor the format to your stack and release speed.';
    card.append(title, desc);
    container.appendChild(card);
  });
}

function renderCases() {
  const container = document.getElementById('caseBoard');
  container.innerHTML = '';
  const list = caseHighlights[currentLang];
  list.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'case-card';
    const title = document.createElement('h3');
    title.textContent = item.title;
    const desc = document.createElement('p');
    desc.textContent = item.desc;
    card.append(title, desc);
    container.appendChild(card);
  });
}

function highlightLangButton() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

function toggleAdmin(open) {
  const panel = document.getElementById('adminPanel');
  panel.classList.toggle('open', open);
  panel.setAttribute('aria-hidden', !open);
}

function setupLanguageSwitch() {
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem(storageKeys.language, currentLang);
      renderText();
    });
  });
}

function setupAdmin() {
  document.getElementById('adminToggle').addEventListener('click', () => toggleAdmin(true));
  document.getElementById('adminClose').addEventListener('click', () => toggleAdmin(false));
  document.getElementById('saveContent').addEventListener('click', saveAdminContent);
  document.getElementById('resetContent').addEventListener('click', resetAdminContent);
  document.getElementById('resetStats').addEventListener('click', resetStats);

  const adminLang = document.getElementById('adminLanguage');
  ['ru', 'en'].forEach((lang) => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang.toUpperCase();
    adminLang.appendChild(option);
  });
  adminLang.value = currentLang;
  adminLang.addEventListener('change', () => {
    currentLang = adminLang.value;
    localStorage.setItem(storageKeys.language, currentLang);
    renderText();
  });
}

function syncAdminForm() {
  const overrides = loadOverrides();
  const langOverrides = overrides[currentLang] || {};
  const content = mergedContent(currentLang);

  document.getElementById('adminLanguage').value = currentLang;
  document.getElementById('heroTitleInput').value = content['hero.title'];
  document.getElementById('heroSubtitleInput').value = content['hero.subtitle'];
  document.getElementById('servicesDescInput').value = content['services.desc'];
  document.getElementById('casesDescInput').value = content['cases.desc'];
  document.getElementById('contactDescInput').value = content['contact.desc'];
  document.getElementById('serviceListInput').value = langOverrides.servicesList || '';
}

function saveAdminContent() {
  const overrides = loadOverrides();
  overrides[currentLang] = {
    ...(overrides[currentLang] || {}),
    'hero.title': document.getElementById('heroTitleInput').value,
    'hero.subtitle': document.getElementById('heroSubtitleInput').value,
    'services.desc': document.getElementById('servicesDescInput').value,
    'cases.desc': document.getElementById('casesDescInput').value,
    'contact.desc': document.getElementById('contactDescInput').value,
    servicesList: document.getElementById('serviceListInput').value
  };
  saveOverrides(overrides);
  renderText();
}

function resetAdminContent() {
  const overrides = loadOverrides();
  delete overrides[currentLang];
  saveOverrides(overrides);
  renderText();
}

function updateStats() {
  const raw = localStorage.getItem(storageKeys.stats);
  const stats = raw ? JSON.parse(raw) : { total: 0, visits: {}, lastVisit: null };
  const today = new Date().toISOString().slice(0, 10);
  stats.total += 1;
  stats.visits[today] = (stats.visits[today] || 0) + 1;
  stats.lastVisit = new Date().toISOString();
  localStorage.setItem(storageKeys.stats, JSON.stringify(stats));
  renderStats();
}

function resetStats() {
  localStorage.removeItem(storageKeys.stats);
  renderStats();
}

function renderStats() {
  const raw = localStorage.getItem(storageKeys.stats);
  const stats = raw ? JSON.parse(raw) : { total: 0, visits: {}, lastVisit: null };
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('totalVisits').textContent = stats.total;
  document.getElementById('todayVisits').textContent = stats.visits[today] || 0;
  document.getElementById('lastVisit').textContent = stats.lastVisit
    ? new Date(stats.lastVisit).toLocaleString(currentLang)
    : '—';

  const chart = document.getElementById('chart');
  chart.innerHTML = '';
  const days = 7;
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const label = date.toISOString().slice(5, 10);
    const key = date.toISOString().slice(0, 10);
    const count = stats.visits[key] || 0;
    const maxHeight = 120;
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${Math.max(12, (count / Math.max(...Object.values(stats.visits), 1)) * maxHeight)}px`;
    const span = document.createElement('span');
    span.textContent = `${count} | ${label}`;
    bar.appendChild(span);
    chart.appendChild(bar);
  }
}

function init() {
  setupLanguageSwitch();
  setupAdmin();
  renderText();
  updateStats();
}

window.addEventListener('DOMContentLoaded', init);
