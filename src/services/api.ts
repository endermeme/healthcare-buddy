import axios from 'axios';

const API_BASE_URL = 'https://service.aigate.app/v1';
const API_KEY = 'app-sVzMPqGDTYKCkCJCQToMs4G2';

// Create axios instance with custom config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add CORS proxy to bypass CORS issues
  proxy: {
    protocol: 'https',
    host: 'cors-anywhere.herokuapp.com',
    port: 443,
    auth: {
      username: 'user',
      password: 'password'
    }
  }
});

export const sendAudioToSpeechToText = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  
  const response = await api.post('/speech-to-text', formData, {
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