import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDRXHGRo4znriUUyBe2ZhKF0xQzUwiYstg",
  authDomain: "nhipdapso-86d9a.firebaseapp.com",
  projectId: "nhipdapso-86d9a",
  storageBucket: "nhipdapso-86d9a.firebasestorage.app",
  messagingSenderId: "125390927602",
  appId: "1:125390927602:web:83085896632e037f41826b",
  measurementId: "G-0FCQRNN6S5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
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