/* eslint-disable no-undef */

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDjgac1fez4UelXx5Eucgu2ET9iDMGMR-I",
  authDomain: "thiba-ingozi.firebaseapp.com",
  projectId: "thiba-ingozi",
  storageBucket: "thiba-ingozi.firebasestorage.app",
  messagingSenderId: "95888153096",
  appId: "1:95888153096:web:91a6435846023b80bc4fbd",
  measurementId: "G-5HB4QT4EN9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Background Message:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/assests/favicon.png",
  });
});