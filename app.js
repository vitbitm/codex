const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qa-premium';
const DATA_PATH = path.join(__dirname, 'data', 'content.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const sessions = new Map();

function loadContent() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load content:', error);
    return {};
  }
}

function saveContent(content) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2), 'utf-8');
}

function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts.shift().trim();
    const value = decodeURIComponent(parts.join('='));
    list[key] = value;
  });
  return list;
}

function generateSession() {
  return crypto.randomBytes(16).toString('hex');
}

function renderIndex(content) {
  const services = (content.services || []).map((service, index) => `
      <div class="service-card reveal" style="animation-delay: ${index * 0.1}s">
        <div class="icon">${escapeHtml(service.icon || '✨')}</div>
        <h3>${escapeHtml(service.name || '')}</h3>
        <p>${escapeHtml(service.description || '')}</p>
      </div>
    `).join('');

  const process = (content.process || []).map((step, index) => `
      <div class="process-step reveal" style="animation-delay: ${index * 0.1}s">
        <span class="step-index">${(index + 1).toString().padStart(2, '0')}</span>
        <h3>${escapeHtml(step.stage || '')}</h3>
        <p>${escapeHtml(step.description || '')}</p>
      </div>
    `).join('');

  const metrics = (content.metrics || []).map((metric, index) => `
      <div class="metric-card reveal" style="animation-delay: ${index * 0.08}s">
        <span class="value">${escapeHtml(metric.value || '')}</span>
        <span class="label">${escapeHtml(metric.label || '')}</span>
      </div>
    `).join('');

  const testimonials = (content.testimonials || []).map((testimonial, index) => `
      <div class="testimonial-card reveal" style="animation-delay: ${index * 0.1}s">
        <p class="quote">“${escapeHtml(testimonial.quote || '')}”</p>
        <div class="author">
          <span class="name">${escapeHtml(testimonial.author || '')}</span>
          <span class="role">${escapeHtml(testimonial.role || '')}</span>
        </div>
      </div>
    `).join('');

  return `<!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(content.seo?.title || 'Студия QA Nebula')}</title>
    <meta name="description" content="${escapeHtml(content.seo?.description || 'Премиальная студия тестирования ПО и сайтов с гибкими тарифами')}" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="/assets/css/styles.css" />
    <script defer src="/assets/js/main.js"></script>
  </head>
  <body>
    <div class="background-gradient"></div>
    <header class="navbar">
      <div class="container">
        <div class="logo">${escapeHtml(content.studio?.name || 'Nebula QA Studio')}</div>
        <nav>
          <a href="#services">Сервисы</a>
          <a href="#process">Процесс</a>
          <a href="#testimonials">Отзывы</a>
          <a href="#contact">Контакты</a>
        </nav>
        <a class="cta" href="${escapeHtml(content.hero?.ctaLink || '#contact')}">${escapeHtml(content.hero?.ctaText || 'Запросить аудит')}</a>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <div class="hero-badge reveal">${escapeHtml(content.hero?.badge || 'QA & UX лаборатория')}</div>
            <h1 class="reveal" style="animation-delay: 0.1s">${escapeHtml(content.hero?.title || '')}</h1>
            <p class="lead reveal" style="animation-delay: 0.2s">${escapeHtml(content.hero?.subtitle || '')}</p>
            <div class="hero-actions reveal" style="animation-delay: 0.3s">
              <a class="primary" href="${escapeHtml(content.hero?.ctaLink || '#contact')}">${escapeHtml(content.hero?.ctaText || 'Запросить бесплатный тест-кейс')}</a>
              <a class="secondary" href="#services">Наши подходы</a>
            </div>
          </div>
          <div class="hero-visual reveal" style="animation-delay: 0.4s">
            <div class="orb"></div>
            <div class="glass-card">
              <span>${escapeHtml(content.studio?.tagline || '')}</span>
              <p>${escapeHtml(content.studio?.shortDescription || '')}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="about" id="about">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow reveal">О студии</span>
            <h2 class="reveal" style="animation-delay: 0.1s">${escapeHtml(content.about?.title || '')}</h2>
            <p class="reveal" style="animation-delay: 0.2s">${escapeHtml(content.about?.description || '')}</p>
          </div>
          <div class="metrics-grid">
            ${metrics}
          </div>
        </div>
      </section>

      <section class="services" id="services">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow reveal">Что мы тестируем</span>
            <h2 class="reveal" style="animation-delay: 0.1s">${escapeHtml(content.servicesBlock?.title || 'Сервисы, заточенные под digital-продукты')}</h2>
            <p class="reveal" style="animation-delay: 0.2s">${escapeHtml(content.servicesBlock?.description || '')}</p>
          </div>
          <div class="services-grid">
            ${services}
          </div>
        </div>
      </section>

      <section class="process" id="process">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow reveal">Как мы работаем</span>
            <h2 class="reveal" style="animation-delay: 0.1s">${escapeHtml(content.processBlock?.title || 'Прозрачный путь качества')}</h2>
            <p class="reveal" style="animation-delay: 0.2s">${escapeHtml(content.processBlock?.description || '')}</p>
          </div>
          <div class="process-grid">
            ${process}
          </div>
        </div>
      </section>

      <section class="testimonials" id="testimonials">
        <div class="container">
          <div class="section-header">
            <span class="eyebrow reveal">Отзывы</span>
            <h2 class="reveal" style="animation-delay: 0.1s">${escapeHtml(content.testimonialsBlock?.title || 'Нам доверяют инди-команды и стартапы')}</h2>
          </div>
          <div class="testimonials-grid">
            ${testimonials || '<div class="empty-state">Мы собираем первые отзывы. Оставьте свой — он станет одним из ключевых!</div>'}
          </div>
        </div>
      </section>

      <section class="pricing" id="pricing">
        <div class="container">
          <div class="glass-panel reveal">
            <span class="eyebrow">${escapeHtml(content.pricing?.eyebrow || 'Доступный вход')}</span>
            <h2>${escapeHtml(content.pricing?.headline || '')}</h2>
            <p>${escapeHtml(content.pricing?.description || '')}</p>
            <a class="primary" href="${escapeHtml(content.hero?.ctaLink || '#contact')}">${escapeHtml(content.pricing?.cta || 'Получить просчёт')}</a>
          </div>
        </div>
      </section>

      <section class="contact" id="contact">
        <div class="container">
          <div class="contact-card reveal">
            <h2>${escapeHtml(content.contact?.title || 'Готовы подключиться')}</h2>
            <p>${escapeHtml(content.contact?.description || '')}</p>
            <div class="contact-details">
              <a href="mailto:${escapeHtml(content.contact?.email || '')}">${escapeHtml(content.contact?.email || '')}</a>
              <a href="https://t.me/${escapeHtml((content.contact?.telegram || '').replace('@', ''))}" target="_blank" rel="noopener">${escapeHtml(content.contact?.telegram || '')}</a>
              <a href="tel:${escapeHtml(content.contact?.phone || '')}">${escapeHtml(content.contact?.phone || '')}</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <span>${escapeHtml(content.footer?.copyright || '© ' + new Date().getFullYear() + ' Nebula QA Studio')}</span>
        <a href="/admin/login">Админ-панель</a>
      </div>
    </footer>
  </body>
  </html>`;
}

function renderLoginPage(errorMessage = '') {
  return `<!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Вход в админ-панель</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">
    <style>
      body { background: radial-gradient(120% 120% at 0% 0%, #1a2233, #0b0f16); min-height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; color: #e4e7f5; }
      .card { width: min(360px, 90vw); padding: 32px; background: rgba(21, 27, 41, 0.82); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; box-shadow: 0 20px 60px rgba(10, 20, 60, 0.45); backdrop-filter: blur(14px); }
      h1 { font-size: 1.5rem; margin-bottom: 1.25rem; }
      label { display: block; font-size: 0.85rem; margin-bottom: 0.5rem; color: rgba(228,231,245,0.7); }
      input { width: 100%; padding: 0.75rem 0.9rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(15, 20, 30, 0.8); color: #fff; font-size: 1rem; }
      button { margin-top: 1.5rem; width: 100%; padding: 0.9rem; border-radius: 12px; border: none; background: linear-gradient(135deg, #6d6cff, #9e4bff); color: #fff; font-weight: 600; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
      button:hover { transform: translateY(-2px); box-shadow: 0 14px 24px rgba(94, 82, 255, 0.35); }
      .error { color: #ff7272; margin-top: 1rem; font-size: 0.85rem; }
      .hint { margin-top: 1.5rem; font-size: 0.75rem; color: rgba(228,231,245,0.5); line-height: 1.4; }
      a { color: rgba(228,231,245,0.6); text-decoration: none; font-size: 0.85rem; display: inline-block; margin-top: 1rem; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Админ-панель</h1>
      <form method="post" action="/admin/login">
        <label for="password">Пароль</label>
        <input type="password" id="password" name="password" placeholder="Введите пароль" required />
        <button type="submit">Войти</button>
        ${errorMessage ? `<div class="error">${escapeHtml(errorMessage)}</div>` : ''}
        <p class="hint">Задайте переменную окружения <code>ADMIN_PASSWORD</code>, чтобы изменить пароль.</p>
      </form>
      <a href="/">← Вернуться на сайт</a>
    </div>
  </body>
  </html>`;
}

function renderAdminDashboard(content) {
  const servicesFields = (content.services || []).map((service, index) => `
    <div class="field-group" data-item-type="service" data-index="${index}">
      <div class="field-header">
        <h4>Сервис ${index + 1}</h4>
        <button type="button" class="remove" data-action="remove">Удалить</button>
      </div>
      <label>Иконка</label>
      <input type="text" name="service-icon" value="${escapeHtml(service.icon || '')}" />
      <label>Название</label>
      <input type="text" name="service-name" value="${escapeHtml(service.name || '')}" />
      <label>Описание</label>
      <textarea name="service-description" rows="3">${escapeHtml(service.description || '')}</textarea>
    </div>
  `).join('');

  const processFields = (content.process || []).map((step, index) => `
    <div class="field-group" data-item-type="process" data-index="${index}">
      <div class="field-header">
        <h4>Этап ${index + 1}</h4>
        <button type="button" class="remove" data-action="remove">Удалить</button>
      </div>
      <label>Название</label>
      <input type="text" name="process-stage" value="${escapeHtml(step.stage || '')}" />
      <label>Описание</label>
      <textarea name="process-description" rows="3">${escapeHtml(step.description || '')}</textarea>
    </div>
  `).join('');

  const metricsFields = (content.metrics || []).map((metric, index) => `
    <div class="field-group" data-item-type="metric" data-index="${index}">
      <div class="field-header">
        <h4>Метрика ${index + 1}</h4>
        <button type="button" class="remove" data-action="remove">Удалить</button>
      </div>
      <label>Значение</label>
      <input type="text" name="metric-value" value="${escapeHtml(metric.value || '')}" />
      <label>Подпись</label>
      <input type="text" name="metric-label" value="${escapeHtml(metric.label || '')}" />
    </div>
  `).join('');

  const testimonialsFields = (content.testimonials || []).map((testimonial, index) => `
    <div class="field-group" data-item-type="testimonial" data-index="${index}">
      <div class="field-header">
        <h4>Отзыв ${index + 1}</h4>
        <button type="button" class="remove" data-action="remove">Удалить</button>
      </div>
      <label>Цитата</label>
      <textarea name="testimonial-quote" rows="3">${escapeHtml(testimonial.quote || '')}</textarea>
      <label>Имя</label>
      <input type="text" name="testimonial-author" value="${escapeHtml(testimonial.author || '')}" />
      <label>Роль</label>
      <input type="text" name="testimonial-role" value="${escapeHtml(testimonial.role || '')}" />
    </div>
  `).join('');

  return `<!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Редактор контента</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
    <link rel="stylesheet" href="/assets/css/admin.css" />
  </head>
  <body>
    <div class="admin-container">
      <header>
        <div>
          <h1>Управление контентом</h1>
          <p>Заполните блоки — изменения появятся на сайте сразу после сохранения.</p>
        </div>
        <a class="back" href="/">← На сайт</a>
      </header>
      <main>
        <form id="content-form">
          <section>
            <h2>Главный экран</h2>
            <label>Бейдж</label>
            <input type="text" name="hero-badge" value="${escapeHtml(content.hero?.badge || '')}" />
            <label>Заголовок</label>
            <textarea name="hero-title" rows="2">${escapeHtml(content.hero?.title || '')}</textarea>
            <label>Подзаголовок</label>
            <textarea name="hero-subtitle" rows="3">${escapeHtml(content.hero?.subtitle || '')}</textarea>
            <label>Текст кнопки</label>
            <input type="text" name="hero-ctaText" value="${escapeHtml(content.hero?.ctaText || '')}" />
            <label>Ссылка кнопки</label>
            <input type="text" name="hero-ctaLink" value="${escapeHtml(content.hero?.ctaLink || '')}" />
          </section>

          <section>
            <h2>О студии</h2>
            <label>Название студии</label>
            <input type="text" name="studio-name" value="${escapeHtml(content.studio?.name || '')}" />
            <label>Теглайн</label>
            <input type="text" name="studio-tagline" value="${escapeHtml(content.studio?.tagline || '')}" />
            <label>Короткое описание</label>
            <textarea name="studio-shortDescription" rows="3">${escapeHtml(content.studio?.shortDescription || '')}</textarea>
            <label>Заголовок блока</label>
            <input type="text" name="about-title" value="${escapeHtml(content.about?.title || '')}" />
            <label>Описание блока</label>
            <textarea name="about-description" rows="3">${escapeHtml(content.about?.description || '')}</textarea>
          </section>

          <section>
            <div class="section-header">
              <h2>Метрики</h2>
              <button type="button" class="add" data-target="metric">Добавить</button>
            </div>
            <div id="metrics-list" class="list">
              ${metricsFields || '<p class="placeholder">Добавьте первую метрику.</p>'}
            </div>
          </section>

          <section>
            <div class="section-header">
              <h2>Сервисы</h2>
              <button type="button" class="add" data-target="service">Добавить</button>
            </div>
            <label>Заголовок блока</label>
            <input type="text" name="servicesBlock-title" value="${escapeHtml(content.servicesBlock?.title || '')}" />
            <label>Описание блока</label>
            <textarea name="servicesBlock-description" rows="3">${escapeHtml(content.servicesBlock?.description || '')}</textarea>
            <div id="services-list" class="list">
              ${servicesFields || '<p class="placeholder">Опишите первый сервис.</p>'}
            </div>
          </section>

          <section>
            <div class="section-header">
              <h2>Процесс</h2>
              <button type="button" class="add" data-target="process">Добавить</button>
            </div>
            <label>Заголовок блока</label>
            <input type="text" name="processBlock-title" value="${escapeHtml(content.processBlock?.title || '')}" />
            <label>Описание блока</label>
            <textarea name="processBlock-description" rows="3">${escapeHtml(content.processBlock?.description || '')}</textarea>
            <div id="process-list" class="list">
              ${processFields || '<p class="placeholder">Добавьте этап процесса.</p>'}
            </div>
          </section>

          <section>
            <div class="section-header">
              <h2>Отзывы</h2>
              <button type="button" class="add" data-target="testimonial">Добавить</button>
            </div>
            <label>Заголовок блока</label>
            <input type="text" name="testimonialsBlock-title" value="${escapeHtml(content.testimonialsBlock?.title || '')}" />
            <div id="testimonials-list" class="list">
              ${testimonialsFields || '<p class="placeholder">Когда появятся первые отзывы — добавьте их сюда.</p>'}
            </div>
          </section>

          <section>
            <h2>Стоимость</h2>
            <label>Подпись</label>
            <input type="text" name="pricing-eyebrow" value="${escapeHtml(content.pricing?.eyebrow || '')}" />
            <label>Заголовок</label>
            <textarea name="pricing-headline" rows="2">${escapeHtml(content.pricing?.headline || '')}</textarea>
            <label>Описание</label>
            <textarea name="pricing-description" rows="3">${escapeHtml(content.pricing?.description || '')}</textarea>
            <label>Текст кнопки</label>
            <input type="text" name="pricing-cta" value="${escapeHtml(content.pricing?.cta || '')}" />
          </section>

          <section>
            <h2>Контакты</h2>
            <label>Заголовок</label>
            <input type="text" name="contact-title" value="${escapeHtml(content.contact?.title || '')}" />
            <label>Описание</label>
            <textarea name="contact-description" rows="3">${escapeHtml(content.contact?.description || '')}</textarea>
            <label>Email</label>
            <input type="email" name="contact-email" value="${escapeHtml(content.contact?.email || '')}" />
            <label>Telegram</label>
            <input type="text" name="contact-telegram" value="${escapeHtml(content.contact?.telegram || '')}" />
            <label>Телефон</label>
            <input type="text" name="contact-phone" value="${escapeHtml(content.contact?.phone || '')}" />
          </section>

          <section>
            <h2>SEO</h2>
            <label>Title</label>
            <input type="text" name="seo-title" value="${escapeHtml(content.seo?.title || '')}" />
            <label>Description</label>
            <textarea name="seo-description" rows="3">${escapeHtml(content.seo?.description || '')}</textarea>
          </section>

          <section>
            <h2>Футер</h2>
            <label>Копирайт</label>
            <input type="text" name="footer-copyright" value="${escapeHtml(content.footer?.copyright || '')}" />
          </section>

          <div class="actions">
            <button type="submit" class="primary">Сохранить изменения</button>
            <span id="status" role="status"></span>
          </div>
        </form>
      </main>
    </div>
    <script>const INITIAL_CONTENT = ${JSON.stringify(content)};</script>
    <script src="/assets/js/admin.js" defer></script>
  </body>
  </html>`;
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.json': 'application/json'
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 1e6) req.connection.destroy();
  });
  req.on('end', () => {
    const parsed = querystring.parse(body);
    const password = parsed.password;
    if (password === ADMIN_PASSWORD) {
      const sessionId = generateSession();
      sessions.set(sessionId, { createdAt: Date.now() });
      res.writeHead(302, {
        'Set-Cookie': `session=${sessionId}; HttpOnly; Path=/; Max-Age=${60 * 60 * 6}`,
        'Location': '/admin'
      });
      res.end();
    } else {
      const html = renderLoginPage('Неверный пароль. Попробуйте снова.');
      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    }
  });
}

function requireAuth(req, res) {
  const cookies = parseCookies(req);
  const sessionId = cookies.session;
  if (sessionId && sessions.has(sessionId)) {
    return true;
  }
  res.writeHead(302, { Location: '/admin/login' });
  res.end();
  return false;
}

function handleContentUpdate(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 1e6) req.connection.destroy();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      saveContent(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Ошибка сохранения' }));
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/assets/')) {
    const assetPath = path.join(PUBLIC_DIR, pathname.replace('/assets/', ''));
    serveStaticFile(res, assetPath);
    return;
  }

  if (req.method === 'GET' && pathname === '/') {
    const content = loadContent();
    const html = renderIndex(content);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'GET' && pathname === '/admin/login') {
    const html = renderLoginPage();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'POST' && pathname === '/admin/login') {
    handleLogin(req, res);
    return;
  }

  if (req.method === 'GET' && pathname === '/admin') {
    if (!requireAuth(req, res)) return;
    const content = loadContent();
    const html = renderAdminDashboard(content);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  if (req.method === 'POST' && pathname === '/admin') {
    if (!requireAuth(req, res)) return;
    handleContentUpdate(req, res);
    return;
  }

  if (req.method === 'POST' && pathname === '/admin/logout') {
    const cookies = parseCookies(req);
    const sessionId = cookies.session;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.writeHead(302, { 'Set-Cookie': 'session=; Max-Age=0; Path=/', Location: '/admin/login' });
    res.end();
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
