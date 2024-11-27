import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if all required config values are present
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    if (!firebaseConfig.projectId) {
      console.warn('Firebase configuration is incomplete. Notifications will not work.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Notification permission error:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export const checkHealthMetrics = (heartRate: number, bloodOxygen: number) => {
  const alerts = [];

  if (heartRate < 60) {
    alerts.push('Nhịp tim quá thấp');
  } else if (heartRate > 100) {
    alerts.push('Nhịp tim quá cao');
  }

  if (bloodOxygen < 95) {
    alerts.push('Nồng độ oxy trong máu thấp');
  }

  return alerts;
};