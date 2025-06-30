
import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const StudentPage = ({ roomId, userId }) => {
    const [connection, setConnection] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null); // Initialisé plus tard
    const streamRef = useRef(null);

    // Initialisation WebRTC
    const initWebRTC = async () => {
        console.log('S: initWebRTC');
        try {
            // Création de la PeerConnection avec configuration ICE
            pcRef.current = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Configuration des gestionnaires d'événements ICE
            pcRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log('S: sending candidate');
                    connection.invoke('SendSignal', roomId, userId, { type: 'candidate', candidate: event.candidate });
                }
            };

            pcRef.current.ontrack = (event) => {
                console.log('S: ontrack', event);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            // Obtenir le flux média local
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            streamRef.current = stream;

            // Afficher le flux local
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Ajouter les tracks locales à la PeerConnection
            stream.getTracks().forEach(track => {
                pcRef.current.addTrack(track, stream);
            });
        } catch (err) {
            console.error("Erreur WebRTC:", err);
            setError(`Erreur d'accès aux médias: ${err.message}`);
        }
    };

    // Gestion des signaux entrants
    const handleSignal = async (senderId, signal) => {
        console.log(`S: Signal from ${senderId}`, signal);
        try {
            if (!pcRef.current) return;

            if (signal.type === 'offer') {
                console.log('S: Setting remote offer');
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                
                console.log('S: Creating answer');
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);
                
                console.log('S: Sending answer');
                connection.invoke('SendSignal', roomId, userId, pcRef.current.localDescription);
            } else if (signal.type === 'candidate') {
                console.log('S: Adding ICE candidate');
                await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        } catch (err) {
            console.error("S: Error processing signal:", err);
        }
    };

    // Connexion SignalR
    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5196/videoconferencehub')
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (pcRef.current) {
                pcRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (connection) {
            console.log('S: Connecting to SignalR...');
            connection.start()
                .then(() => {
                    setIsConnected(true);
                    console.log('S: SignalR connected. Joining room...');
                    return connection.invoke('JoinRoom', roomId, userId, 'student');
                })
                .then(() => initWebRTC())
                .catch(err => {
                    console.error("Erreur de connexion:", err);
                    setError(`Échec de la connexion: ${err.message}`);
                });

            // Configurer les écouteurs d'événements
            connection.on('UserConnected', (id, type) => {
                console.log(`S: User connected: ${id} (${type})`);
                if (type === 'teacher') {
                    setTeacher({ id });
                }
            });

            connection.on('UserDisconnected', (id, type) => {
                console.log(`S: User disconnected: ${id} (${type})`);
                if (type === 'teacher') {
                    setTeacher(null);
                    setError("Le professeur a quitté la session");
                }
            });

            connection.on('ReceiveSignal', handleSignal);

            connection.on('ReceiveMessage', (message) => {
                setMessages(prev => [...prev, message]);
            });

            connection.on('SessionEnded', () => {
                setError("Le professeur a terminé la session");
            });
        }
    }, [connection, roomId, userId]);
    const sendMessage = () => {
        if (messageInput.trim() && connection) {
            connection.invoke('SendMessage', roomId, userId, 'Étudiant', messageInput)
                .catch(err => console.error(err));
            setMessageInput('');
        }
    };

    const leaveSession = () => {
        if (connection) {
            connection.invoke('LeaveRoom', roomId, userId, 'student')
                .then(() => window.location.reload())
                .catch(err => console.error(err));
        }
    };

    if (error) {
        return (
            <div className="error-container">
                <h2>Erreur</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retour</button>
            </div>
        );
    }

    if (!isConnected) {
        return <div className="loading">Connexion en cours...</div>;
    }

    return (
        <div className="student-container">
            <header>
                <h1>Salle: {roomId} (Étudiant: {userId})</h1>
                <button className="leave-button" onClick={leaveSession}>Quitter la session</button>
            </header>

            <div className="video-section">
                <div className="video-container">
                    <h3>Votre caméra</h3>
                    <video ref={localVideoRef} autoPlay muted playsInline />
                </div>
                <div className="video-container">
                    <h3>Professeur {teacher ? '(Connecté)' : '(Non connecté)'}</h3>
                    <video ref={remoteVideoRef} autoPlay playsInline />
                </div>
            </div>

            <div className="chat-section">
                <h3>Discussion</h3>
                <div className="messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`message ${msg.SenderId === userId ? 'sent' : 'received'}`}>
                            <strong>{msg.SenderName}:</strong> {msg.Content}
                            <span className="time">{msg.Timestamp}</span>
                        </div>
                    ))}
                </div>
                <div className="message-input">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Écrivez votre message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage}>Envoyer</button>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;