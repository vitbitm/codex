(function () {
  const form = document.getElementById('content-form');
  if (!form) return;

  const lists = {
    service: document.getElementById('services-list'),
    process: document.getElementById('process-list'),
    metric: document.getElementById('metrics-list'),
    testimonial: document.getElementById('testimonials-list'),
  };

  const templates = {
    service: () => `
      <div class="field-group" data-item-type="service">
        <div class="field-header">
          <h4>Новый сервис</h4>
          <button type="button" class="remove" data-action="remove">Удалить</button>
        </div>
        <label>Иконка</label>
        <input type="text" name="service-icon" placeholder="Например, ✨" />
        <label>Название</label>
        <input type="text" name="service-name" placeholder="Как называется услуга" />
        <label>Описание</label>
        <textarea name="service-description" rows="3" placeholder="Чем полезна услуга"></textarea>
      </div>
    `,
    process: () => `
      <div class="field-group" data-item-type="process">
        <div class="field-header">
          <h4>Новый этап</h4>
          <button type="button" class="remove" data-action="remove">Удалить</button>
        </div>
        <label>Название</label>
        <input type="text" name="process-stage" placeholder="Как называется этап" />
        <label>Описание</label>
        <textarea name="process-description" rows="3" placeholder="Что происходит на этапе"></textarea>
      </div>
    `,
    metric: () => `
      <div class="field-group" data-item-type="metric">
        <div class="field-header">
          <h4>Новая метрика</h4>
          <button type="button" class="remove" data-action="remove">Удалить</button>
        </div>
        <label>Значение</label>
        <input type="text" name="metric-value" placeholder="Например, 24ч" />
        <label>Подпись</label>
        <input type="text" name="metric-label" placeholder="Расшифровка" />
      </div>
    `,
    testimonial: () => `
      <div class="field-group" data-item-type="testimonial">
        <div class="field-header">
          <h4>Новый отзыв</h4>
          <button type="button" class="remove" data-action="remove">Удалить</button>
        </div>
        <label>Цитата</label>
        <textarea name="testimonial-quote" rows="3" placeholder="Что сказал клиент"></textarea>
        <label>Имя</label>
        <input type="text" name="testimonial-author" placeholder="Имя" />
        <label>Роль</label>
        <input type="text" name="testimonial-role" placeholder="Компания или должность" />
      </div>
    `,
  };

  function attachRemoveHandlers(container) {
    container.querySelectorAll('[data-action="remove"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const block = btn.closest('.field-group');
        block?.remove();
        updatePlaceholders(container);
      });
    });
  }

  function updatePlaceholders(container) {
    const placeholders = {
      'services-list': 'Опишите первый сервис.',
      'process-list': 'Добавьте этап процесса.',
      'metrics-list': 'Добавьте первую метрику.',
      'testimonials-list': 'Когда появятся первые отзывы — добавьте их сюда.',
    };

    const items = Array.from(container.children).filter((child) => !child.classList.contains('placeholder'));

    if (items.length === 0) {
      container.querySelectorAll('.placeholder').forEach((el) => el.remove());
      const message = placeholders[container.id];
      if (message) {
        const el = document.createElement('p');
        el.className = 'placeholder';
        el.textContent = message;
        container.appendChild(el);
      }
    } else {
      container.querySelectorAll('.placeholder').forEach((el) => el.remove());
    }
  }

  document.querySelectorAll('.add').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      const container = lists[target];
      if (!container) return;
      container.querySelectorAll('.placeholder').forEach((p) => p.remove());
      const wrapper = document.createElement('div');
      wrapper.innerHTML = templates[target]();
      const block = wrapper.firstElementChild;
      container.appendChild(block);
      attachRemoveHandlers(block);
    });
  });

  Object.values(lists).forEach((list) => {
    if (!list) return;
    attachRemoveHandlers(list);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = document.getElementById('status');
    status.textContent = 'Сохраняем…';

    const formData = new FormData(form);

    const content = JSON.parse(JSON.stringify(INITIAL_CONTENT));

    content.hero = {
      badge: formData.get('hero-badge') || '',
      title: formData.get('hero-title') || '',
      subtitle: formData.get('hero-subtitle') || '',
      ctaText: formData.get('hero-ctaText') || '',
      ctaLink: formData.get('hero-ctaLink') || '#contact',
    };

    content.studio = {
      name: formData.get('studio-name') || '',
      tagline: formData.get('studio-tagline') || '',
      shortDescription: formData.get('studio-shortDescription') || '',
    };

    content.about = {
      title: formData.get('about-title') || '',
      description: formData.get('about-description') || '',
    };

    content.metrics = Array.from(lists.metric?.querySelectorAll('.field-group') || []).map((item) => ({
      value: item.querySelector('input[name="metric-value"]').value.trim(),
      label: item.querySelector('input[name="metric-label"]').value.trim(),
    })).filter((metric) => metric.value || metric.label);

    content.servicesBlock = content.servicesBlock || {};
    const servicesTitle = formData.get('servicesBlock-title');
    const servicesDescription = formData.get('servicesBlock-description');
    content.servicesBlock.title = servicesTitle !== null ? servicesTitle : content.servicesBlock.title || 'Сервисы, заточенные под digital-продукты';
    content.servicesBlock.description = servicesDescription !== null ? servicesDescription : content.servicesBlock.description || '';

    content.services = Array.from(lists.service?.querySelectorAll('.field-group') || []).map((item) => ({
      icon: item.querySelector('input[name="service-icon"]').value.trim() || '✨',
      name: item.querySelector('input[name="service-name"]').value.trim(),
      description: item.querySelector('textarea[name="service-description"]').value.trim(),
    })).filter((service) => service.name || service.description);

    content.processBlock = content.processBlock || {};
    const processTitle = formData.get('processBlock-title');
    const processDescription = formData.get('processBlock-description');
    content.processBlock.title = processTitle !== null ? processTitle : content.processBlock.title || 'Прозрачный путь качества';
    content.processBlock.description = processDescription !== null ? processDescription : content.processBlock.description || '';

    content.process = Array.from(lists.process?.querySelectorAll('.field-group') || []).map((item) => ({
      stage: item.querySelector('input[name="process-stage"]').value.trim(),
      description: item.querySelector('textarea[name="process-description"]').value.trim(),
    })).filter((step) => step.stage || step.description);

    content.testimonialsBlock = content.testimonialsBlock || {};
    const testimonialsTitle = formData.get('testimonialsBlock-title');
    content.testimonialsBlock.title = testimonialsTitle !== null ? testimonialsTitle : content.testimonialsBlock.title || 'Нам доверяют инди-команды и стартапы';

    content.testimonials = Array.from(lists.testimonial?.querySelectorAll('.field-group') || []).map((item) => ({
      quote: item.querySelector('textarea[name="testimonial-quote"]').value.trim(),
      author: item.querySelector('input[name="testimonial-author"]').value.trim(),
      role: item.querySelector('input[name="testimonial-role"]').value.trim(),
    })).filter((testimonial) => testimonial.quote);

    content.pricing = {
      eyebrow: formData.get('pricing-eyebrow') || '',
      headline: formData.get('pricing-headline') || '',
      description: formData.get('pricing-description') || '',
      cta: formData.get('pricing-cta') || '',
    };

    content.contact = {
      title: formData.get('contact-title') || '',
      description: formData.get('contact-description') || '',
      email: formData.get('contact-email') || '',
      telegram: formData.get('contact-telegram') || '',
      phone: formData.get('contact-phone') || '',
    };

    content.seo = {
      title: formData.get('seo-title') || '',
      description: formData.get('seo-description') || '',
    };

    content.footer = {
      copyright: formData.get('footer-copyright') || '',
    };

    try {
      const response = await fetch('/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error('Ошибка сети');
      }

      INITIAL_CONTENT.hero = content.hero;
      INITIAL_CONTENT.studio = content.studio;
      INITIAL_CONTENT.about = content.about;
      INITIAL_CONTENT.metrics = content.metrics;
      INITIAL_CONTENT.servicesBlock = content.servicesBlock;
      INITIAL_CONTENT.services = content.services;
      INITIAL_CONTENT.processBlock = content.processBlock;
      INITIAL_CONTENT.process = content.process;
      INITIAL_CONTENT.testimonialsBlock = content.testimonialsBlock;
      INITIAL_CONTENT.testimonials = content.testimonials;
      INITIAL_CONTENT.pricing = content.pricing;
      INITIAL_CONTENT.contact = content.contact;
      INITIAL_CONTENT.seo = content.seo;
      INITIAL_CONTENT.footer = content.footer;

      status.textContent = 'Сохранено ✔';
      status.style.color = '#7ae29e';
      setTimeout(() => {
        status.textContent = '';
        status.style.color = '';
      }, 4000);
    } catch (error) {
      console.error(error);
      status.textContent = 'Не удалось сохранить. Попробуйте ещё раз.';
      status.style.color = '#ff9494';
    }
  });
})();
