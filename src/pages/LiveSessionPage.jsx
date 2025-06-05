import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  VideoCameraSlashIcon,
  ShareIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  PresentationChartBarIcon,
  BookOpenIcon,
  NoSymbolIcon,
  StopCircleIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

const LiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const localStream = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("video");
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  // Démarrer le flux média
  const startLocalStream = async () => {
    try {
      const constraints = {
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Erreur de lecture:", e));
        };
      }
      
      updateTrackStates();
    } catch (err) {
      console.error("Erreur d'accès aux médias:", err);
      alert("Veuillez autoriser l'accès à la caméra et au microphone");
      setIsCameraOff(true);
      setIsMicrophoneMuted(true);
    }
  };

  // Mettre à jour l'état des tracks
  const updateTrackStates = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(track => {
        track.enabled = !isCameraOff;
      });
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = !isMicrophoneMuted;
      });
    }
  };

  // Démarrer l'enregistrement
  const startRecording = async () => {
    if (!localStream.current) {
      alert("Aucun flux média disponible");
      return;
    }

    try {
      recordedChunksRef.current = [];
      setRecordedVideoUrl(null);
      setRecordingTime(0);

      // Options pour un meilleur format d'enregistrement
      const options = { 
        mimeType: 'video/webm;codecs=vp9,opus',
        bitsPerSecond: 2500000 // 2.5 Mbps
      };

      // Fallback si VP9 n'est pas supporté
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8,opus';
        console.warn("VP9 non supporté, utilisation de VP8");
      }

      mediaRecorderRef.current = new MediaRecorder(localStream.current, options);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        
        // Sauvegarde automatique dans le stockage local
        saveToLocalStorage(blob);
      };

      mediaRecorderRef.current.onerror = (e) => {
        console.error("Erreur d'enregistrement:", e.error);
        alert("Une erreur est survenue pendant l'enregistrement");
        setIsRecording(false);
      };

      mediaRecorderRef.current.start(1000); // Collecte des données chaque seconde
      setIsRecording(true);
      
      // Timer pour la durée d'enregistrement
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      alert("Erreur lors du démarrage de l'enregistrement");
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  // Sauvegarder dans le stockage local
  const saveToLocalStorage = (blob) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const videos = JSON.parse(localStorage.getItem('recordedVideos') || []);
        const videoData = {
          id: Date.now(),
          sessionId,
          sessionTitle: session?.title || "Session sans titre",
          date: new Date().toISOString(),
          duration: recordingTime,
          data: reader.result.split(',')[1] // Stocker seulement la partie base64
        };
        
        videos.unshift(videoData); // Ajouter au début du tableau
        localStorage.setItem('recordedVideos', JSON.stringify(videos));
        console.log("Enregistrement sauvegardé localement");
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Erreur de sauvegarde locale:", error);
    }
  };

  // Télécharger la vidéo
  const downloadRecording = () => {
    if (!recordedVideoUrl) return;
    
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `session_${sessionId}_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Uploader vers le serveur (simulation)
  const uploadRecording = async () => {
    if (!recordedVideoUrl || !recordedChunksRef.current.length) return;
    
    setIsUploading(true);
    setUploadStatus("Préparation de l'envoi...");
    setUploadProgress(0);
    
    try {
      // Simulation d'upload progressif
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const totalSize = blob.size;
      let uploaded = 0;
      const chunkSize = 1024 * 1024; // 1MB chunks
      
      // Simuler un upload par morceaux
      for (let start = 0; start < totalSize; start += chunkSize) {
        const chunk = blob.slice(start, start + chunkSize);
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulation de latence
        
        uploaded += chunk.size;
        const progress = Math.min(100, Math.round((uploaded / totalSize) * 100));
        setUploadProgress(progress);
        setUploadStatus(`Envoi en cours... ${progress}%`);
      }
      
      // Simulation de succès
      setUploadStatus("Enregistrement sauvegardé avec succès!");
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("");
      }, 2000);
      
      console.log("Enregistrement uploadé (simulation)");
    } catch (error) {
      console.error("Erreur d'upload:", error);
      setUploadStatus("Échec de l'envoi");
      setIsUploading(false);
    }
  };

  // Nettoyage
  useEffect(() => {
    startLocalStream();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
      clearInterval(recordingIntervalRef.current);
    };
  }, []);

  // Mise à jour des états des tracks
  useEffect(() => {
    updateTrackStates();
  }, [isCameraOff, isMicrophoneMuted]);

  // Chargement des données de session
  useEffect(() => {
    const mockSession = {
      id: sessionId,
      courseTitle: "Advanced JavaScript",
      title: "Live Session: Advanced JavaScript",
      description: "Host a live video session for your students.",
      dateTime: new Date().toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      participantsCount: 12,
      currentParticipants: Array(12).fill(0).map((_, i) => ({
        id: i + 1,
        name: i === 0 ? "Teacher (You)" : `Student ${i}`,
        role: i === 0 ? "Host" : "Student",
        avatar: `https://i.pravatar.cc/40?img=${i + 10}`,
      })),
      shareLink: `${window.location.origin}/join/${sessionId}`,
    };
    setSession(mockSession);
  }, [sessionId]);

  const handleEndSession = () => {
    if (window.confirm("Terminer cette session live?")) {
      stopRecording();
      navigate('/dashboard');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(session?.shareLink || '');
    alert("Lien copié!");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link to="/dashboard/courses" className="flex items-center text-gray-600 hover:underline mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Retour au cours: {session.courseTitle}
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            {session.title} <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
          </h1>
          <div className="flex items-center text-gray-500 text-sm mt-3 space-x-4">
            <span><CalendarDaysIcon className="h-4 w-4 mr-1 inline" /> {session.dateTime}</span>
            <span><ClockIcon className="h-4 w-4 mr-1 inline" /> {session.time}</span>
            <span><UsersIcon className="h-4 w-4 mr-1 inline" /> {session.participantsCount} participants</span>
          </div>
        </div>
        <div className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
          ID: {session.id.substring(0, 8)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone principale */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : 'block'}`}
              />
              
              {isCameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <VideoCameraSlashIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}

              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
                {isRecording && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-3 rounded-full ${isCameraOff ? 'bg-gray-300' : 'bg-purple-600'} text-white`}
                title={isCameraOff ? "Activer la caméra" : "Désactiver la caméra"}
              >
                {isCameraOff ? <VideoCameraSlashIcon className="h-6 w-6" /> : <VideoCameraIcon className="h-6 w-6" />}
              </button>

              <button
                onClick={() => setIsMicrophoneMuted(!isMicrophoneMuted)}
                className={`p-3 rounded-full ${isMicrophoneMuted ? 'bg-gray-300' : 'bg-purple-600'} text-white`}
                title={isMicrophoneMuted ? "Activer le microphone" : "Désactiver le microphone"}
              >
                {isMicrophoneMuted ? (
                  <span className="relative">
                    <MicrophoneIcon className="h-6 w-6" />
                    <NoSymbolIcon className="h-6 w-6 absolute top-0 left-0 text-red-500" />
                  </span>
                ) : (
                  <MicrophoneIcon className="h-6 w-6" />
                )}
              </button>

              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  title="Démarrer l'enregistrement"
                >
                  <VideoCameraIcon className="h-6 w-6" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
                  title="Arrêter l'enregistrement"
                >
                  <StopCircleIcon className="h-6 w-6" />
                </button>
              )}

              <button className="p-3 rounded-full bg-gray-200 hover:bg-gray-300" title="Partager l'écran">
                <ShareIcon className="h-6 w-6" />
              </button>

              <button
                onClick={handleEndSession}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 px-4"
                title="Terminer la session"
              >
                Terminer
              </button>
            </div>

            {/* Section d'enregistrement */}
            {recordedVideoUrl && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Enregistrement terminé</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadRecording}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    Télécharger
                  </button>
                  
                  <button
                    onClick={uploadRecording}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isUploading ? (
                      <>
                        <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-5 w-5" />
                        Sauvegarder
                      </>
                    )}
                  </button>
                </div>
                
                {uploadStatus && (
                  <p className={`mt-2 text-sm text-center ${
                    uploadStatus.includes("Échec") ? "text-red-500" : "text-green-600"
                  }`}>
                    {uploadStatus}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  L'enregistrement a été sauvegardé automatiquement dans votre historique local.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Participants</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {session.currentParticipants.map(p => (
                <div key={p.id} className="flex items-center">
                  <img src={p.avatar} alt={p.name} className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Partager la session</h3>
            <div className="flex mb-4">
              <input
                type="text"
                readOnly
                value={session.shareLink}
                className="flex-grow px-3 py-2 border rounded-l text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="bg-purple-600 text-white px-4 py-2 rounded-r"
                title="Copier le lien"
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-around">
              <button className="flex flex-col items-center p-2 text-sm" title="Inviter des participants">
                <UserPlusIcon className="h-6 w-6 mb-1" />
                Inviter
              </button>
              <button className="flex flex-col items-center p-2 text-sm" title="Paramètres">
                <Cog6ToothIcon className="h-6 w-6 mb-1" />
                Paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionPage;