import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDRXHGRo4znriUUyBe2ZhKF0xQzUwiYstg",
  authDomain: "nhipdapso-86d9a.firebaseapp.com",
  projectId: "nhipdapso-86d9a",
  storageBucket: "nhipdapso-86d9a.firebasestorage.app",
  messagingSenderId: "125390927602",
  appId: "1:125390927602:web:83085896632e037f41826b",
  measurementId: "G-0FCQRNN6S5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export const initializeFirebaseMessaging = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging);
      console.log("FCM Token:", token);
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

export { app, analytics, messaging };