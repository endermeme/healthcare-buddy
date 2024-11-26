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

export const sendLogCompletionNotification = async (logData: any) => {
  try {
    const token = await getToken(messaging);
    
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}` 
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: 'Ghi chép hoàn tất',
          body: `Đã hoàn tất ghi chép cho ${new Date(logData.hour).getHours()}:00`,
        },
        data: logData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export { app, analytics };