// Сеть в приоритете (новая версия подхватывается сразу), без сети — из кэша. Запросы к скрипту таблицы и к Диску не трогаем.
const CACHE = 'nf-shell-v1';
const SHELL = ['./', 'index.html', 'map.js', 'vendor/d3.min.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'seed/seed.json',
  'fonts/unbounded-latin-500-normal.woff2', 'fonts/unbounded-cyrillic-500-normal.woff2', 'fonts/unbounded-latin-600-normal.woff2', 'fonts/unbounded-cyrillic-600-normal.woff2',
  'fonts/golos-text-latin-400-normal.woff2', 'fonts/golos-text-cyrillic-400-normal.woff2', 'fonts/golos-text-latin-500-normal.woff2', 'fonts/golos-text-cyrillic-500-normal.woff2',
  'fonts/golos-text-latin-600-normal.woff2', 'fonts/golos-text-cyrillic-600-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 4000);
      const r = await fetch(e.request, { signal: ctl.signal, cache: 'no-cache' });
      clearTimeout(t);
      if (r && r.ok) c.put(e.request, r.clone());
      return r;
    } catch (err) {
      const hit = await c.match(e.request, { ignoreSearch: true });
      return hit || new Response('Нет сети', { status: 503 });
    }
  })());
});
