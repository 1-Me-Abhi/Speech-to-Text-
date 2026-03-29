import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 minutes for large files
});

// Upload audio and transcribe
export const transcribeAudio = async (formData, onUploadProgress) => {
  const response = await API.post('/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return response.data;
};

// Get all transcriptions
export const getTranscriptions = async (page = 1, limit = 10) => {
  const response = await API.get(`/transcriptions?page=${page}&limit=${limit}`);
  return response.data;
};

// Get single transcription
export const getTranscription = async (id) => {
  const response = await API.get(`/transcriptions/${id}`);
  return response.data;
};

// Delete transcription
export const deleteTranscription = async (id) => {
  const response = await API.delete(`/transcriptions/${id}`);
  return response.data;
};

export default API;
