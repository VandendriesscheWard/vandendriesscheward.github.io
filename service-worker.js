/**
 * Created by WardVdd on 9/04/2018.
 */

var cacheName = 'manOfTheWorld';
var filesToCache = [
    '/',
    '/index.html',
    '/assets/js/bootstrap.min.js',
    '/assets/js/jquery-3.1.1.min.js',
    '/assets/js/script.js',
    '/assets/css/reset.css',
    '/assets/css/bootstrap.min.css',
    '/assets/css/screen.css',
    '/images/icon-bordered.png',
    '/images/home-white.png',
    '/images/imageNotLoaded.png',
    '/manifest.json'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch');
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );

});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    //TO-do cachename
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    //return self.clients.claim();
});
