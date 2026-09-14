/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
);

const firebaseConfig = {
  apiKey: 'AIzaSyB2pNn0qVMF8nAgHHK9qlUPzgD07RvAT6M',
  authDomain: 'dope-doctors.firebaseapp.com',
  projectId: 'dope-doctors',
  storageBucket: 'dope-doctors.appspot.com',
  messagingSenderId: '971274187214',
  appId: '1:971274187214:web:1b8c96a082044360a33b9f',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { data } = payload || {};
  const { uri } = data || {};

  const notificationTitle = data?.title;
  const notificationOptions = {
    body: data?.body,
    icon: data?.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  // Listen for when the notification is clicked
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Define the URL to open
    const urlToOpen = new URL(`/${uri}`, self.location.origin).href;

    // Wait until clients are matched
    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then((windowClients) => {
          let matchingClient = null;

          // Search for a client that starts with the origin URL
          for (let i = 0; i < windowClients.length; i += 1) {
            const client = windowClients[i];
            if (client.url.startsWith(self.location.origin)) {
              matchingClient = client;
              break;
            }
          }
          // If a matching client is found, post a message and focus on it
          if (matchingClient) {
            matchingClient.postMessage({ route: `/${uri}` });
            matchingClient.focus();
          } else {
            // If no matching client is found, open a new window with the URLu
            clients.openWindow(urlToOpen);
          }
        })
    );
  });
});
