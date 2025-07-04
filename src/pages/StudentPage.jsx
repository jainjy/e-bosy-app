import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import {
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Users,
  LogOut,
} from "lucide-react";
// … import identiques

export default function StudentPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [connectedStudents, setConnectedStudents] = useState(0);

  const connRef = useRef(null);
  const peerRef = useRef(null);
  const videoRef = useRef();

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/hub/conference")
      .withAutomaticReconnect()
      .build();
    connRef.current = conn;

    conn.on("UserJoined", () => setConnectedStudents((c) => c + 1));
    conn.on("UserLeft", () => setConnectedStudents((c) => Math.max(0, c - 1)));

    conn.on("ReceiveSignal", (_, signal) => {
      const peer = peerRef.current;
      if (!peer || peer.destroyed || peer.connected) return;
      peer.signal(signal);
    });

    conn.start()
      .then(() => {
        setIsConnected(true);

        const peer = new SimplePeer({ initiator: false, trickle: false });
        peerRef.current = peer;

        peer.on("signal", (data) =>
          conn.invoke("SendSignal", conn.connectionId, data)
        );

        peer.on("stream", (stream) => {
          console.log("Stream reçu :", stream);
console.log("Pistes audio :", stream.getAudioTracks());

          const vid = videoRef.current;
          // Assignation unique
          if (!vid.srcObject) {
            vid.srcObject = stream;
            vid.muted = isMuted;
            vid.playsInline = true;
            vid.play().catch(e =>
              console.warn("Play refusé :", e.message)
            );
          }
          setIsVideoLoaded(true);
        });
      })
      .catch(err => {
        console.warn("SignalR start aborted (normal lors d'un reload):", err);
      });

    return () => {
      const peer = peerRef.current;
      if (peer && !peer.destroyed) peer.destroy();
      conn.stop();
    };
  }, []); // <- vide

  const toggleMute = () => {
    setIsMuted((m) => {
      const next = !m;
      const vid = videoRef.current;
      if (vid) {
        vid.muted = next;
        // relancer play() seulement si nécessaire
        if (!vid.paused) {
          vid.play().catch(e =>
            console.warn("Play refusé après unmute :", e.message)
          );
        }
      }
      return next;
    });
  };

  
  return (
    <div className="p-4 bg-purple-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Étudiant – Conférence</h1>
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
            muted={isMuted}
            playsInline
            className="w-full h-96 bg-black rounded-lg"
          />
          {!isVideoLoaded && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
              En attente du prof...
            </div>
          )}
          {isVideoLoaded && (
            <button
              onClick={toggleMute}
              className="absolute bottom-4 left-4 bg-zinc-200 bg-opacity-50 p-2 rounded-full"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}
        </div>
      </div>

      <button className="mt-6 bg-red-500 text-white px-4 py-2 rounded" onClick={() => connRef.current?.stop()}>
        Quitter
      </button>
    </div>
  );

}


