// GESCAR · service worker: red primero (recibe actualizaciones al momento) y caché cuando no hay conexión
const PREFIX = 'gescar-main-', CACHE = PREFIX + '2.7';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith(PREFIX) || k === 'gescar-v1') && k !== CACHE && k !== PREFIX + 'fotos').map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/(^|\.)wikimedia\.org$/.test(url.hostname)) { // fotos de referencia: caché primero para verlas sin conexión
    e.respondWith(caches.open(PREFIX + 'fotos').then(c => c.match(req).then(r => r || fetch(req).then(resp => { if (resp.ok || resp.type === 'opaque') c.put(req, resp.clone()); return resp; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  if ('gescar-main' === 'gescar-main' && url.pathname.includes('/v2/')) return;
  e.respondWith(fetch(req).then(resp => { if (resp.ok) { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return resp; })
    .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(self.clients.matchAll({type: 'window'}).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./'))); });
