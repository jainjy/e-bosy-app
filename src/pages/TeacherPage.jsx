import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import { Video, VideoOff, Users, Power } from "lucide-react";

export default function TeacherPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedStudents, setConnectedStudents] = useState(0);

  const connRef = useRef(null);
  const peerRef = useRef(null);
  const videoRef = useRef();
  const streamRef = useRef();
  const lastSignalRef = useRef(null);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/hub/conference")
      .withAutomaticReconnect()
      .build();
    connRef.current = conn;

    conn.on("UserJoined", (id) => {
      setConnectedStudents((c) => c + 1);
      // Réémission de l'offre si besoin
      const offer = lastSignalRef.current;
      if (offer) conn.invoke("SendSignal", conn.connectionId, offer);
    });
    conn.on("UserLeft", () => setConnectedStudents((c) => Math.max(0, c - 1)));

    conn.on("ReceiveSignal", (_, signal) => {
      const peer = peerRef.current;
      if (!peer || peer.destroyed || peer.connected) return;
      try {
        peer.signal(signal);
      } catch (err) {
        console.error("Erreur signal prof :", err.message);
      }
    });

    conn.start().then(() => {
      setIsConnected(true);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true; // ← just for DOM, ne bloque pas l'audio WebRTC
          
          streamRef.current = stream;

          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
          });
          peerRef.current = peer;

          peer.on("signal", (data) => {
            lastSignalRef.current = data;
            conn.invoke("SendSignal", conn.connectionId, data);
          });
        });
    })  .catch(err => {
      console.warn("SignalR start aborted (normal lors d'un reload):", err);
    });;

    return () => {
      const peer = peerRef.current;
      if (peer && !peer.destroyed) peer.destroy();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      conn.stop();
    };
  }, []);

  return (
    <div className="p-4 bg-blue-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prof – Conférence</h1>
        <div className="flex gap-4">
          <span>
            {isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}
          </span>
          <span>👥 {connectedStudents}</span>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="relative">
        <video
  ref={videoRef}
  autoPlay
  playsInline
  className="w-full h-96 bg-black rounded-lg"
/>

        </div>
      </div>

      <button className="mt-6 bg-red-500 text-white px-4 py-2 rounded" onClick={() => connRef.current?.stop()}>
        Terminer
      </button>
    </div>
  );
}
