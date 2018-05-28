/**
 * Created by WardVdd on 9/04/2018.
 */

var cacheName = 'manOfTheWorld';
var filesToCache = [
    '/',
    '/index.html',
    '/assets/js/bundle.js',
    '/assets/css/style.css',
    '/images/icon-bordered.png',
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
                if (cacheName.indexOf(key) === -1) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});
