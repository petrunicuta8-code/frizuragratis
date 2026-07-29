// ===== SERVICE WORKER – NADO dnzz PWA =====
const CACHE_NAME = 'nadodnzz-v1';

const CACHE_FILES = [
  '/index.html',
  '/contact.html',
  '/galerie.html',
  '/login.html',
  '/register.html',
  '/cont.html',
  '/forgot-password.html',
  '/css/style.css',
  '/css/animations.css',
  '/js/auth.js',
  '/js/firebase-config.js',
  '/manifest.json'
];

// Instalare — cache fișierele principale
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activare — șterge cache-urile vechi
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — servește din cache dacă există, altfel din rețea
self.addEventListener('fetch', event => {
  // Ignoră requesturi Firebase și EmailJS (trebuie să fie live)
  if (
    event.request.url.includes('firebase') ||
    event.request.url.includes('emailjs') ||
    event.request.url.includes('gstatic') ||
    event.request.url.includes('googleapis')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Salvează în cache răspunsurile noi
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
