import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import { Video, VideoOff, Users, Power } from "lucide-react";

export default function TeacherPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedStudents, setConnectedStudents] = useState(0);
  const [peers, setPeers] = useState([]);

  const connRef = useRef(null);
  const peersRef = useRef({});
  const videoRef = useRef();
  const streamRef = useRef();

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/hub/conference")
      .withAutomaticReconnect()
      .build();
    connRef.current = conn;

    conn.on("UserJoined", (id) => {
      setConnectedStudents((c) => c + 1);
      
      // Créer une nouvelle connexion peer pour chaque étudiant
      if (streamRef.current) {
        createPeer(id);
      }
    });

    conn.on("UserLeft", (id) => {
      setConnectedStudents((c) => Math.max(0, c - 1));
      removePeer(id);
    });

    conn.on("ReceiveSignal", (senderId, signal) => {
      const peer = peersRef.current[senderId];
      if (!peer || peer.destroyed || peer.connected) return;
      
      try {
        peer.signal(signal);
      } catch (err) {
        console.error("Erreur signal prof:", err.message);
      }
    });

    const startConnection = async () => {
      try {
        await conn.start();
        await conn.invoke("RegisterAsTeacher");
        setIsConnected(true);

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        streamRef.current = stream;

      } catch (err) {
        console.error("Erreur de connexion:", err);
      }
    };

    startConnection();

    return () => {
      Object.values(peersRef.current).forEach(peer => {
        if (peer && !peer.destroyed) peer.destroy();
      });
      streamRef.current?.getTracks().forEach(t => t.stop());
      conn.stop();
    };
  }, []);

  const createPeer = (studentId) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: streamRef.current,
    });

    peer.on("signal", (data) => {
      connRef.current.invoke("SendSignal", connRef.current.connectionId, data);
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

  return (
    <div className="p-4 bg-blue-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prof – Conférence</h1>
        <div className="flex gap-4">
          <span>{isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}</span>
          <span>👥 {connectedStudents}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-96 bg-black rounded-lg"
          />
        </div>
      </div>

      <button 
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded" 
        onClick={() => connRef.current?.stop()}
      >
        Terminer
      </button>
    </div>
  );
}