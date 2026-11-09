// Versión v2 trasladada a la raíz: este service worker se retira solo
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('gescar-v2-')).map(k => caches.delete(k)))).then(() => self.registration.unregister())));
