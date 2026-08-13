const CACHE_NAME = 'al-mastermind-v8.3';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/1icon-192.png',
  './icons/1icon-512.png'
];

/* =========================================================
   A/L MASTERMIND SERVICE WORKER v8.3
   PWA CACHE / OFFLINE SUPPORT ONLY

   Notifications completely removed.
   No Web Push.
   No Notification API.
   No notificationclick.
   No notificationclose.
   ========================================================= */


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener('install', event => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => {
        return cache.addAll(APP_SHELL);
      })

      .then(() => {
        return self.skipWaiting();
      })

      .catch(error => {
        console.error(
          '[SW] Install failed:',
          error
        );
      })

  );

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener('activate', event => {

  event.waitUntil(

    caches.keys()

      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })

      .then(() => {
        return self.clients.claim();
      })

      .catch(error => {

        console.error(
          '[SW] Activate failed:',
          error
        );

      })

  );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener('fetch', event => {

  const request = event.request;

  /* Only handle GET requests */
  if (request.method !== 'GET') {
    return;
  }

  const url =
    new URL(request.url);


  /* =======================================================
     NEVER CACHE API / DATABASE REQUESTS
     ======================================================= */

  if (

    url.pathname.includes('/api/') ||

    url.pathname.includes('/rest/') ||

    url.pathname.includes('/auth/') ||

    url.hostname.includes('supabase.co')

  ) {

    return;

  }


  /* =======================================================
     HTML / NAVIGATION
     NETWORK FIRST
     ======================================================= */

  if (

    request.mode === 'navigate' ||

    request.destination === 'document'

  ) {

    event.respondWith(

      fetch(request)

        .then(response => {

          if (response.ok) {

            const copy =
              response.clone();

            caches.open(CACHE_NAME)

              .then(cache => {

                return cache.put(
                  './index.html',
                  copy
                );

              })

              .catch(() => {});

          }

          return response;

        })

        .catch(() => {

          return caches.match(
            './index.html'
          );

        })

    );

    return;

  }


  /* =======================================================
     SAME-ORIGIN ASSETS
     CACHE FIRST
     ======================================================= */

  if (
    url.origin ===
    self.location.origin
  ) {

    event.respondWith(

      caches.match(request)

        .then(cached => {

          if (cached) {
            return cached;
          }


          return fetch(request)

            .then(response => {

              if (response.ok) {

                const copy =
                  response.clone();

                caches.open(CACHE_NAME)

                  .then(cache => {

                    return cache.put(
                      request,
                      copy
                    );

                  })

                  .catch(() => {});

              }

              return response;

            });

        })

    );

  }

});


/* =========================================================
   SERVICE WORKER UPDATE MESSAGE
   ========================================================= */

self.addEventListener(
  'message',
  event => {

    const message =
      event.data;


    if (!message) {
      return;
    }


    /* Force new SW to activate */
    if (

      message ===
      'SKIP_WAITING' ||

      message.type ===
      'SKIP_WAITING'

    ) {

      self.skipWaiting();

    }

  }
);


/* =========================================================
   ERROR HANDLING
   ========================================================= */

self.addEventListener(
  'error',
  event => {

    console.error(
      '[SW] Error:',
      event.error ||
      event.message
    );

  }
);


self.addEventListener(
  'unhandledrejection',
  event => {

    console.error(
      '[SW] Promise error:',
      event.reason
    );

  }
);


console.log(
  '[A/L Mastermind] PWA Service Worker v8.3 loaded.'
);