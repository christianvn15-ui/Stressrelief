const CACHE_NAME = 'calmspace-v2';
const urlsToCache = [
  './',
  './index.html',
  './meditation.html',
  './breathing.html',
  './journal.html',
  './progress.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './zen.mp3',
  './sleep.mp3',
  './focus.mp3',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching all files');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activated');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response; // Serve from cache
      return fetch(event.request)       // Fetch online if not cached
        .catch(() => {
          // Optional: fallback offline page
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
