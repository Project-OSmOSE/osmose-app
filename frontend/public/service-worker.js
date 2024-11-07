//  In a previous version of the project, a service worker was instantiated and used to cache files (js, html, etc.), but this service worker has been removed.
//  This causes an issue because previous clients who visited the page continue to see the old version of the site.
//  This file resolves the problem.
// From https://github.com/NekR/self-destroying-sw
// MIT https://github.com/NekR/self-destroying-sw/blob/master/LICENSE.md
// 1. Remove everything about your previous ServiceWorker (registration/uninstallation code, ServiceWorker file)
// 2. Create a file with the same name as your previous ServiceWorker and put it in the same place where your previous ServiceWorker was
// 3. Put following code into the file:
// 4. Deploy your project!
// Note: If the previous ServiceWorker file was cached with HTTP headers,
// the update may take some time depending on how long the caching duration is set,
// but not more than 24 hours.

self.addEventListener("install", function (e) {
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  self.registration
    .unregister()
    .then(function () {
      return self.clients.matchAll();
    })
    .then(function (clients) {
      clients.forEach((client) => client.navigate(client.url));
    });
});
