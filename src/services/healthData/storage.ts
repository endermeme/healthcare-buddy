import { HourlyLog, ChatMessage } from './types';

export const LOGS_STORAGE_KEY = 'health_logs';
export const CHAT_STORAGE_KEY = 'chat_messages';
export const CURRENT_RECORDING_KEY = 'current_recording';

export const loadLogs = (): HourlyLog[] => {
  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  return storedLogs ? JSON.parse(storedLogs) : [];
};

export const saveLogs = (logs: HourlyLog[]) => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

export const getCurrentRecording = (): { isRecording: boolean; currentHour: string | null } => {
  const stored = localStorage.getItem(CURRENT_RECORDING_KEY);
  return stored ? JSON.parse(stored) : { isRecording: false, currentHour: null };
};

export const setCurrentRecording = (isRecording: boolean, currentHour: string | null) => {
  localStorage.setItem(CURRENT_RECORDING_KEY, JSON.stringify({ isRecording, currentHour }));
};

export const saveChatMessage = (message: ChatMessage) => {
  const messages = loadChatMessages();
  messages.push(message);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
};

export const loadChatMessages = (): ChatMessage[] => {
  const stored = localStorage.getItem(CHAT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};