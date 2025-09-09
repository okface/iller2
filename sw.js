const CACHE_NAME = 'med-quiz-cache-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './src/main.js',
  './src/ui.js',
  './src/quizEngine.js',
  './src/storage.js',
  './src/dataLoader.js',
  './data/questions.yaml'
];

self.addEventListener('install', evt => {
  evt.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
  })());
});

self.addEventListener('activate', evt => {
  evt.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  })());
});

self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  if (url.origin === location.origin) {
    evt.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(evt.request);
      if (cached) return cached;
      try {
        const res = await fetch(evt.request);
        if (res.ok && evt.request.method === 'GET') cache.put(evt.request, res.clone());
        return res;
      } catch { return cached || Response.error(); }
    })());
  }
});
