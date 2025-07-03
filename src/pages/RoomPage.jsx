import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

export const RoomPage = () => {
  const { roomName } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [activePeers, setActivePeers] = useState([]);

  // This ref helps prevent multiple simultaneous offers being created
  // in the `onnegotiationneeded` handler, which can cause state issues.
  const makingOffer = useRef(false);

  const logMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const setupWebRTC = useCallback(async () => {
    logMessage('Setting up WebRTC...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      logMessage('Local stream obtained.');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      logMessage(`Error accessing media devices: ${error}`);
    }
  }, []);

  const createPeerConnection = useCallback((targetSocketId) => {
    logMessage(`Creating RTCPeerConnection for ${targetSocketId}`);
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Google's public STUN server
      ],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        logMessage(`Sending ICE candidate to ${targetSocketId}`);
        socketRef.current?.emit('sendIceCandidate', JSON.stringify(event.candidate), targetSocketId);
      }
    };

    peerConnection.ontrack = (event) => {
      logMessage(`Received remote track from ${targetSocketId}`);
      if (remoteVideoRefs.current[targetSocketId]) {
        remoteVideoRefs.current[targetSocketId].srcObject = event.streams[0];
      } else {
        logMessage(`Warning: remote video ref for ${targetSocketId} not found yet.`);
      }
    };

    // This is crucial for handling re-negotiation (e.g., adding/removing tracks)
    peerConnection.onnegotiationneeded = async () => {
        // Prevent simultaneous offers
        if (makingOffer.current || peerConnection.signalingState !== 'stable') {
            logMessage('Skipping negotiationneeded: already making an offer or not stable.');
            return;
        }

        makingOffer.current = true;
        try {
            logMessage(`Negotiation needed for ${targetSocketId}. Creating offer...`);
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socketRef.current?.emit('sendOffer', JSON.stringify(offer), targetSocketId);
        } catch (error) {
            console.error('Error creating offer:', error);
            logMessage(`Error creating offer: ${error}`);
        } finally {
            makingOffer.current = false;
        }
    };

    // Add local stream tracks to the peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnections.current[targetSocketId] = peerConnection;
    return peerConnection;
  }, []);

  useEffect(() => {
    if (!roomName) return;

    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on('connect', () => {
      logMessage('Socket.IO Connected.');
      socket.emit('joinRoom', roomName);
      setupWebRTC();
    });

    socket.on('userJoined', (connectionId) => {
      logMessage(`User joined: ${connectionId}`);
      setActivePeers((prev) => {
        if (!prev.includes(connectionId)) {
          // When a new user joins, if we're already set up,
          // we should create a PC for them. The `onnegotiationneeded`
          // will fire and send an offer.
          createPeerConnection(connectionId);
          return [...prev, connectionId];
        }
        return prev;
      });
    });

    socket.on('existingUsersInRoom', (existingUsers) => {
      logMessage(`Existing users in room: ${existingUsers.join(', ')}`);
      setActivePeers(existingUsers);
      existingUsers.forEach(userId => {
        // For existing users, create a peer connection.
        // If they are already established, they will send offers or answers.
        createPeerConnection(userId);
      });
    });

    socket.on('userLeft', (connectionId) => {
      logMessage(`User left: ${connectionId}`);
      setActivePeers((prev) => prev.filter((id) => id !== connectionId));
      if (peerConnections.current[connectionId]) {
        peerConnections.current[connectionId].close();
        delete peerConnections.current[connectionId];
      }
    });

    socket.on('receiveOffer', async (offerString, senderSocketId) => {
      logMessage(`Received offer from ${senderSocketId}`);
      const offer = JSON.parse(offerString);
      let peerConnection = peerConnections.current[senderSocketId];

      if (!peerConnection) {
        peerConnection = createPeerConnection(senderSocketId);
      }

      // Crucial: Handle potential "rollback" if we also had an offer pending
      // This is a simplified "polite" peer approach
      if (peerConnection.signalingState !== 'stable' && peerConnection.remoteDescription && offer.type === 'offer') {
          // This is a collision. We are both trying to offer.
          // The "polite" peer (the one with the higher ID, or a designated role)
          // will "rollback" its current offer.
          // For simplicity, let's assume the one who *receives* the offer
          // while already having a local offer should rollback.
          logMessage(`Collision: rolling back own offer to receive ${senderSocketId}'s offer.`);
          await peerConnection.setLocalDescription({ type: 'rollback' }); // This is a non-standard but common way to rollback
          // Or, you might need to recreate the PC for a clean slate,
          // but that's more disruptive.
      }


      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        logMessage(`Set remote offer from ${senderSocketId}. Signaling state: ${peerConnection.signalingState}`);

        // Only create an answer if signalingState is now 'have-remote-offer'
        if (peerConnection.signalingState === 'have-remote-offer') {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            logMessage(`Created and set local answer for ${senderSocketId}. Signaling state: ${peerConnection.signalingState}`);
            socket.emit('sendAnswer', JSON.stringify(answer), senderSocketId);
        } else {
            logMessage(`Not creating answer, signalingState is ${peerConnection.signalingState}`);
        }
      } catch (e) {
          console.error(`Error processing offer from ${senderSocketId}:`, e);
          logMessage(`Error processing offer from ${senderSocketId}: ${e.message}`);
      }
    });

    socket.on('receiveAnswer', async (answerString, senderSocketId) => {
      logMessage(`Received answer from ${senderSocketId}`);
      const answer = JSON.parse(answerString);
      const peerConnection = peerConnections.current[senderSocketId];
      if (peerConnection) {
        try {
          // This check is important for race conditions
          if (peerConnection.signalingState === 'have-local-offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            logMessage(`Set remote answer from ${senderSocketId}. Signaling state: ${peerConnection.signalingState}`);
          } else {
            logMessage(`Skipping setRemoteDescription for answer from ${senderSocketId}, signalingState is ${peerConnection.signalingState}`);
          }
        } catch (e) {
          console.error('Error adding received answer', e);
          logMessage(`Error adding answer: ${e}`);
        }
      }
    });

    socket.on('receiveIceCandidate', async (candidateString, senderSocketId) => {
      logMessage(`Received ICE candidate from ${senderSocketId}`);
      const candidate = JSON.parse(candidateString);
      const peerConnection = peerConnections.current[senderSocketId];
      if (peerConnection) {
        try {
          // ICE candidates can sometimes arrive before SDP, buffer them if needed
          // For simplicity here, we assume SDP is largely set up.
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding received ICE candidate', e);
          logMessage(`Error adding ICE candidate: ${e}`);
        }
      }
    });

    socket.on('disconnect', () => {
      logMessage('Socket.IO Disconnected.');
    });

    socket.on('connect_error', (err) => {
        logMessage(`Socket.IO Connection Error: ${err.message}`);
        console.error('Socket.IO Connection Error:', err);
    });

    return () => {
      logMessage('Disconnecting Socket.IO...');
      Object.values(peerConnections.current).forEach(pc => pc.close());
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      socket.disconnect();
    };
  }, [roomName, setupWebRTC, createPeerConnection]);

  // Effect to create and assign refs for remote video elements
  useEffect(() => {
    activePeers.forEach(peerId => {
      if (!remoteVideoRefs.current[peerId]) {
        remoteVideoRefs.current[peerId] = document.createElement('video');
        remoteVideoRefs.current[peerId].autoplay = true;
        remoteVideoRefs.current[peerId].playsInline = true;
      }
    });
  }, [activePeers]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Video Conference Room: {roomName}</h1>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid gray', padding: '10px' }}>
          <h3>My Video</h3>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '300px', height: '200px', backgroundColor: 'black' }} />
        </div>

        {activePeers.map((peerId) => (
          <div key={peerId} style={{ border: '1px solid gray', padding: '10px' }}>
            <h3>Peer: {peerId.substring(0, 8)}...</h3>
            <video
              ref={(el) => (remoteVideoRefs.current[peerId] = el)}
              autoPlay
              playsInline
              style={{ width: '300px', height: '200px', backgroundColor: 'black' }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Log:</h3>
        <div style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', backgroundColor: '#f9f9f9' }}>
          {messages.map((msg, index) => (
            <p key={index} style={{ margin: '0', fontSize: '0.9em', color: '#555' }}>{msg}</p>
          ))}
        </div>
      </div>
    </div>
  );
};