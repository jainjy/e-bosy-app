import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  PlayIcon,
  PlusIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const LiveSessionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const isTeacher = user?.role === "enseignant";

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Formater l'heure pour l'affichage
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Simuler la récupération des sessions depuis l'API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Simulation de données basées sur le rôle
        const mockSessions = [
          {
            id: "session1",
            course_id: 1,
            title: "Session JavaScript Avancé",
            start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            host_id: 2,
            video_url: "",
            attendees_ids: isTeacher ? [1, 3, 4] : [user.id],
            recording_url: "",
            course_title: "JavaScript Avancé",
            host_name: "Prof. Dupont",
            status: "scheduled",
          },
          {
            id: "session2",
            course_id: 3,
            title: "Révision Vue.js",
            start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
            host_id: 2,
            video_url: "https://example.com/recording123",
            attendees_ids: isTeacher ? [1, 3, 4, 5] : [user.id],
            recording_url: "https://example.com/recording123",
            course_title: "Vue.js pour Débutants",
            host_name: "Prof. Martin",
            status: "completed",
          },
          {
            id: "session3",
            course_id: 2,
            title: "Introduction à React",
            start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
            host_id: 2,
            video_url: "",
            attendees_ids: isTeacher ? [] : [user.id],
            recording_url: "",
            course_title: "React Frontend Masterclass",
            host_name: "Prof. Martin",
            status: "scheduled",
          },
        ];

        // Filtrer les sessions pour l'étudiant (seulement celles où il est inscrit)
        if (!isTeacher) {
          const studentSessions = mockSessions.filter((session) =>
            session.attendees_ids.includes(user.id)
          );
          setSessions(studentSessions);
        } else {
          setSessions(mockSessions);
        }
      } catch (error) {
        console.error("Erreur de chargement des sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, isTeacher]);

  // Fonction pour commencer une session (enseignant)
  const startSession = (sessionId) => {
    navigate(`/live-session/${sessionId}`);
  };

  // Fonction pour planifier une session (enseignant)
  const scheduleSession = () => {
    navigate("/dashboard/live-sessions/schedule");
  };

  // Fonction pour rejoindre une session (étudiant)
  const joinSession = (sessionId) => {
    navigate(`/live-session/${sessionId}`);
  };

  // Fonction pour accepter une invitation (étudiant)
  const acceptInvitation = (sessionId) => {
    // Simulation de mise à jour API
    setSessions(
      sessions.map((session) =>
        session.id === sessionId
          ? { ...session, attendees_ids: [...session.attendees_ids, user.id] }
          : session
      )
    );
  };

  // Fonction pour refuser une invitation (étudiant)
  const declineInvitation = (sessionId) => {
    // Simulation de mise à jour API
    setSessions(sessions.filter((session) => session.id !== sessionId));
  };

  // Filtrer les sessions selon l'onglet sélectionné
  const filteredSessions = sessions.filter((session) => {
    const now = new Date();
    const startTime = new Date(session.start_time);
    
    if (filter === "upcoming") {
      return startTime > now;
    } else if (filter === "past") {
      return startTime <= now;
    }
    return true;
  });

  // Déterminer si une session peut être rejointe
  const canJoinSession = (session) => {
    const now = new Date();
    const startTime = new Date(session.start_time);
    const endTime = new Date(session.end_time);
    return now >= startTime && now <= endTime;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Sessions en Direct
            </h1>
            <p className="text-gray-600 mt-2">
              {isTeacher
                ? "Gérez vos sessions de cours en direct"
                : "Rejoignez vos sessions programmées"}
            </p>
          </div>
          
          {isTeacher && (
            <button
              onClick={scheduleSession}
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Planifier une session
            </button>
          )}
        </div>

        {/* Onglets de filtrage */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium ${
              filter === "upcoming"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setFilter("upcoming")}
          >
            À venir
          </button>
          <button
            className={`py-3 px-6 font-medium ${
              filter === "past"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setFilter("past")}
          >
            Passées
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
              <VideoCameraIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucune session {filter === "upcoming" ? "à venir" : "passée"}
            </h3>
            <p className="mt-1 text-gray-500">
              {isTeacher
                ? "Planifiez votre première session en direct"
                : "Vous n'avez aucune session programmée"}
            </p>
            {isTeacher && (
              <button
                onClick={scheduleSession}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
              >
                Planifier une session
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {session.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {session.course_title}
                      </p>
                    </div>
                    {!isTeacher && !session.attendees_ids.includes(user.id) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Invitation
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatDate(session.start_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {formatTime(session.start_time)} -{" "}
                        {formatTime(session.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {session.attendees_ids.length} participant
                        {session.attendees_ids.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    {isTeacher ? (
                      <div className="flex space-x-3">
                        {filter === "upcoming" && (
                          <button
                            onClick={() => startSession(session.id)}
                            disabled={!canJoinSession(session)}
                            className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                              canJoinSession(session)
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Commencer
                          </button>
                        )}
                        {filter === "past" && session.recording_url && (
                          <a
                            href={session.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            Voir l'enregistrement
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {session.attendees_ids.includes(user.id) ? (
                          canJoinSession(session) ? (
                            <button
                              onClick={() => joinSession(session.id)}
                              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                            >
                              <PlayIcon className="h-4 w-4 mr-1" />
                              Rejoindre la session
                            </button>
                          ) : filter === "past" && session.recording_url ? (
                            <a
                              href={session.recording_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <ArrowPathIcon className="h-4 w-4 mr-1" />
                              Voir l'enregistrement
                            </a>
                          ) : (
                            <span className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-100 text-gray-400">
                              Session terminée
                            </span>
                          )
                        ) : (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => acceptInvitation(session.id)}
                              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Accepter
                            </button>
                            <button
                              onClick={() => declineInvitation(session.id)}
                              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSessionsPage;