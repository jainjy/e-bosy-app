import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder } from '@microsoft/signalr';
import SimplePeer from 'simple-peer';
import { toast } from 'react-toastify';
import VideoPlayerLive from '../components/VideoPlayerLive';
import ConnectionStatus from '../components/ConnectionStatus';
import "../test.css";

const StudentPage = () => {
  const [roomId, setRoomId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [teacherStream, setTeacherStream] = useState(null);
  const [studentId, setStudentId] = useState('');
  const connectionRef = useRef();
  const peerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const generatedId = `ETU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setStudentId(generatedId);
  }, []);

  const joinSession = async () => {
    if (!roomId) {
      toast.error('Veuillez entrer un ID de salle');
      return;
    }

    try {
      setConnectionStatus('connecting');

      const conn = new HubConnectionBuilder()
        .withUrl(import.meta.env.VITE_SIGNALR_URL || "http://localhost:5000/livehub")
        .withAutomaticReconnect()
        .build();

      await conn.start();
      await conn.invoke("JoinStream", roomId, studentId);
      setConnectionStatus('connected');

      conn.on("ReceiveSignal", (signal, teacherConnectionId) => {
        if (!peerRef.current) {
          const peer = new SimplePeer({
            initiator: false,
            config: { 
              iceServers: [{ 
                urls: 'turn:numb.viagenie.ca',
                username: 'email@example.com',
                credential: 'password'
              }]
            }
            

          });
          console.log("Signal reçu:", signal, teacherConnectionId);

          peer.on('signal', data => {
            conn.invoke("SendSignal", JSON.stringify(data), teacherConnectionId);
          });

          peer.on('stream', stream => {
            console.log("Stream reçu", stream);
            setTeacherStream(stream);
          });

          peer.on('error', err => {
            toast.error(`Erreur de connexion: ${err.message}`);
            setConnectionStatus('disconnected');
          });

          peer.on('close', () => {
            toast.info("Connexion au professeur fermée");
            setConnectionStatus('disconnected');
          });

          peerRef.current = peer;
        }

        peerRef.current.signal(JSON.parse(signal));
      });

      conn.on("StreamEnded", () => {
        toast.info("Le professeur a terminé la session");
        setConnectionStatus('disconnected');
        if (peerRef.current) {
          peerRef.current.destroy();
          peerRef.current = null;
        }
        setTeacherStream(null);
      });

      connectionRef.current = conn;
      toast.success(`Connecté à la salle: ${roomId}`);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error(`Erreur: ${error.message}`);
      setConnectionStatus('disconnected');
    }
  };

  const leaveSession = () => {
    if (connectionRef.current) {
      connectionRef.current.stop();
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setTeacherStream(null);
    navigate('/');
  };

  return (
    <div className="student-container">
      <div className="header">
        <h1>Session Étudiant</h1>
        <div className="connection-info">
          {connectionStatus === 'connected' && (
            <span>Connecté en tant que: {studentId}</span>
          )}
          <ConnectionStatus status={connectionStatus} />
          {connectionStatus === 'connected' && (
            <button onClick={leaveSession} className="leave-btn">
              Quitter la session
            </button>
          )}
        </div>
      </div>

      <div className="content">
        {connectionStatus !== 'connected' ? (
          <div className="join-form">
            <h2>Rejoindre un cours</h2>
            <div className="form-group">
              <label htmlFor="roomId">ID de la salle:</label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Entrez l'ID fourni par le professeur"
              />
            </div>
            <button onClick={joinSession} disabled={!roomId}>
              Rejoindre
            </button>
          </div>
        ) : (
          <VideoPlayerLive
            stream={teacherStream}
            title={`Cours en direct - Salle ${roomId}`}
          />
        )}
      </div>
    </div>
  );
};

export default StudentPage;
