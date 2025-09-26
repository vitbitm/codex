const loginPanel = document.getElementById('login-panel');
const editorPanel = document.getElementById('editor-panel');
const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout');
const contentForm = document.getElementById('content-form');
const saveStatus = document.getElementById('save-status');

let token = localStorage.getItem('qaSparkToken') || '';
let contentState = null;

const servicesContainer = document.getElementById('services-container');
const processContainer = document.getElementById('process-container');
const testimonialsContainer = document.getElementById('testimonials-container');

function togglePanels(authenticated) {
  if (authenticated) {
    loginPanel.classList.add('hidden');
    editorPanel.classList.remove('hidden');
  } else {
    loginPanel.classList.remove('hidden');
    editorPanel.classList.add('hidden');
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
    throw new Error(error.message || 'Ошибка сервера');
  }
  return response.json();
}

function createField({ labelText, name, value = '', type = 'text', textarea = false, rows = 3 }) {
  const label = document.createElement('label');
  const labelTitle = document.createElement('span');
  labelTitle.textContent = labelText;
  label.appendChild(labelTitle);

  const control = textarea ? document.createElement('textarea') : document.createElement('input');
  control.name = name;
  control.required = true;
  if (textarea) {
    control.rows = rows;
    control.value = value;
  } else {
    control.type = type;
    control.value = value;
  }
  label.appendChild(control);
  return label;
}

function createServiceItem(service = { name: '', description: '' }, index = 0) {
  const wrapper = document.createElement('div');
  wrapper.className = 'item-grid';

  const heading = document.createElement('h3');
  heading.textContent = `Услуга ${index + 1}`;
  wrapper.appendChild(heading);

  wrapper.appendChild(
    createField({ labelText: 'Название', name: `services[${index}].name`, value: service.name })
  );
  wrapper.appendChild(
    createField({
      labelText: 'Описание',
      name: `services[${index}].description`,
      value: service.description,
      textarea: true,
      rows: 3
    })
  );

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn remove-btn';
  removeBtn.textContent = 'Удалить';
  removeBtn.addEventListener('click', () => {
    wrapper.remove();
    rebuildNames(servicesContainer, 'services', 'Услуга');
  });
  wrapper.appendChild(removeBtn);

  return wrapper;
}

function createProcessItem(step = '', index = 0) {
  const wrapper = document.createElement('div');
  wrapper.className = 'item-grid';

  const heading = document.createElement('h3');
  heading.textContent = `Шаг ${index + 1}`;
  wrapper.appendChild(heading);

  wrapper.appendChild(
    createField({
      labelText: 'Описание шага',
      name: `process.steps[${index}]`,
      value: step
    })
  );

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn remove-btn';
  removeBtn.textContent = 'Удалить';
  removeBtn.addEventListener('click', () => {
    wrapper.remove();
    rebuildNames(processContainer, 'process.steps', 'Шаг');
  });
  wrapper.appendChild(removeBtn);

  return wrapper;
}

function createTestimonialItem(testimonial = { author: '', quote: '' }, index = 0) {
  const wrapper = document.createElement('div');
  wrapper.className = 'item-grid';

  const heading = document.createElement('h3');
  heading.textContent = `Отзыв ${index + 1}`;
  wrapper.appendChild(heading);

  wrapper.appendChild(
    createField({
      labelText: 'Цитата',
      name: `testimonials[${index}].quote`,
      value: testimonial.quote,
      textarea: true,
      rows: 3
    })
  );
  wrapper.appendChild(
    createField({
      labelText: 'Автор',
      name: `testimonials[${index}].author`,
      value: testimonial.author
    })
  );

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn remove-btn';
  removeBtn.textContent = 'Удалить';
  removeBtn.addEventListener('click', () => {
    wrapper.remove();
    rebuildNames(testimonialsContainer, 'testimonials', 'Отзыв');
  });
  wrapper.appendChild(removeBtn);

  return wrapper;
}

function rebuildNames(container, base, labelPrefix) {
  Array.from(container.children).forEach((child, index) => {
    child.querySelectorAll('input, textarea').forEach(field => {
      const name = field.getAttribute('name');
      const updated = name.replace(/^[^[]+/, base).replace(/\[[^\]]*\]/, `[${index}]`);
      field.setAttribute('name', updated);
    });
    const heading = child.querySelector('h3');
    if (heading) {
      heading.textContent = `${labelPrefix} ${index + 1}`;
    }
  });
}

function populateForm(content) {
  contentForm.reset();
  contentForm.querySelector('[name="hero.title"]').value = content.hero.title;
  contentForm.querySelector('[name="hero.subtitle"]').value = content.hero.subtitle;
  contentForm.querySelector('[name="hero.ctaText"]').value = content.hero.ctaText;
  contentForm.querySelector('[name="hero.ctaLink"]').value = content.hero.ctaLink;

  contentForm.querySelector('[name="about.title"]').value = content.about.title;
  contentForm.querySelector('[name="about.description"]').value = content.about.description;

  servicesContainer.innerHTML = '';
  content.services.forEach((service, index) => {
    servicesContainer.appendChild(createServiceItem(service, index));
  });

  processContainer.innerHTML = '';
  content.process.steps.forEach((step, index) => {
    processContainer.appendChild(createProcessItem(step, index));
  });

  testimonialsContainer.innerHTML = '';
  content.testimonials.forEach((testimonial, index) => {
    testimonialsContainer.appendChild(createTestimonialItem(testimonial, index));
  });

  contentForm.querySelector('[name="contact.title"]').value = content.contact.title;
  contentForm.querySelector('[name="contact.description"]').value = content.contact.description;
  contentForm.querySelector('[name="contact.email"]').value = content.contact.email;
  contentForm.querySelector('[name="contact.phone"]').value = content.contact.phone;
}

function collectArray(prefix) {
  const fields = contentForm.querySelectorAll(`[name^="${prefix}"]`);
  const grouped = [];

  fields.forEach(field => {
    const match = field.name.match(/\[(\d+)\]/);
    if (!match) return;
    const index = Number(match[1]);
    if (!grouped[index]) {
      grouped[index] = {};
    }
    const keyMatch = field.name.match(/\]\.(.*)$/);
    if (keyMatch) {
      grouped[index][keyMatch[1]] = field.value.trim();
    } else {
      grouped[index] = field.value.trim();
    }
  });

  return grouped.filter(Boolean);
}

function serializeForm() {
  return {
    hero: {
      title: contentForm.querySelector('[name="hero.title"]').value.trim(),
      subtitle: contentForm.querySelector('[name="hero.subtitle"]').value.trim(),
      ctaText: contentForm.querySelector('[name="hero.ctaText"]').value.trim(),
      ctaLink: contentForm.querySelector('[name="hero.ctaLink"]').value.trim()
    },
    about: {
      title: contentForm.querySelector('[name="about.title"]').value.trim(),
      description: contentForm.querySelector('[name="about.description"]').value.trim()
    },
    services: collectArray('services'),
    process: {
      steps: collectArray('process.steps')
    },
    testimonials: collectArray('testimonials'),
    contact: {
      title: contentForm.querySelector('[name="contact.title"]').value.trim(),
      description: contentForm.querySelector('[name="contact.description"]').value.trim(),
      email: contentForm.querySelector('[name="contact.email"]').value.trim(),
      phone: contentForm.querySelector('[name="contact.phone"]').value.trim()
    }
  };
}

async function loadContent() {
  try {
    contentState = await api('/api/content');
    populateForm(contentState);
  } catch (error) {
    saveStatus.textContent = error.message;
  }
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  loginError.textContent = '';
  try {
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password: passwordInput.value })
    });
    token = data.token;
    localStorage.setItem('qaSparkToken', token);
    passwordInput.value = '';
    togglePanels(true);
    await loadContent();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    if (token) {
      await api('/api/logout', { method: 'POST' });
    }
  } catch (error) {
    console.warn('Logout error:', error.message);
  } finally {
    token = '';
    localStorage.removeItem('qaSparkToken');
    togglePanels(false);
  }
});

contentForm.addEventListener('submit', async event => {
  event.preventDefault();
  saveStatus.textContent = 'Сохраняем...';
  const payload = serializeForm();
  try {
    await api('/api/content', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    contentState = payload;
    saveStatus.textContent = 'Обновлено!';
    setTimeout(() => (saveStatus.textContent = ''), 2000);
  } catch (error) {
    saveStatus.textContent = error.message;
  }
});

document.getElementById('add-service').addEventListener('click', () => {
  const index = servicesContainer.children.length;
  servicesContainer.appendChild(createServiceItem({ name: '', description: '' }, index));
});

document.getElementById('add-process-step').addEventListener('click', () => {
  const index = processContainer.children.length;
  processContainer.appendChild(createProcessItem('', index));
});

document.getElementById('add-testimonial').addEventListener('click', () => {
  const index = testimonialsContainer.children.length;
  testimonialsContainer.appendChild(createTestimonialItem({ quote: '', author: '' }, index));
});

async function init() {
  if (!token) {
    togglePanels(false);
    return;
  }
  try {
    await loadContent();
    togglePanels(true);
  } catch (error) {
    console.warn(error.message);
    togglePanels(false);
  }
}

init();
