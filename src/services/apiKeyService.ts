const API_KEY_STORAGE = 'deviceKey';
const API_BASE_URL = 'http://192.168.1.15';

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE);
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE, key);
};

export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/data?key=${key}`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const getApiEndpoint = (path: string): string => {
  const key = getStoredApiKey();
  return `${API_BASE_URL}${path}?key=${key}`;
};