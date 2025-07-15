import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getData } from '../services/ApiFetch';
import { ArrowLeft } from 'lucide-react';

export default function RecordingViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecording = async () => {
      try {
        const [session] = await getData(`/livesessions/${id}`);
        if (!session || !session.recordingUrl) {
          throw new Error("Enregistrement non trouvé");
        }
        setRecording(session);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'enregistrement:", error);
        setError(error.message);
      }
    };

    fetchRecording();
  }, [id]);

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/live-sessions')}
          className="mt-4 flex items-center text-blue-500"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux sessions
        </button>
      </div>
    );
  }

  if (!recording) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{recording.title}</h1>
        <button
          onClick={() => navigate('/live-sessions')}
          className="flex items-center text-blue-500"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux sessions
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <video
          controls
          className="w-full rounded-lg"
          src={API_BASE_URL+recording.recordingUrl}
        >
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
        
        <div className="mt-4">
          <p className="text-gray-600">
            Date de la session: {new Date(recording.startTime).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
