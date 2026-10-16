/* Dziennik Kierowcy — service worker: online zawsze świeża wersja z GitHuba, offline kopia z pamięci */
const CACHE = 'dziennik-v1.2.1';
const FILES = ['./DziennikKierowcy.html', './manifest.json', './DziennikKierowcy-192.png', './DziennikKierowcy-512.png', './DziennikKierowcy-maskable-512.png', './DziennikKierowcy-apple-touch.png', './DziennikKierowcy-apple-touch-dark.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;  // np. mapy, API — bez cache
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(r => r || (req.mode === 'navigate' ? caches.match('./DziennikKierowcy.html') : undefined)))
  );
});
