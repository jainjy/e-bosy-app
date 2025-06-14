// src/services/liveSessionService.js
import axios from 'axios';

const API_URL = '/api/livesessions';

export const liveSessionService = {
  async getSession(sessionId) {
    const response = await axios.get(`${API_URL}/${sessionId}`);
    return response.data;
  },

  async startSession(sessionId) {
    const response = await axios.post(`${API_URL}/${sessionId}/start`);
    return response.data;
  },

  async endSession(sessionId) {
    const response = await axios.post(`${API_URL}/${sessionId}/end`);
    return response.data;
  },

  async getWebSocketToken(sessionId) {
    const response = await axios.get(`${API_URL}/${sessionId}/token`);
    return response.data.token;
  },

  async uploadRecording(sessionId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/${sessionId}/upload-recording`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // Vous pouvez emettre un evenement ou utiliser un etat pour suivre la progression
      }
    });

    return response.data;
  }
};