import React, { createContext, useState, useContext, useEffect } from 'react';
import { webSocketService } from '../services/webSocketService';
import { liveSessionService } from '../services/liveSessionService';
import { useAuth } from './AuthContext';

const LiveSessionContext = createContext();

export const LiveSessionProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (activeSession) {
      initializeWebSocket();
    }
    return () => {
      webSocketService.disconnect();
    };
  }, [activeSession]);

  const initializeWebSocket = () => {
    webSocketService.connect(activeSession.sessionId, user.userId);
    webSocketService.addListener('connection', handleConnectionChange);
    webSocketService.addListener('chat', handleChatMessage);
    webSocketService.addListener('control', handleControlMessage);
  };

  const joinSession = async (sessionId) => {
    try {
      const session = await liveSessionService.getLiveSession(sessionId);
      setActiveSession(session);
      await liveSessionService.addAttendee(sessionId, user.userId);
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  };

  const leaveSession = async () => {
    if (activeSession) {
      await liveSessionService.removeAttendee(activeSession.sessionId, user.userId);
      webSocketService.disconnect();
      setActiveSession(null);
    }
  };

  const value = {
    activeSession,
    participants,
    chatMessages,
    isConnected,
    joinSession,
    leaveSession,
    // ... autres méthodes utiles
  };

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
};

export const useLiveSession = () => {
  const context = useContext(LiveSessionContext);
  if (!context) {
    throw new Error('useLiveSession must be used within a LiveSessionProvider');
  }
  return context;
};