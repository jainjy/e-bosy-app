import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";

const StudentPage = () => {
  const [connection, setConnection] = useState(null);
  const peerRef = useRef(null);
  const videoRef = useRef();

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/hub/conference")
      .withAutomaticReconnect()
      .build();

    conn.start().then(() => {
      setConnection(conn);

      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
      });

      peerRef.current = peer;

      peer.on("signal", (data) => {
        conn.invoke("SendSignal", conn.connectionId, data);
      });

      peer.on("stream", (stream) => {
        videoRef.current.srcObject = stream;
      });

      conn.on("ReceiveSignal", (user, signal) => {
        try {
          peer.signal(signal);
        } catch (err) {
          console.error("Erreur lors du signal côté étudiant :", err.message);
        }
      });
    });

    return () => {
      conn?.stop();
      peerRef.current?.destroy();
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Étudiant - Conférence</h1>
      <video ref={videoRef} autoPlay className="w-full max-w-xl mt-4 rounded-xl" />
    </div>
  );
};

export default StudentPage;
