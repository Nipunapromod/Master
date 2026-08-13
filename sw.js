const CACHE_NAME = 'al-mastermind-v8.0';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/1icon-192.png',
  './icons/1icon-512.png'
];

/* =========================================================
   A/L MASTERMIND SERVICE WORKER v8.0
   PWA caching + Web Push notifications
   ========================================================= */

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install failed:', err))
  );
});

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
      .catch(err => console.error('[SW] Activate failed:', err))
  );
});

/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Don't cache API/database requests.
  if (
    url.pathname.includes('/api/') ||
    url.pathname.includes('/rest/') ||
    url.hostname.includes('supabase.co')
  ) {
    return;
  }

  // Network-first for HTML.
  if (
    request.mode === 'navigate' ||
    request.destination === 'document'
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put('./index.html', copy))
              .catch(() => {});
          }

          return response;
        })
        .catch(() => caches.match('./index.html'))
    );

    return;
  }

  // Cache-first for same-origin assets.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;

          return fetch(request)
            .then(response => {
              if (response.ok) {
                const copy = response.clone();

                caches.open(CACHE_NAME)
                  .then(cache => cache.put(request, copy))
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
   =========================================================
   Example payload:

   {
     "title": "Task Reminder",
     "body": "Physics revision starts now.",
     "url": "/",
     "taskId": "123",
     "tag": "task-123"
   }

   A service worker alone cannot schedule a notification
   while the browser is completely closed. For that, your
   Todo List needs a Web Push backend.
   ========================================================= */

self.addEventListener('push', event => {
  let data = {};

  try {
    data = event.data
      ? event.data.json()
      : {};
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
      `task-${data.taskId || Date.now()}`,

    renotify:
      Boolean(data.renotify),

    requireInteraction:
      Boolean(data.requireInteraction),

    silent:
      Boolean(data.silent),

    timestamp: Date.now(),

    data: {
      url: data.url || './',
      taskId: data.taskId || null
    },

    actions: [
      {
        action: 'open-task',
        title: 'Open Tasks'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

/* =========================================================
   NOTIFICATION CLICK
   ========================================================= */

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action === 'dismiss') {
    return;
  }

  const targetUrl =
    data.url || './';

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(clients => {

      // Reuse an existing dashboard tab.
      for (const client of clients) {

        if ('focus' in client) {

          if (
            data.taskId &&
            'postMessage' in client
          ) {
            client.postMessage({
              type: 'OPEN_TASK',
              taskId: data.taskId
            });
          }

          return client.focus();
        }
      }

      // Otherwise open the dashboard.
      if (self.clients.openWindow) {
        return self.clients.openWindow(
          targetUrl
        );
      }
    })
  );
});

/* =========================================================
   MESSAGE API
   ========================================================= */

self.addEventListener('message', event => {
  const message = event.data;

  /* Force the new service worker to activate. */
  if (
    message === 'SKIP_WAITING' ||
    message?.type === 'SKIP_WAITING'
  ) {
    self.skipWaiting();
    return;
  }

  /*
   * Show an immediate task notification.
   * Your Todo List can send:
   *
   * navigator.serviceWorker.controller.postMessage({
   *   type: 'SHOW_TASK_NOTIFICATION',
   *   task: {
   *     id: task.id,
   *     name: task.name,
   *     body: 'Your task starts now.'
   *   }
   * });
   */

  if (
    message?.type ===
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
            `local-task-${task.id || Date.now()}`,

          data: {
            url:
              task.url || './',

            taskId:
              task.id || null
          },

          actions: [
            {
              action: 'open-task',
              title: 'Open Tasks'
            },
            {
              action: 'dismiss',
              title: 'Dismiss'
            }
          ]
        }
      )
    );
  }
});