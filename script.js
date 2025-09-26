const STORAGE_KEY = 'qa_portfolio_data_v1';

const defaultData = {
    hero: {
        name: 'Анна Иванова',
        summary: 'Помогаю командам выпускать качественные продукты: ищу ошибки, улучшаю процессы и говорю на языке разработчиков и пользователей.'
    },
    about: {
        text: 'Начинающий QA-специалист с вниманием к деталям и любовью к аналитике. Имею опыт тестирования веб-приложений, написания тест-кейсов и работы с баг-трекинговыми системами. В свободное время изучаю автоматизацию на JavaScript и участвую в QA-сообществах.',
        achievements: {
            experience: '6',
            cases: '120+',
            bugs: '80'
        }
    },
    skills: [
        { title: 'Тестовая документация', description: 'Чек-листы, тест-кейсы, тест-планы, матрицы трассировки.' },
        { title: 'Инструменты', description: 'Jira, TestRail, Confluence, Postman, Chrome DevTools.' },
        { title: 'Методологии', description: 'Agile, Scrum, Kanban, гибкое взаимодействие с командой.' },
        { title: 'Автоматизация', description: 'Основы JavaScript, написание автотестов на Playwright.' }
    ],
    projects: {
        intro: 'Подборка задач, над которыми я работала во время обучения и стажировок.',
        items: [
            {
                type: 'Web / Ручное тестирование',
                title: 'Интернет-магазин одежды',
                description: 'Создала тестовую документацию, провела функциональное и регрессионное тестирование, подготовила отчёт по найденным дефектам.',
                link: '#',
                linkLabel: 'Просмотреть тест-кейсы'
            },
            {
                type: 'API',
                title: 'Сервис бронирования отелей',
                description: 'Проанализировала REST API, разработала коллекцию Postman, автоматизировала позитивные и негативные сценарии.',
                link: '#',
                linkLabel: 'Коллекция Postman'
            },
            {
                type: 'Автоматизация',
                title: 'Личный кабинет банка',
                description: 'Написала автотесты на авторизацию и перевод средств, настроила запуск в GitHub Actions.',
                link: '#',
                linkLabel: 'Репозиторий GitHub'
            }
        ]
    },
    testimonials: [
        {
            quote: '«Анна быстро вникает в процессы, грамотно оформляет документацию и всегда доводит задачи до результата.»',
            author: 'Екатерина Петрова, тимлид QA'
        },
        {
            quote: '«Проявляет инициативу и не боится предлагать улучшения. Отлично работает с баг-репортами.»',
            author: 'Дмитрий Смирнов, наставник курса'
        }
    ],
    contacts: {
        email: 'anna.qa@example.com',
        telegram: 'https://t.me/anna_qa',
        telegramLabel: '@anna_qa',
        linkedin: 'https://linkedin.com/in/anna-qa',
        linkedinLabel: 'linkedin.com/in/anna-qa'
    },
    footerName: 'Анна Иванова'
};

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
    }

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Не удалось прочитать данные из localStorage', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
        return defaultData;
    }
}

function populatePage(data) {
    const heroName = document.getElementById('hero-name');
    if (!heroName) {
        return;
    }

    heroName.textContent = data.hero.name;
    document.getElementById('hero-summary').textContent = data.hero.summary;
    document.getElementById('about-text').textContent = data.about.text;

    const experience = document.querySelector('[data-field="experience"]');
    const cases = document.querySelector('[data-field="cases"]');
    const bugs = document.querySelector('[data-field="bugs"]');

    if (experience) experience.textContent = data.about.achievements.experience;
    if (cases) cases.textContent = data.about.achievements.cases;
    if (bugs) bugs.textContent = data.about.achievements.bugs;

    const skillsList = document.getElementById('skills-list');
    if (skillsList) {
        skillsList.innerHTML = '';
        data.skills.forEach(skill => {
            const card = document.createElement('article');
            card.className = 'skill-card';
            card.innerHTML = `<h3>${skill.title}</h3><p>${skill.description}</p>`;
            skillsList.appendChild(card);
        });
    }

    const projectsIntro = document.getElementById('projects-intro');
    if (projectsIntro) {
        projectsIntro.textContent = data.projects.intro;
    }

    const projectsList = document.getElementById('projects-list');
    if (projectsList) {
        projectsList.innerHTML = '';
        data.projects.items.forEach(project => {
            const card = document.createElement('article');
            card.className = 'project-card';
            card.innerHTML = `
                <span class="project-type">${project.type}</span>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                ${project.link ? `<a class="project-link" href="${project.link}" target="_blank" rel="noopener">${project.linkLabel || 'Подробнее'}</a>` : ''}
            `;
            projectsList.appendChild(card);
        });
    }

    const testimonialsList = document.getElementById('testimonials-list');
    if (testimonialsList) {
        testimonialsList.innerHTML = '';
        data.testimonials.forEach(item => {
            const card = document.createElement('article');
            card.className = 'testimonial-card';
            card.innerHTML = `<p>${item.quote}</p><span class="author">${item.author}</span>`;
            testimonialsList.appendChild(card);
        });
    }

    const contactEmail = document.getElementById('contact-email');
    const contactTelegram = document.getElementById('contact-telegram');
    const contactLinkedIn = document.getElementById('contact-linkedin');
    if (contactEmail) {
        contactEmail.textContent = data.contacts.email;
        contactEmail.href = `mailto:${data.contacts.email}`;
    }
    if (contactTelegram) {
        contactTelegram.textContent = data.contacts.telegramLabel || data.contacts.telegram;
        contactTelegram.href = data.contacts.telegram;
    }
    if (contactLinkedIn) {
        contactLinkedIn.textContent = data.contacts.linkedinLabel || data.contacts.linkedin;
        contactLinkedIn.href = data.contacts.linkedin;
    }

    const footerName = document.getElementById('footer-name');
    const footerYear = document.getElementById('footer-year');
    if (footerName) footerName.textContent = data.footerName;
    if (footerYear) footerYear.textContent = new Date().getFullYear();
}

function handleContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();
        const status = document.getElementById('form-status');
        status.textContent = 'Спасибо! Сообщение сохранено локально.';
        form.reset();
    });
}

const data = loadData();
populatePage(data);
handleContactForm();
