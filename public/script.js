async function fetchContent() {
  const response = await fetch('/api/content');
  if (!response.ok) {
    throw new Error('Не удалось загрузить контент');
  }
  return response.json();
}

function populateHero(hero) {
  document.querySelector('.hero-title').textContent = hero.title;
  document.querySelector('.hero-subtitle').textContent = hero.subtitle;
  const cta = document.querySelector('.hero-cta');
  cta.textContent = hero.ctaText;
  cta.href = hero.ctaLink;
}

function populateAbout(about) {
  document.querySelector('#about .section-title').textContent = about.title;
  document.querySelector('.about-description').textContent = about.description;
}

function populateServices(services) {
  const container = document.querySelector('.services-grid');
  container.innerHTML = '';
  services.forEach((service, index) => {
    const card = document.createElement('article');
    card.className = 'service-card fade-up';
    card.style.animationDelay = `${index * 0.1}s`;

    const title = document.createElement('h3');
    title.textContent = service.name;
    const description = document.createElement('p');
    description.textContent = service.description;

    card.append(title, description);
    container.appendChild(card);
  });
}

function populateProcess(process) {
  const container = document.querySelector('.process-steps');
  container.innerHTML = '';
  process.steps.forEach((step, index) => {
    const item = document.createElement('div');
    item.className = 'process-step fade-up';
    item.style.animationDelay = `${index * 0.1}s`;

    const counter = document.createElement('span');
    counter.className = 'step-index';
    counter.textContent = `0${index + 1}`;
    const description = document.createElement('p');
    description.textContent = step;

    item.append(counter, description);
    container.appendChild(item);
  });
}

function populateTestimonials(testimonials) {
  const container = document.querySelector('.testimonials-list');
  container.innerHTML = '';
  testimonials.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'testimonial-card fade-up';
    card.style.animationDelay = `${index * 0.1}s`;

    const quote = document.createElement('p');
    quote.className = 'quote';
    quote.textContent = `“${item.quote}”`;
    const author = document.createElement('p');
    author.className = 'author';
    author.textContent = item.author;

    card.append(quote, author);
    container.appendChild(card);
  });
}

function populateContact(contact) {
  document.querySelector('#contact .section-title').textContent = contact.title;
  document.querySelector('.contact-description').textContent = contact.description;
  const [emailCard, phoneCard] = document.querySelectorAll('.contact-card');
  emailCard.href = `mailto:${contact.email}`;
  emailCard.querySelector('.contact-value').textContent = contact.email;
  phoneCard.href = `tel:${contact.phone.replace(/[^\d+]/g, '')}`;
  phoneCard.querySelector('.contact-value').textContent = contact.phone;
}

function initYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

async function init() {
  try {
    const content = await fetchContent();
    populateHero(content.hero);
    populateAbout(content.about);
    populateServices(content.services);
    populateProcess(content.process);
    populateTestimonials(content.testimonials);
    populateContact(content.contact);
    initYear();
    setupScrollAnimations();
  } catch (error) {
    console.error(error);
  }
}

init();
