/* eslint-disable import/no-mutable-exports */
/* eslint-disable import/no-extraneous-dependencies */
import { initializeApp } from 'firebase/app';
import { isSupported, getMessaging } from 'firebase/messaging';
import { showSnackbar } from './lib/utils';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let messaging;

isSupported()
  .then((supported) => {
    if (supported) {
      app = initializeApp(firebaseConfig);
      messaging = getMessaging(app);
    }
  })
  .catch((error) => {
    showSnackbar({
      message: error?.message,
      severity: 'error',
    });
  });

export { messaging };

export default app;
