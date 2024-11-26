import axios from 'axios';

const API_BASE_URL = 'https://corsproxy.io/?' + encodeURIComponent('https://service.aigate.app/v1');
const API_KEY = 'app-sVzMPqGDTYKCkCJCQToMs4G2';

// Create axios instance with custom config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export const sendAudioToSpeechToText = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('user', 'abc-123'); // Add user identifier
  
  const response = await api.post('/audio-to-text', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const sendChatMessage = async (inputs: any, query: string) => {
  const response = await api.post('/chat-messages', {
    inputs,
    query,
    response_mode: "blocking",
    conversation_id: "",
    user: "abc-123"
  });
  
  return response.data;
};