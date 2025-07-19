import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import { Video, VideoOff, Users, Power, Download, Upload, ArrowLeft, Mic, MicOff, ScreenShare } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getData, postData } from "../services/ApiFetch";
import Chat from "../components/Chat";

export default function TeacherPage() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedStudents, setConnectedStudents] = useState(0);
  const [session, setSession] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const connRef = useRef(null);
  const peersRef = useRef({});
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const screenStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const drawIntervalRef = useRef(null);

  // Initialisation de la session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        
        const [session] = await getData(`/livesessions/${sessionId}`);
        if(session.status=="completed"){
          navigate("/live-sessions");
          return;
        }
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

  // Connexion SignalR et gestion des pairs
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
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().then(() => {
            startDrawing(videoRef.current);
            startRecording();
          }).catch(err => console.error("Error playing video:", err));
        }
        streamRef.current = stream;

        conn.on("UserJoined", (userId, isTeacher, userName) => {
          if (!isTeacher) {
            setConnectedStudents(prev => prev + 1);
            createPeer(userId);
          }
          setParticipants(prev => [...prev, { userId, userName, isTeacher }]);
        });

        conn.on("UserLeft", (userId, isTeacher) => {
          if (!isTeacher) {
            setConnectedStudents(prev => Math.max(0, prev - 1));
            removePeer(userId);
          }
          setParticipants(prev => prev.filter(p => p.userId !== userId));
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

        conn.on("ParticipantsList", (participantsList) => {
          setParticipants(participantsList.map(p => ({ userId: p.Item1, userName: p.Item2, isTeacher: p.Item3 })));
        });

      } catch (err) {
        console.error("Connection error:", err);
      }
    };

    setupConnection();

    return () => {
      stopRecording();
      stopDrawing();
      Object.values(peersRef.current).forEach(peer => {
        if (!peer.destroyed) peer.destroy();
      });
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (connRef.current) {
        connRef.current.stop().catch(console.error);
      }
    };
  }, [sessionId, user?.userId]);

  // Gestion du timer d'enregistrement
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        if (connRef.current?.state === "Connected") {
          connRef.current.invoke("SendTimer", recordingTime);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, recordingTime]);

  // Démarrer le rendu canvas
  const startDrawing = (videoElement) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawIntervalRef.current = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }, 1000 / 30); // 30 FPS
  };

  // Arrêter le rendu canvas
  const stopDrawing = () => {
    if (drawIntervalRef.current) {
      clearInterval(drawIntervalRef.current);
    }
  };

  // Démarrer l'enregistrement
  const startRecording = () => {
    const canvasStream = canvasRef.current.captureStream(30);
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }

    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType: "video/webm;codecs=vp9,opus",
      videoBitsPerSecond: 5_000_000,
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setRecordedBlob(blob);
      setDownloadUrl(URL.createObjectURL(blob));
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  // Créer un pair WebRTC
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
  };

  // Supprimer un pair WebRTC
  const removePeer = (studentId) => {
    const peer = peersRef.current[studentId];
    if (peer && !peer.destroyed) {
      peer.destroy();
    }
    delete peersRef.current[studentId];
  };

  // Basculer l'audio
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Basculer la vidéo
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Basculer le partage d'écran
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        });
        
        screenStreamRef.current = screenStream;
        stopDrawing();
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
          videoRef.current.play().then(() => {
            startDrawing(videoRef.current);
          }).catch(err => console.error("Error playing screen:", err));
        }
        
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender && screenStream.getVideoTracks().length > 0) {
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });
      } else {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }, 
          audio: true 
        });
        
        stopDrawing();
        if (videoRef.current) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.play().then(() => {
            startDrawing(videoRef.current);
          }).catch(err => console.error("Error playing camera:", err));
        }
        
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender && cameraStream.getVideoTracks().length > 0) {
            sender.replaceTrack(cameraStream.getVideoTracks()[0]);
          }
        });
        
        streamRef.current = cameraStream;
        
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
      }
      
      setIsScreenSharing(!isScreenSharing);
    } catch (err) {
      console.error("Error toggling screen share:", err);
    }
  };

  // Formater le temps
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Terminer la session
  const endSession = async () => {
    try {
      stopRecording();
      stopDrawing();
      
      await postData(`/livesessions/${sessionId}/end`);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (connRef.current) {
        await connRef.current.invoke("SendSignal", user.userId.toString(), { 
          type: "sessionEnded" 
        });
      }
      
      setSessionEnded(true);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  // Téléverser l'enregistrement
  const uploadRecording = async () => {
    try {
      if (!recordedBlob) {
        throw new Error("No recording available");
      }

      const file = new File([recordedBlob], `session-${sessionId}.webm`, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('recordingFile', file);
      const apiResponse = await postData(`livesessions/${sessionId}/upload-recording`, formData, true);
      if (!apiResponse.ok) {
        throw new Error(`Erreur HTTP: ${apiResponse.status}`);
      }
      alert('Enregistrement téléversé avec succès');
      navigate("/live-sessions");
    } catch (error) {
      console.error('Erreur lors du téléversement:', error);
      alert('Erreur lors du téléversement de l\'enregistrement');
    }
  };
 // Ajouter un état pour le chat
 const [activeTab, setActiveTab] = useState('chat');

 // Modifier le return pour la nouvelle interface
 return (
   <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
     <canvas ref={canvasRef} width={1280} height={720} className="hidden" />
     
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
       {/* Header amélioré */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate("/live-sessions")}
             className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
           >
             <ArrowLeft className="w-5 h-5 text-gray-700" />
           </button>
           <div>
             <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
               {session?.title || "Session en direct"}
             </h1>
             <div className="flex items-center gap-2 mt-1">
               <span className="text-sm text-gray-600">ID: {sessionId}</span>
               <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                 Enseignant
               </span>
             </div>
           </div>
         </div>
         
         <div className="flex flex-wrap gap-3">
           <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
             <div className={`w-2.5 h-2.5 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
             <span className="text-sm font-medium text-gray-700">
               {isConnected ? "Connecté" : "Déconnecté"}
             </span>
           </div>
           
           <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
             <Users className="w-4 h-4 mr-2 text-blue-600" />
             <span className="text-sm font-medium text-gray-700">
               {connectedStudents} étudiant(s)
             </span>
           </div>

           {isRecording && (
             <div className="flex items-center bg-red-100 px-4 py-2 rounded-xl shadow-sm border border-red-200">
               <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-red-600 mr-2"></span>
               <span className="text-sm font-medium text-red-800">
                 {formatTime(recordingTime)}
               </span>
             </div>
           )}
         </div>
       </div>

       {/* Contenu principal */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Vidéo principale */}
         <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
           <div className="relative bg-gray-900 aspect-video">
             <video
               ref={videoRef}
               autoPlay
               playsInline
               className="w-full h-full object-cover"
             />
             
             {/* Contrôles flottants */}
             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
               <button
                 onClick={toggleAudio}
                 className={`p-2.5 rounded-full ${isAudioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white transition-colors shadow-md`}
                 title={isAudioEnabled ? "Désactiver l'audio" : "Activer l'audio"}
               >
                 {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
               </button>
               <button
                 onClick={toggleVideo}
                 className={`p-2.5 rounded-full ${isVideoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white transition-colors shadow-md`}
                 title={isVideoEnabled ? "Désactiver la vidéo" : "Activer la vidéo"}
               >
                 {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
               </button>
               <button
                 onClick={toggleScreenShare}
                 className={`p-2.5 rounded-full ${isScreenSharing ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white transition-colors shadow-md`}
                 title={isScreenSharing ? "Arrêter le partage" : "Partager l'écran"}
               >
                 <ScreenShare className="w-5 h-5" />
               </button>
             </div>
           </div>

           {/* Bouton principal */}
           <div className="p-4 border-t border-gray-200 flex justify-center">
             {!sessionEnded ? (
               <button
                 onClick={endSession}
                 className="flex items-center justify-center px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
               >
                 <Power className="w-5 h-5 mr-2" />
                 Terminer la session
               </button>
             ) : (
               <div className="flex flex-wrap justify-center gap-3 w-full">
                 <a
                   href={downloadUrl}
                   download={`session-${sessionId}.webm`}
                   className="flex items-center justify-center px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md"
                 >
                   <Download className="w-5 h-5 mr-2" />
                   Télécharger
                 </a>
                 
                 <button
                   onClick={uploadRecording}
                   className="flex items-center justify-center px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                 >
                   <Upload className="w-5 h-5 mr-2" />
                   Sauvegarder
                 </button>
               </div>
             )}
           </div>
         </div>

         {/* Sidebar avec onglets */}
         <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
           <div className="flex border-b border-gray-200">
             <button
               onClick={() => setActiveTab('chat')}
               className={`flex-1 py-3 font-medium text-sm ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Chat
             </button>
             <button
               onClick={() => setActiveTab('participants')}
               className={`flex-1 py-3 font-medium text-sm ${activeTab === 'participants' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Participants ({participants.length})
             </button>
           </div>

           <div className="h-[500px] overflow-y-auto">
             {activeTab === 'chat' ? (
               <Chat connection={connRef.current} currentUser={user} />
             ) : (
               <div className="p-4">
                 <h3 className="font-medium text-gray-700 mb-3">Liste des participants</h3>
                 <ul className="space-y-3">
                   {participants.map((p) => (
                     <li key={p.userId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                       <div className={`w-2.5 h-2.5 rounded-full ${p.isTeacher ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                       <span className="font-medium text-gray-800">
                         {p.userName} {p.userId === user.userId && "(Vous)"}
                       </span>
                       <span className="text-xs text-gray-500 ml-auto">
                         {p.isTeacher ? 'Enseignant' : 'Étudiant'}
                       </span>
                     </li>
                   ))}
                 </ul>
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}