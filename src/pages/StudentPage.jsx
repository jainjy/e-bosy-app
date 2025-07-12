import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import { Video, VideoOff, Volume2, VolumeX, Users, LogOut } from "lucide-react";

export default function StudentPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [connectedStudents, setConnectedStudents] = useState(0);

  const connRef = useRef(null);
  const peerRef = useRef(null);
  const videoRef = useRef();
  const retryCountRef = useRef(0);

  useEffect(() => {
    const setupConnection = async () => {
      const conn = new HubConnectionBuilder()
        .withUrl("http://localhost:5000/hub/conference")
        .withAutomaticReconnect()
        .build();
      
      connRef.current = conn;

      conn.on("UserJoined", () => setConnectedStudents(c => c + 1));
      conn.on("UserLeft", () => setConnectedStudents(c => Math.max(0, c - 1)));

      conn.on("ReceiveSignal", (_, signal) => {
        const peer = peerRef.current;
        if (!peer || peer.destroyed || peer.connected) return;
        
        try {
          peer.signal(signal);
        } catch (err) {
          console.error("Erreur signal étudiant:", err.message);
        }
      });

      try {
        await conn.start();
        await conn.invoke("RegisterAsStudent");
        setIsConnected(true);

        const peer = new SimplePeer({ 
          initiator: false, 
          trickle: false,
          reconnectTimer: 5000
        });
        
        peerRef.current = peer;

        peer.on("signal", data => {
          conn.invoke("SendSignal", conn.connectionId, data);
        });

        peer.on("stream", stream => {
          if (!videoRef.current) return;
          
          // Vérifier si le stream est déjà attaché
          if (videoRef.current.srcObject !== stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = isMuted;
            
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(e => {
                console.warn("Play refusé:", e.message);
              });
            };
            
            setIsVideoLoaded(true);
            retryCountRef.current = 0;
          }
        });

        peer.on("error", err => {
          console.error("Peer error:", err);
          if (retryCountRef.current < 3) {
            retryCountRef.current += 1;
            setTimeout(() => {
              if (peerRef.current && !peerRef.current.destroyed) {
                peerRef.current.destroy();
              }
              peerRef.current = new SimplePeer({ initiator: false, trickle: false });
            }, 1000 * retryCountRef.current);
          }
        });

        peer.on("close", () => {
          console.log("Peer connection closed");
          setIsVideoLoaded(false);
        });

      } catch (err) {
        console.error("Erreur de connexion:", err);
      }
    };

    setupConnection();

    return () => {
      const peer = peerRef.current;
      if (peer && !peer.destroyed) {
        peer.destroy();
      }
      connRef.current?.stop();
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(m => {
      const next = !m;
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      return next;
    });
  };

  return (
    <div className="p-4 bg-purple-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Étudiant – Conférence</h1>
        <div className="flex gap-4">
          <span>{isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}</span>
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

      <button 
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded" 
        onClick={() => connRef.current?.stop()}
      >
        Quitter
      </button>
    </div>
  );
}