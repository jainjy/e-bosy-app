import { postData, getData } from './ApiFetch';

class LiveSessionService {
  constructor() {
    this.baseUrl = 'http://localhost:5196/api/livesessions';
  }

  async getLiveSession(sessionId) {
    const [data, error] = await getData(`${this.baseUrl}/${sessionId}`);
    if (error) throw error;
    return data;
  }

  async createLiveSession(sessionData) {
    const [data, error] = await postData(`${this.baseUrl}`, sessionData);
    if (error) throw error;
    return data;
  }

  async endSession(sessionId) {
    const [data, error] = await postData(`${this.baseUrl}/${sessionId}/end`);
    if (error) throw error;
    return data;
  }

  async joinSession(sessionId, userId) {
    const [data, error] = await postData(`${this.baseUrl}/${sessionId}/attendees/${userId}`);
    if (error) throw error;
    return data;
  }

  async leaveSession(sessionId, userId) {
    const [data, error] = await getData(`${this.baseUrl}/${sessionId}/attendees/${userId}`);
    if (error) throw error;
    return data;
  }

  async getUpcomingSessions() {
    const [data, error] = await getData(`${this.baseUrl}/upcoming`);
    if (error) throw error;
    return data;
  }

  async getPastSessions() {
    const [data, error] = await getData(`${this.baseUrl}/past`);
    if (error) throw error;
    return data;
  }

  async uploadRecording(sessionId, file) {
    const formData = new FormData();
    formData.append('recording', file);
    
    const [data, error] = await postData(
      `${this.baseUrl}/${sessionId}/upload-recording`,
      formData,
      true
    );
    
    if (error) throw error;
    return data;
  }
}

export const liveSessionService = new LiveSessionService();