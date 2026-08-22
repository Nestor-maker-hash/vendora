self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let data;

  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Vendora",
      body: event.data.text(),
    };
  }

  const title = data.title || "Vendora";

  const url = data.url || "/dashboard/notifications";

  const options = {
    body: data.body || "You have a new notification.",

    icon: data.icon || "/icon.png",
    badge: data.badge || "/icon.png",

    data: {
      url,
    },

    tag: data.tag || "vendora-notification",

    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationUrl =
    event.notification?.data?.url ||
    "/dashboard/notifications";

  const targetUrl = new URL(
    notificationUrl,
    self.location.origin
  ).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {

        for (const client of clientList) {
          if (
            "focus" in client &&
            client.url.startsWith(self.location.origin)
          ) {
            return client
              .navigate(targetUrl)
              .then(() => client.focus());
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      })
  );
});
