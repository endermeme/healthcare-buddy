import { Message } from './types';
import { CHAT_STORAGE_KEY } from './constants';

export const saveChatMessage = (message: Message) => {
  const messages = getChatMessages();
  messages.push(message);
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
};

export const getChatMessages = (): Message[] => {
  const stored = localStorage.getItem(CHAT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};