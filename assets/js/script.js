const contentFiles = {
  cs: 'content/cs.json',
  en: 'content/en.json'
};

const state = {
  lang: 'cs',
  content: {},
  settings: {}
};

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Cannot load ${path}`);
  return response.json();
}

function youtubeId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/
  ];

  for (const pattern of patterns) {
    const match = String(url).match(pattern);
    if (match) return match[1];
  }

  return String(url).trim();
}

function renderContent() {
  document.documentElement.lang = state.lang;

  document.querySelectorAll('[data-field]').forEach((element) => {
    const key = element.getAttribute('data-field');
    element.textContent = state.content[key] || '';
  });

  const musicians = document.getElementById('musicians');
  musicians.innerHTML = '';
  (state.content.musicians || []).forEach((musician) => {
    const row = document.createElement('p');
    const name = document.createElement('strong');
    name.textContent = musician.name;
    row.appendChild(name);
    row.append(` - ${musician.instrument}`);
    musicians.appendChild(row);
  });

  const email = state.settings.email || 'booking@zosimaquartet.com';
  const mailto = `mailto:${email}`;
  const emailLink = document.getElementById('email-link');
  const mailIconLink = document.getElementById('mail-icon-link');
  emailLink.href = mailto;
  emailLink.textContent = email.toUpperCase();
  mailIconLink.href = mailto;

  const facebookLink = document.getElementById('facebook-link');
  facebookLink.href = state.settings.facebook || '#';

  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.lang === state.lang);
  });
}

function renderVideos() {
  const grid = document.getElementById('video-grid');
  grid.innerHTML = '';

  (state.settings.videos || []).forEach((url, index) => {
    const id = youtubeId(url);
    const frame = document.createElement('div');
    frame.className = 'video-frame';
    frame.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${id}"
        title="Zosima Quartet video ${index + 1}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"></iframe>
    `;
    grid.appendChild(frame);
  });
}

async function switchLanguage(lang) {
  if (!contentFiles[lang]) return;
  state.lang = lang;
  state.content = await loadJson(contentFiles[lang]);
  renderContent();
  localStorage.setItem('zosima-lang', lang);
}

async function init() {
  state.settings = await loadJson('content/settings.json');
  const savedLang = localStorage.getItem('zosima-lang');
  state.lang = savedLang || state.settings.defaultLanguage || 'cs';
  if (!contentFiles[state.lang]) state.lang = 'cs';

  state.content = await loadJson(contentFiles[state.lang]);
  renderVideos();
  renderContent();

  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.addEventListener('click', () => switchLanguage(button.dataset.lang));
  });
}

init().catch((error) => {
  console.error(error);
});
