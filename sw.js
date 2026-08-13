const CACHE_NAME = 'al-mastermind-v8.2';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/1icon-192.png',
  './icons/1icon-512.png'
];

/* =========================================================
   A/L MASTERMIND SERVICE WORKER v8.2
   PWA CACHE + WEB PUSH + LOCAL NOTIFICATIONS
   ========================================================= */

/* ---------- INSTALL ---------- */

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('[SW] Install failed:', error);
      })
  );
});


/* ---------- ACTIVATE ---------- */

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
      .catch(error => {
        console.error('[SW] Activate failed:', error);
      })
  );
});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener('fetch', event => {

  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  /* Never cache APIs / Supabase */
  if (
    url.pathname.includes('/api/') ||
    url.pathname.includes('/rest/') ||
    url.pathname.includes('/auth/') ||
    url.hostname.includes('supabase.co')
  ) {
    return;
  }


  /* ---------- HTML: NETWORK FIRST ---------- */

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
                cache.put(
                  './index.html',
                  copy
                );
              })
              .catch(() => {});
          }

          return response;
        })

        .catch(() =>
          caches.match('./index.html')
        )
    );

    return;
  }


  /* ---------- ASSETS: CACHE FIRST ---------- */

  if (url.origin === self.location.origin) {

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
                    cache.put(
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
   WEB PUSH
   ========================================================= */

self.addEventListener('push', event => {

  event.waitUntil(

    (async () => {

      let data = {};

      try {

        if (event.data) {
          data = event.data.json();
        }

      } catch {

        data = {
          body: event.data
            ? event.data.text()
            : 'You have a scheduled task.'
        };
      }


      const title =
        data.title ||
        '📚 A/L Mastermind';


      const options = {

        body:
          data.body ||
          'You have a scheduled task.',


        icon:
          data.icon ||
          './icons/1icon-192.png',


        badge:
          data.badge ||
          './icons/1icon-192.png',


        tag:
          data.tag ||
          `almastermind-${data.taskId || Date.now()}`,


        renotify:
          Boolean(data.renotify),


        requireInteraction:
          Boolean(data.requireInteraction),


        silent:
          Boolean(data.silent),


        timestamp:
          Date.now(),


        data: {

          url:
            data.url ||
            './',

          taskId:
            data.taskId ||
            null

        },


        actions: [

          {
            action:
              'open-task',

            title:
              'Open Tasks'
          },

          {
            action:
              'dismiss',

            title:
              'Dismiss'
          }

        ]

      };


      await self.registration.showNotification(
        title,
        options
      );

    })()
  );
});


/* =========================================================
   MESSAGE API
   ========================================================= */

self.addEventListener('message', event => {

  const message =
    event.data;

  if (!message) {
    return;
  }


  /* ---------- UPDATE SERVICE WORKER ---------- */

  if (
    message === 'SKIP_WAITING' ||
    message.type === 'SKIP_WAITING'
  ) {

    self.skipWaiting();

    return;
  }


  /* ---------- TEST NOTIFICATION ---------- */

  if (
    message.type ===
    'TEST_NOTIFICATION'
  ) {

    event.waitUntil(

      self.registration.showNotification(
        '🔔 Notifications Enabled',
        {

          body:
            'A/L Mastermind notifications are working correctly.',

          icon:
            './icons/1icon-192.png',

          badge:
            './icons/1icon-192.png',

          tag:
            'almastermind-test',

          requireInteraction:
            true,

          data: {
            url: './',
            type: 'test'
          }

        }
      )

    );

    return;
  }


  /* ---------- TASK NOTIFICATION ---------- */

  if (
    message.type ===
    'SHOW_TASK_NOTIFICATION'
  ) {

    const task =
      message.task || {};


    event.waitUntil(

      self.registration.showNotification(

        task.title ||
        '📚 Task Reminder',

        {

          body:
            task.body ||
            task.name ||
            'You have a task scheduled now.',


          icon:
            task.icon ||
            './icons/1icon-192.png',


          badge:
            task.badge ||
            './icons/1icon-192.png',


          tag:
            task.tag ||
            `task-${task.id || Date.now()}`,


          requireInteraction:
            true,


          data: {

            url:
              task.url ||
              './',

            taskId:
              task.id ||
              null

          },


          actions: [

            {
              action:
                'open-task',

              title:
                'Open Tasks'
            },

            {
              action:
                'dismiss',

              title:
                'Dismiss'
            }

          ]

        }

      )

    );

    return;
  }


  /* ---------- CLASS NOTIFICATION ---------- */

  if (
    message.type ===
    'SHOW_CLASS_NOTIFICATION'
  ) {

    const cls =
      message.classData ||
      message.class ||
      {};


    event.waitUntil(

      self.registration.showNotification(

        cls.title ||
        `📖 Class Reminder: ${cls.name || 'Class'}`,

        {

          body:
            cls.body ||
            `${cls.day || ''} • ${cls.time || ''}`,

          icon:
            './icons/1icon-192.png',

          badge:
            './icons/1icon-192.png',

          tag:
            cls.tag ||
            `class-${cls.id || Date.now()}`,

          requireInteraction:
            true,

          data: {

            url:
              cls.url ||
              './',

            classId:
              cls.id ||
              null

          },

          actions: [

            {
              action:
                'open-class',

              title:
                'Open Classes'
            },

            {
              action:
                'dismiss',

              title:
                'Dismiss'
            }

          ]

        }

      )

    );

    return;
  }

});


/* =========================================================
   NOTIFICATION CLICK
   ========================================================= */

self.addEventListener(
  'notificationclick',
  event => {

    const notification =
      event.notification;

    const action =
      event.action;

    const data =
      notification.data || {};


    notification.close();


    /* Dismiss */
    if (
      action ===
      'dismiss'
    ) {
      return;
    }


    const targetUrl =
      data.url ||
      './';


    event.waitUntil(

      self.clients.matchAll({

        type:
          'window',

        includeUncontrolled:
          true

      })

      .then(async clients => {


        /* ---------- EXISTING WINDOW ---------- */

        for (
          const client of clients
        ) {

          if (
            !('focus' in client)
          ) {
            continue;
          }


          /* Task */
          if (
            data.taskId &&
            'postMessage' in client
          ) {

            client.postMessage({

              type:
                'OPEN_TASK',

              taskId:
                data.taskId

            });

          }


          /* Class */
          if (
            data.classId &&
            'postMessage' in client
          ) {

            client.postMessage({

              type:
                'OPEN_CLASS',

              classId:
                data.classId

            });

          }


          await client.focus();

          return;
        }


        /* ---------- NEW WINDOW ---------- */

        if (
          self.clients.openWindow
        ) {

          return self.clients.openWindow(
            targetUrl
          );

        }

      })

    );

  }
);


/* =========================================================
   NOTIFICATION CLOSE
   ========================================================= */

self.addEventListener(
  'notificationclose',
  event => {

    console.log(
      '[SW] Notification closed.'
    );

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
  '[A/L Mastermind] Service Worker v8.2 loaded.'
);