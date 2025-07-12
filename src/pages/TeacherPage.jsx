import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import { Video, VideoOff, Users, Power } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { postData } from "../services/ApiFetch";

export default function TeacherPage() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedStudents, setConnectedStudents] = useState(0);
  const [peers, setPeers] = useState([]);
  const [session, setSession] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordButton, setShowRecordButton] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const connRef = useRef(null);
  const peersRef = useRef({});
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const [sessionData] = await postData(`/livesessions/${sessionId}/start`);
        if (sessionData) {
          setSession(sessionData);
          await postData(`/livesessions/${sessionId}/attendees/${user.userId}`);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        navigate("/live-sessions");
      }
    };

    initializeSession();
  }, [sessionId, user.userId, navigate]);

  useEffect(() => {
    if (!sessionId || !user?.userId) return;

    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/hub/conference")
      .withAutomaticReconnect()
      .build();

    connRef.current = conn;

    const setupConnection = async () => {
      try {
        await conn.start();
        await conn.invoke("JoinSession", parseInt(sessionId), user.userId);
        setIsConnected(true);

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
        }
        streamRef.current = stream;

        conn.on("UserJoined", (userId, isTeacher) => {
          if (!isTeacher) {
            setConnectedStudents(prev => prev + 1);
            createPeer(userId);
          }
        });

        conn.on("UserLeft", (userId, isTeacher) => {
          if (!isTeacher) {
            setConnectedStudents(prev => Math.max(0, prev - 1));
            removePeer(userId);
          }
        });

        conn.on("ReceiveSignal", (senderId, signal) => {
          const peer = peersRef.current[senderId];
          if (peer && !peer.destroyed && !peer.connected) {
            try {
              peer.signal(signal);
            } catch (err) {
              console.error("Error processing signal:", err);
            }
          }
        });

      } catch (err) {
        console.error("Connection error:", err);
      }
    };

    setupConnection();

    return () => {
      Object.values(peersRef.current).forEach(peer => {
        if (!peer.destroyed) peer.destroy();
      });
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (connRef.current) {
        connRef.current.stop().catch(console.error);
      }
    };
  }, [sessionId, user?.userId]);

  useEffect(() => {
    const startAutoRecording = async () => {
      try {
        recordedChunksRef.current = [];
        const options = { mimeType: 'video/webm;codecs=vp8,opus' };
        const mediaRecorder = new MediaRecorder(streamRef.current, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setRecordingFinished(true);
        };

        mediaRecorder.start(1000);
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors du démarrage de l'enregistrement:", error);
      }
    };

    if (streamRef.current) {
      startAutoRecording();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [streamRef.current]);

  const createPeer = (studentId) => {
    if (!streamRef.current) return;

    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: streamRef.current
    });

    peer.on("signal", (data) => {
      if (connRef.current?.state === "Connected") {
        connRef.current.invoke("SendSignal", user.userId.toString(), data)
          .catch(console.error);
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
      removePeer(studentId);
    });

    peersRef.current[studentId] = peer;
    setPeers(prev => [...prev, { id: studentId, peer }]);
  };

  const removePeer = (studentId) => {
    const peer = peersRef.current[studentId];
    if (peer && !peer.destroyed) {
      peer.destroy();
    }
    delete peersRef.current[studentId];
    setPeers(prev => prev.filter(p => p.id !== studentId));
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadRecording = async () => {
    try {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `session-${sessionId}.webm`, { type: 'video/webm' });
      
      const formData = new FormData();
      formData.append('recordingFile', file);

      const response = await postData(`livesessions/${sessionId}/upload-recording`,formData,true);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      alert('Enregistrement téléversé avec succès');
      setRecordingFinished(false);
    } catch (error) {
      console.error('Erreur lors du téléversement:', error);
      alert('Erreur lors du téléversement de l\'enregistrement');
    }
  };

  const endSession = async () => {
    try {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      await postData(`/livesessions/${sessionId}/end`);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (connRef.current) {
        await connRef.current.invoke("SendSignal", user.userId.toString(), { 
          type: "sessionEnded" 
        });
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  return (
    <div className="p-4 bg-blue-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {session?.title || "Session en direct"}
        </h1>
        <div className="flex gap-4">
          <span>{isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}</span>
          <span>👥 {connectedStudents} étudiant(s)</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-96 bg-black rounded-lg"
            />
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <span className="animate-pulse">⚫</span>
                {formatTime(recordingTime)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        {!recordingFinished ? (
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded" 
            onClick={endSession}
          >
            Terminer la session
          </button>
        ) : (
          <div className="flex gap-4">
            <a 
              href={downloadUrl}
              download={`session-${sessionId}.webm`}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Télécharger l'enregistrement
            </a>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={uploadRecording}
            >
              Sauvegarder sur le serveur
            </button>
            <button 
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => navigate("/live-sessions")}
            >
              Retour aux sessions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}