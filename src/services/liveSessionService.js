import { postData, getData } from './ApiFetch';

class LiveSessionService {
  constructor() {
    this.baseUrl = 'http://localhost:5196/api/livesessions';
  }

  async createLiveSession(sessionData) {
    const [data, error] = await postData(`${this.baseUrl}`, sessionData);
    if (error) throw error;
    return data;
  }

  async getLiveSession(sessionId) {
    const [data, error] = await getData(`${this.baseUrl}/${sessionId}`);
    if (error) throw error;
    return data;
  }

  async getUpcomingSessions() {
    const [data, error] = await getData(`${this.baseUrl}/upcoming`);
    if (error) throw error;
    return data;
  }

  async uploadRecording(sessionId, recordingFile) {
    const formData = new FormData();
    formData.append('recordingFile', recordingFile);
    
    const [data, error] = await postData(
      `${this.baseUrl}/${sessionId}/upload-recording`,
      formData,
      true
    );
    
    if (error) throw error;
    return data;
  }

  async addAttendee(sessionId, attendeeId) {
    const [data, error] = await postData(
      `${this.baseUrl}/${sessionId}/attendees/${attendeeId}`
    );
    if (error) throw error;
    return data;
  }

  async removeAttendee(sessionId, attendeeId) {
    const [data, error] = await getData(
      `${this.baseUrl}/${sessionId}/attendees/${attendeeId}`
    );
    if (error) throw error;
    return data;
  }
}

export const liveSessionService = new LiveSessionService();