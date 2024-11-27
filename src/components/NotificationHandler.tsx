import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { requestNotificationPermission, onMessageListener, checkHealthMetrics } from '@/services/notificationService';

export const NotificationHandler = () => {
  useEffect(() => {
    const initNotifications = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        console.log('FCM Token:', token);
      }
    };

    initNotifications();

    const unsubscribe = onMessageListener().then((payload: any) => {
      toast({
        title: payload.notification.title,
        description: payload.notification.body,
      });
    });

    return () => {
      unsubscribe;
    };
  }, []);

  return null;
};