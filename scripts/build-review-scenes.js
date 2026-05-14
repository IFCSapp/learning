const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const outputPath = path.join(root, 'review-scenes.html');
const source = fs.readFileSync(indexPath, 'utf8');

const dataMatch = source.match(/const DATA = ([\s\S]*?);\r?\nconst DAILY_BY_ID/);
if (!dataMatch) throw new Error('DATA was not found in index.html');
const data = JSON.parse(dataMatch[1]);

const imageMatch = source.match(/const SCENE_IMAGES = \{([\s\S]*?)\};\r?\nconst state/);
if (!imageMatch) throw new Error('SCENE_IMAGES was not found in index.html');

const images = {};
for (const line of imageMatch[1].split(/\r?\n/)) {
  const item = line.match(/(CS\d{3}):\s*'([^']+)'/);
  if (item) images[item[1]] = item[2];
}

const scenes = data.items
  .filter((item) => /^CS\d{3}$/.test(item.id))
  .sort((a, b) => a.id.localeCompare(b.id, 'ja'))
  .map((item) => ({
    id: item.id,
    title: item.title,
    cg: item.cg,
    cgTitle: item.cgTitle,
    visible: item.visible,
    methods: item.methods,
    strength: item.strength,
    tags: item.tags || [],
    image: images[item.id] || `assets/scenes/${item.id.toLowerCase()}.webp`,
  }));

const cgs = data.cgs.map((cg) => ({ id: cg.id, title: cg.title }));

function safeJSON(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CS001-CS064 場面画像確認</title>
<style>
:root {
  --bg: #f6f7f9;
  --surface: #fff;
  --text: #1f2933;
  --muted: #667085;
  --border: #d9e1e8;
  --soft: #eef3f7;
  --primary: #0f766e;
  --primary-soft: #e6f4f1;
  --primary-border: #9ed4ca;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.65;
}
button, input, select { font: inherit; }
button { cursor: pointer; }
header {
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(255,255,255,.96);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 14px 20px;
  display: grid;
  gap: 12px;
}
.top-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}
h1 { margin: 0; font-size: 1.35rem; line-height: 1.35; }
.meta { color: var(--muted); font-size: .9rem; }
.tabs { display: flex; flex-wrap: wrap; gap: 8px; }
.tab {
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
  color: var(--text);
  padding: 8px 14px;
  font-weight: 800;
}
.tab[aria-selected="true"] {
  color: var(--primary);
  background: var(--primary-soft);
  border-color: var(--primary-border);
}
.controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
input, select {
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
}
input { width: min(360px, 48vw); }
main {
  max-width: 1440px;
  margin: 0 auto;
  padding: 18px 20px 28px;
}
.status {
  margin: 0 0 14px;
  color: var(--muted);
  font-weight: 700;
}
.view { display: none; }
.view.active { display: block; }
.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 12px;
}
.list-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.image-button {
  display: block;
  width: 100%;
  border: 0;
  padding: 0;
  background: var(--soft);
}
.image-button img,
.card img {
  display: block;
  width: 100%;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  object-fit: cover;
  background: var(--soft);
}
.image-button:hover img { filter: brightness(.97); }
.list-body { padding: 10px 11px 12px; }
.list-title {
  display: block;
  margin-top: 6px;
  font-weight: 800;
  font-size: .92rem;
  line-height: 1.45;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
  gap: 14px;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.card img { border-bottom: 1px solid var(--border); }
.body { padding: 13px 14px 15px; }
.eyebrow {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 7px;
  color: var(--muted);
  font-size: .78rem;
  font-weight: 800;
}
.badge {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 8px;
  background: #f9fafb;
}
h2 {
  margin: 0 0 10px;
  font-size: 1.05rem;
  line-height: 1.45;
}
.block {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--soft);
}
.block strong {
  display: block;
  color: var(--primary);
  font-size: .83rem;
  margin-bottom: 3px;
}
.block p { margin: 0; font-size: .92rem; }
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}
.tag {
  color: var(--muted);
  background: #f7f9fb;
  border: 1px solid var(--soft);
  border-radius: 999px;
  padding: 2px 7px;
  font-size: .76rem;
}
.empty {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 18px;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, .48);
}
.modal-backdrop.is-open { display: flex; }
.modal {
  width: min(1120px, 96vw);
  max-height: min(90vh, 900px);
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 22px 70px rgba(15, 23, 42, .28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
}
.modal-title { color: var(--muted); font-weight: 800; }
.modal-close {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 999px;
  padding: 7px 11px;
  font-weight: 800;
}
.modal-body { overflow: auto; background: #f8fafc; }
.modal-body img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
}
@media (max-width: 760px) {
  .top-row { grid-template-columns: 1fr; }
  .controls { justify-content: stretch; }
  input, select { width: 100%; }
  main { padding: 14px 12px 22px; }
  .grid { grid-template-columns: 1fr; }
  .modal-backdrop { align-items: flex-end; padding: 0; }
  .modal { width: 100%; border-radius: 12px 12px 0 0; }
}
</style>
</head>
<body>
<header>
  <div class="header-inner">
    <div class="top-row">
      <div>
        <h1>CS001-CS064 場面画像確認</h1>
        <div class="meta">ローカルサーバー不要。HTMLファイルを直接開いて確認できます。</div>
      </div>
      <div class="controls">
        <input id="query" type="search" placeholder="ID・見出し・詳細で検索">
        <select id="cgFilter" aria-label="CGで絞り込み">
          <option value="all">すべてのCG</option>
        </select>
      </div>
    </div>
    <nav class="tabs" aria-label="表示の切り替え">
      <button class="tab" type="button" data-view="list" aria-selected="true">一覧を見る</button>
      <button class="tab" type="button" data-view="detail" aria-selected="false">詳細を見る</button>
    </nav>
  </div>
</header>
<main>
  <p id="status" class="status"></p>
  <section id="view-list" class="view active">
    <div id="listGrid" class="list-grid"></div>
  </section>
  <section id="view-detail" class="view">
    <div id="detailGrid" class="grid"></div>
  </section>
</main>
<div id="imageModal" class="modal-backdrop" aria-hidden="true">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="imageModalTitle">
    <div class="modal-bar">
      <div id="imageModalTitle" class="modal-title">場面イメージ</div>
      <button id="imageModalClose" class="modal-close" type="button">閉じる</button>
    </div>
    <div id="imageModalBody" class="modal-body"></div>
  </div>
</div>
<script>
const SCENES = ${safeJSON(scenes)};
const CGS = ${safeJSON(cgs)};
const statusEl = document.getElementById('status');
const listGridEl = document.getElementById('listGrid');
const detailGridEl = document.getElementById('detailGrid');
const queryEl = document.getElementById('query');
const cgFilterEl = document.getElementById('cgFilter');
const tabs = [...document.querySelectorAll('.tab')];
const modalEl = document.getElementById('imageModal');
const modalTitleEl = document.getElementById('imageModalTitle');
const modalBodyEl = document.getElementById('imageModalBody');
const modalCloseEl = document.getElementById('imageModalClose');
let activeView = 'list';

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

for (const cg of CGS) {
  const option = document.createElement('option');
  option.value = cg.id;
  option.textContent = \`\${cg.id} \${cg.title}\`;
  cgFilterEl.appendChild(option);
}

function filteredScenes() {
  const q = queryEl.value.trim().toLowerCase();
  const cg = cgFilterEl.value;
  return SCENES.filter((item) => {
    const matchesCg = cg === 'all' || item.cg === cg;
    const text = [item.id, item.title, item.cg, item.cgTitle, item.visible, item.methods, item.strength, ...(item.tags || [])].join(' ').toLowerCase();
    return matchesCg && (!q || text.includes(q));
  });
}

function listCard(item) {
  return \`<article class="list-card">
    <button class="image-button" type="button" data-image-src="\${escapeHTML(item.image)}" data-image-title="\${escapeHTML(item.id)} \${escapeHTML(item.title)}">
      <img src="\${escapeHTML(item.image)}" alt="\${escapeHTML(item.id)} \${escapeHTML(item.title)} の場面画像" loading="lazy" width="768" height="432">
    </button>
    <div class="list-body">
      <div class="eyebrow"><span class="badge">\${escapeHTML(item.id)}</span><span class="badge">\${escapeHTML(item.cg)}</span></div>
      <span class="list-title">\${escapeHTML(item.title)}</span>
    </div>
  </article>\`;
}

function detailCard(item) {
  return \`<article class="card" id="\${escapeHTML(item.id)}">
    <img src="\${escapeHTML(item.image)}" alt="\${escapeHTML(item.id)} \${escapeHTML(item.title)} の場面画像" loading="lazy" width="768" height="432">
    <div class="body">
      <div class="eyebrow">
        <span class="badge">\${escapeHTML(item.id)}</span>
        <span class="badge">\${escapeHTML(item.cg)}</span>
        <span>\${escapeHTML(item.cgTitle)}</span>
      </div>
      <h2>\${escapeHTML(item.title)}</h2>
      <div class="block"><strong>詳細</strong><p>\${escapeHTML(item.visible)}</p></div>
      <div class="block"><strong>支援</strong><p>\${escapeHTML(item.methods)}</p></div>
      <div class="block"><strong>強みとして使える面</strong><p>\${escapeHTML(item.strength)}</p></div>
      <div class="tags">\${(item.tags || []).map((tag) => \`<span class="tag">\${escapeHTML(tag)}</span>\`).join('')}</div>
    </div>
  </article>\`;
}

function setView(view) {
  activeView = view;
  document.querySelectorAll('.view').forEach((section) => section.classList.toggle('active', section.id === \`view-\${view}\`));
  tabs.forEach((tab) => tab.setAttribute('aria-selected', tab.dataset.view === view ? 'true' : 'false'));
}

function render() {
  const filtered = filteredScenes();
  statusEl.textContent = \`\${filtered.length} / \${SCENES.length} 件を表示\`;
  listGridEl.innerHTML = filtered.length ? filtered.map(listCard).join('') : '<div class="empty">該当する場面がありません。</div>';
  detailGridEl.innerHTML = filtered.length ? filtered.map(detailCard).join('') : '<div class="empty">該当する場面がありません。</div>';
}

function openImageModal(src, title) {
  modalTitleEl.textContent = title || '場面イメージ';
  modalBodyEl.innerHTML = \`<img src="\${escapeHTML(src)}" alt="\${escapeHTML(title || '場面イメージ')}">\`;
  modalEl.classList.add('is-open');
  modalEl.setAttribute('aria-hidden', 'false');
  modalCloseEl.focus();
}

function closeImageModal() {
  modalEl.classList.remove('is-open');
  modalEl.setAttribute('aria-hidden', 'true');
  modalBodyEl.innerHTML = '';
}

tabs.forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
queryEl.addEventListener('input', render);
cgFilterEl.addEventListener('change', render);
document.body.addEventListener('click', (event) => {
  const imageButton = event.target.closest('[data-image-src]');
  if (imageButton && activeView === 'list') {
    openImageModal(imageButton.dataset.imageSrc, imageButton.dataset.imageTitle);
  }
});
modalCloseEl.addEventListener('click', closeImageModal);
modalEl.addEventListener('click', (event) => { if (event.target === modalEl) closeImageModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeImageModal(); });
render();
</script>
</body>
</html>
`;

fs.writeFileSync(outputPath, html);
console.log(`Wrote ${outputPath}`);
console.log(`Scenes: ${scenes.length}, images: ${Object.keys(images).length}`);
