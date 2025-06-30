
import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const TeacherPage = ({ roomId, userId }) => {
    const [connection, setConnection] = useState(null);
    const [students, setStudents] = useState([]);
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
        console.log('T: initWebRTC');
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
                    console.log('T: sending candidate');
                    connection.invoke('SendSignal', roomId, userId, { type: 'candidate', candidate: event.candidate });
                }
            };

            pcRef.current.ontrack = (event) => {
                console.log('T: ontrack', event);
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

            // Créer une offre et l'envoyer
            console.log('T: Creating offer...');
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);
            
            console.log('T: Sending offer');
            connection.invoke('SendSignal', roomId, userId, pcRef.current.localDescription);
        } catch (err) {
            console.error("Erreur WebRTC:", err);
            setError(`Erreur d'accès aux médias: ${err.message}`);
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
            console.log('T: Connecting to SignalR...');
            connection.start()
                .then(() => {
                    setIsConnected(true);
                    console.log('T: SignalR connected. Joining room...');
                    return connection.invoke('JoinRoom', roomId, userId, 'teacher');
                })
                .then(() => initWebRTC())
                .catch(err => {
                    console.error("Erreur de connexion:", err);
                    setError(`Échec de la connexion: ${err.message}`);
                });

            // Configurer les écouteurs d'événements
            connection.on('UserConnected', (id, type) => {
                console.log(`T: User connected: ${id} (${type})`);
                if (type === 'student') {
                    setStudents(prev => [...prev, { id }]);
                }
            });

            connection.on('UserDisconnected', (id, type) => {
                if (type === 'student') {
                    setStudents(prev => prev.filter(s => s.id !== id));
                }
            });

            connection.on('ReceiveSignal', async (senderId, signal) => {
                console.log(`T: Signal from ${senderId}`, signal);
                try {
                    if (!pcRef.current) return;

                    if (signal.type === 'answer') {
                        console.log('T: Setting remote answer');
                        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                    } else if (signal.type === 'candidate') {
                        console.log('T: Adding ICE candidate');
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    }
                } catch (err) {
                    console.error("T: Error processing signal:", err);
                }
            });

            connection.on('ReceiveMessage', (message) => {
                setMessages(prev => [...prev, message]);
            });
        }
    }, [connection, roomId, userId]);

    const sendMessage = () => {
        if (messageInput.trim() && connection) {
            connection.invoke('SendMessage', roomId, userId, 'Professeur', messageInput)
                .catch(err => console.error(err));
            setMessageInput('');
        }
    };

    const endSession = () => {
        if (connection) {
            connection.invoke('LeaveRoom', roomId, userId, 'teacher')
                .then(() => window.location.reload())
                .catch(err => console.error(err));
        }
    };

    if (error) {
        return (
            <div className="error-container">
                <h2>Erreur</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Réessayer</button>
            </div>
        );
    }

    if (!isConnected) {
        return <div className="loading">Connexion en cours...</div>;
    }

    return (
        <div className="teacher-container">
            <header>
                <h1>Salle: {roomId} (Professeur: {userId})</h1>
                <button className="end-button" onClick={endSession}>Terminer la session</button>
            </header>

            <div className="video-section">
                <div className="video-container">
                    <h3>Votre caméra</h3>
                    <video ref={localVideoRef} autoPlay muted playsInline />
                </div>
                <div className="video-container">
                    <h3>Étudiant</h3>
                    <video ref={remoteVideoRef} autoPlay playsInline />
                </div>
            </div>

            <div className="students-section">
                <h3>Étudiants connectés ({students.length})</h3>
                <ul>
                    {students.map(student => (
                        <li key={student.id}>{student.id}</li>
                    ))}
                </ul>
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

export default TeacherPage;