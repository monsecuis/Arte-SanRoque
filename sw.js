/* ==========================================================================
   sw.js — Service Worker: guarda los archivos del sitio en caché para que
   funcione sin conexión después de la primera visita (RNF6).
   Solo se activa cuando el sitio se sirve por http/https (no con file://).
   Al modificar archivos, cambiar VERSION para renovar la caché.
   ========================================================================== */

const VERSION = 'arte-sr-v33';

const ARCHIVOS = [
  './',
  'index.html',
  'galeria.html',
  'artistas.html',
  'eventos.html',
  'contacto.html',
  'css/estilos.css',
  'js/datos.js',
  'js/main.js',
  'data/obras.json',
  'data/artistas.json',
  'data/eventos.json',
  'data/categorias.json'
];

self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(VERSION).then(function (cache) { return cache.addAll(ARCHIVOS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.filter(function (c) { return c !== VERSION; })
        .map(function (c) { return caches.delete(c); }));
    })
  );
  self.clients.claim();
});

/* Estrategia: red primero (contenido actualizado) y caché si no hay conexión */
self.addEventListener('fetch', function (evento) {
  if (evento.request.method !== 'GET') return;
  // Videos y PDF van directo a la red: son pesados y se piden por partes (Range)
  if (evento.request.headers.has('range') || /\.(mp4|webm|ogg|mov|pdf)$/i.test(new URL(evento.request.url).pathname)) return;

  evento.respondWith(
    fetch(evento.request)
      .then(function (respuesta) {
        const copia = respuesta.clone();
        if (respuesta.status === 200 && evento.request.url.startsWith(self.location.origin)) {
          caches.open(VERSION).then(function (cache) { cache.put(evento.request, copia); });
        }
        return respuesta;
      })
      .catch(function () {
        return caches.match(evento.request, { ignoreSearch: true });
      })
  );
});
