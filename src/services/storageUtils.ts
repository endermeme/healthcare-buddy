import { HourlyLog } from './types';

export const LOGS_STORAGE_KEY = 'health_logs';

export const loadLogs = (): HourlyLog[] => {
  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  return storedLogs ? JSON.parse(storedLogs) : [];
};

export const saveLogs = (logs: HourlyLog[]) => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

export const getCurrentRecording = (): { isRecording: boolean; currentHour: string | null } => {
  const stored = localStorage.getItem('current_recording');
  return stored ? JSON.parse(stored) : { isRecording: false, currentHour: null };
};

export const setCurrentRecording = (isRecording: boolean, currentHour: string | null) => {
  localStorage.setItem('current_recording', JSON.stringify({ isRecording, currentHour }));
};

export const saveChatMessage = (message: any) => {
  try {
    const messages = loadChatMessages();
    if (!messages.some(m => m.id === message.id)) {
      messages.push(message);
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
};

export const loadChatMessages = () => {
  const storedMessages = localStorage.getItem('chat_messages');
  return storedMessages ? JSON.parse(storedMessages) : [];
};