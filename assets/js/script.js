const contentFiles = { cs: 'content/cs.json', en: 'content/en.json' };
const state = { lang: 'cs', content: {}, settings: {} };

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Cannot load ${path}`);
  return response.json();
}
function youtubeId(url) {
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?&]+)/, /youtube\.com\/embed\/([^?&]+)/];
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
  document.getElementById('email-link').href = `mailto:${email}`;
  document.getElementById('email-link').textContent = email.toUpperCase();
  document.getElementById('mail-icon-link').href = `mailto:${email}`;
  document.getElementById('facebook-link').href = state.settings.facebook || '#';
  document.querySelectorAll('.lang-btn').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.lang === state.lang);
  });
}
function renderVideos() {
  const grid = document.getElementById('video-grid');
  grid.innerHTML = '';
  (state.settings.videos || []).forEach((url) => {
    const id = youtubeId(url);
    const link = document.createElement('a');
    link.className = 'video-card';
    link.href = `https://www.youtube.com/watch?v=${id}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.style.backgroundImage = `url(https://img.youtube.com/vi/${id}/hqdefault.jpg)`;
    link.innerHTML = `<span class="play-badge"><span class="play-icon"></span><span>Play video</span></span>`;
    grid.appendChild(link);
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
  document.querySelectorAll('.lang-btn').forEach((button) => button.addEventListener('click', () => switchLanguage(button.dataset.lang)));
}
init().catch(console.error);
