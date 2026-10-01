/* Configure Firebase web push with the same public values used by the app. */
importScripts(
  "https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "REPLACE_WITH_NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  messagingSenderId: "REPLACE_WITH_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_NEXT_PUBLIC_FIREBASE_APP_ID",
});

firebase.messaging();
