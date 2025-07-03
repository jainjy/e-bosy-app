import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import { toast } from "react-toastify";
import VideoPlayerLive from "../components/VideoPlayerLive";
import ConnectionStatus from "../components/ConnectionStatus";
import "../test.css";

const TeacherPage = () => {
  const [roomId, setRoomId] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [localStream, setLocalStream] = useState(null);
  const [students, setStudents] = useState([]);
  const connectionRef = useRef();
  const peersRef = useRef({});

  const navigate = useNavigate();

  useEffect(() => {
    const generatedId = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    setRoomId(generatedId);

    const initStream = async () => {
      try {
        setConnectionStatus("connecting");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, frameRate: 30 },
          audio: true,
        });

        setLocalStream(stream);

        const conn = new HubConnectionBuilder()
          .withUrl(
            import.meta.env.VITE_SIGNALR_URL || "http://localhost:5000/livehub"
          )
          .withAutomaticReconnect()
          .build();

        await conn.start();
        await conn.invoke("StartStream", generatedId);
        setConnectionStatus("connected");

        conn.on("StudentJoined", (studentId, studentConnectionId) => {
          setStudents((prev) => [...prev, studentId]);

          const peer = new SimplePeer({
            initiator: true,
            stream: stream,
            config: { 
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { 
                    urls: 'turn:numb.viagenie.ca',
                    username: 'email@example.com',
                    credential: 'password'
                }
              ] 
            },
          });

          peer.on("signal", (data) => {
            conn.invoke("SendSignal", JSON.stringify(data), studentId);
          });

          peer.on("error", (err) => {
            toast.error(`Erreur avec ${studentId}: ${err.message}`);
          });

          peersRef.current[studentConnectionId] = peer;
        });

        conn.on("ReceiveSignal", (signal, studentConnectionId) => {
          const peer = peersRef.current[studentConnectionId];
          if (peer) {
            peer.signal(JSON.parse(signal));
          }
        });

        conn.on("StreamEnded", () => {
          toast.info("Un étudiant s'est déconnecté");
        });

        connectionRef.current = conn;

        toast.success(`Salle créée: ${generatedId}`);
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
        toast.error(`Erreur: ${error.message}`);
        setConnectionStatus("disconnected");
      }
    };

    initStream();

    return () => {
      connectionRef.current?.stop();
      localStream?.getTracks().forEach((track) => track.stop());
      Object.values(peersRef.current).forEach((peer) => peer.destroy());
    };
  }, []);

  const endSession = () => {
    if (connectionRef.current) {
      connectionRef.current.stop();
    }
    localStream?.getTracks().forEach((track) => track.stop());
    navigate("/");
  };

  return (
    <div className="teacher-container">
      <div className="header">
        <h1>Session Enseignant</h1>
        <div className="room-info">
          <span>ID de salle: {roomId}</span>
          <ConnectionStatus status={connectionStatus} />
          <button onClick={endSession} className="end-btn">
            Terminer la session
          </button>
        </div>
      </div>

      <div className="content">
        <div className="teacher-video">
          <VideoPlayerLive
            stream={localStream}
            isLocal={true}
            title="Votre diffusion"
          />
        </div>

        <div className="students-list">
          <h2>Étudiants connectés ({students.length})</h2>
          <ul>
            {students.map((student) => (
              <li key={student}>{student}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
