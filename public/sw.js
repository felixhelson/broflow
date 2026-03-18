self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title ?? 'Broflow';
  const options = {
    body: data.body ?? '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: data.url ?? '/home' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? '/home')
  );
});
