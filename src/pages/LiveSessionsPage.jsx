import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  VideoCameraIcon,
  PlayIcon,
  PlusIcon,
  ClockIcon,
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import LiveSessionFormModal from "../components/LiveSessionFormModal";
import LiveSessionAttendeesModal from "../components/LiveSessionAttendeesModal";
import { toast } from "react-toastify";
import { getData, postData, putData } from "../services/ApiFetch";
import { API_BASE_URL } from "../services/ApiFetch";

const LiveSessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [selectedLiveSessionId, setSelectedLiveSessionId] = useState(null);
  const navigate = useNavigate();
  const baseUrl = `livesessions`;

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint;
      if (user.role === "administrateur") {
        endpoint = filter === "upcoming" ? `${baseUrl}/upcoming` : `${baseUrl}/past`;
      } else if (user.role === "enseignant") {
        endpoint = filter === "upcoming"
          ? `${baseUrl}/host/${user.userId}`
          : `${baseUrl}/host/${user.userId}?past=true`;
      } else {
        // Pour les étudiants, on combine upcoming et ongoing
        if (filter === "upcoming") {
          const [upcoming, ongoing] = await Promise.all([
            getData(`${baseUrl}/upcoming?attendeeId=${user.userId}&enrolled=true`),
            getData(`${baseUrl}/ongoing?attendeeId=${user.userId}&enrolled=true`)
          ]);
          
          // Fusionner les résultats en excluant les doublons
          const allSessions = [...(upcoming[0] || []), ...(ongoing[0] || [])];
          const uniqueSessions = allSessions.filter(
            (session, index, self) => index === self.findIndex(s => s.liveSessionId === session.liveSessionId)
          );
          
          setSessions(uniqueSessions);
          return;
        } else {
          endpoint = `${baseUrl}/past?attendeeId=${user.userId}&enrolled=true`;
        }
      }
      const [data, error] = await getData(endpoint);
      if (error) throw error;
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Erreur lors du chargement des sessions");
    } finally {
      setLoading(false);
    }
  }, [filter, user, baseUrl]);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSessionStatus = (session) => {
    // Priorité au statut stocké en base
    if (session.status === "completed") return "completed";
    if (session.status === "ongoing") return "ongoing";
    
    // Fallback sur la logique temporelle si pas de statut défini
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    
    if (now >= start && now <= end) return "ongoing";
    if (now > end) return "completed";
    return "scheduled";
  };

  const canJoin = (session) => {
    return getSessionStatus(session) === "ongoing";
  };

  const canManageSession = (session) => {
    return user.role === "administrateur" ||
           (user.role === "enseignant" && user.userId === session.hostId);
  };

  const canEditSession = (session) => {
    return getSessionStatus(session) === "scheduled";
  };

  const handleOpenModal = (session = null) => {
    if (session && !canEditSession(session)) {
      toast.warn("Vous ne pouvez pas modifier une session passée ou en cours.");
      return;
    }
    setEditingSession(session);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSession(null);
  };

  const handleSaveSession = async (sessionData) => {
    try {
      await fetchSessions();
      toast.success(
        `Session ${editingSession ? "mise à jour" : "créée"} avec succès`
      );
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error(
        `Erreur lors de la ${
          editingSession ? "mise à jour" : "création"
        } de la session`
      );
    }
  };

  const handleDeleteSession = async (liveSessionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      try {
        const [data, error] = await postData(`${baseUrl}/${liveSessionId}/delete`);
        if (error) throw error;
        await fetchSessions();
        toast.success("Session supprimée avec succès");
      } catch (error) {
        console.error("Error deleting session:", error);
        toast.error("Erreur lors de la suppression de la session");
      }
    }
  };

  const handleViewAttendees = async (liveSessionId) => {
    setSelectedLiveSessionId(liveSessionId);
    try {
      const [data, error] = await getData(`${API_BASE_URL}/api/livesessions/${liveSessionId}/attendees`);
      if (error) {
        throw error;
      }
      setAttendees(data);
      setShowAttendeesModal(true);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      toast.error("Erreur lors du chargement des participants");
    }
  };

  const handleCloseAttendeesModal = () => {
    setShowAttendeesModal(false);
    setAttendees([]);
    setSelectedLiveSessionId(null);
  };

  const handleStartSession = async (liveSessionId) => {
    try {
      const [sessionData, error] = await postData(`${baseUrl}/${liveSessionId}/start`);
      if (error) throw error;
      await fetchSessions();
      navigate(`/live-session/${liveSessionId}`);
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Erreur lors du démarrage de la session");
    }
  };

  const handleEndSession = async (liveSessionId) => {
    try {
      const [sessionData, error] = await postData(`${baseUrl}/${liveSessionId}/end`);
      if (error) throw error;
      await fetchSessions();
      toast.success("Session terminée avec succès");
    } catch (error) {
      console.error("Error ending session:", error);
      toast.error("Erreur lors de la fin de la session");
    }
  };

  const handleJoinSession = async (liveSessionId) => {
    try {
      const [result, error] = await postData(`${baseUrl}/${liveSessionId}/attendees`);
      if (error) throw error;
      navigate(`/student/live-session/${liveSessionId}`);
    } catch (error) {
      console.error("Error joining session:", error);
      toast.error("Erreur lors de la tentative de rejoindre la session");
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      scheduled: {
        color: "bg-blue-100 text-blue-800",
        icon: <ClockIcon className="h-4 w-4 mr-1" />,
        text: "Planifiée"
      },
      ongoing: {
        color: "bg-green-100 text-green-800",
        icon: <PlayIcon className="h-4 w-4 mr-1" />,
        text: "En cours"
      },
      completed: {
        color: "bg-purple-100 text-purple-800",
        icon: <CheckCircleIcon className="h-4 w-4 mr-1" />,
        text: "Terminée"
      }
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status].color}`}>
        {statusMap[status].icon}
        {statusMap[status].text}
      </span>
    );
  };

  // Organiser les sessions par statut
  const organizedSessions = sessions.reduce((acc, session) => {
    const status = getSessionStatus(session);
    acc[status] = acc[status] || [];
    acc[status].push(session);
    return acc;
  }, {});

  const sessionsToDisplay = filter === "upcoming" 
    ? [...(organizedSessions.scheduled || []), ...(organizedSessions.ongoing || [])]
    : organizedSessions.completed || [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Sessions en direct</h1>
        {user?.role === "enseignant" && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-md"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Planifier une session
          </button>
        )}
      </div>

      {/* Sessions en cours */}
      {organizedSessions.ongoing?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Sessions en cours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizedSessions.ongoing.map((session) => (
              <div
                key={session.liveSessionId}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white border-l-4 border-green-500"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {session.title}
                      </h3>
                      <div className="mt-1">
                        {getStatusBadge(getSessionStatus(session))}
                      </div>
                    </div>
                    {canManageSession(session) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(session);
                          }}
                          className={`text-blue-500 hover:text-blue-700 transition-colors ${
                            canEditSession(session) ? "" : "cursor-not-allowed opacity-50"
                          }`}
                          title="Modifier"
                          disabled={!canEditSession(session)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.liveSessionId);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {session.course?.title && (
                    <p className="text-gray-600 mb-4 text-sm">
                      Cours: {session.course.title}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatDate(session.startTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {formatTime(session.startTime)} -{" "}
                        {formatTime(session.endTime)}
                      </span>
                    </div>
                    {session.attendeesCount > 0 && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{session.attendeesCount} participant(s)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {user.role === "enseignant" && canManageSession(session) ? (
                      <>
                        <button
                          onClick={() => navigate(`/live-session/${session.liveSessionId}`)}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center text-sm font-medium shadow"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Rejoindre
                        </button>
                        <button
                          onClick={() => handleEndSession(session.liveSessionId)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium flex items-center shadow"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Terminer
                        </button>
                        <button
                          onClick={() => handleViewAttendees(session.liveSessionId)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium flex items-center"
                          title="Voir les participants"
                        >
                          <UserGroupIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : user.role === "etudiant" && (
                      <button
                        onClick={() => handleJoinSession(session.liveSessionId)}
                        disabled={!canJoin(session)}
                        className={`flex-1 py-2 rounded flex items-center justify-center text-sm font-medium shadow ${
                          canJoin(session)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Rejoindre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${
            filter === "upcoming"
              ? "border-b-2 border-blue-500 font-medium text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setFilter("upcoming")}
        >
          À venir
        </button>
        <button
          className={`py-2 px-4 ${
            filter === "past"
              ? "border-b-2 border-blue-500 font-medium text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setFilter("past")}
        >
          Passées
        </button>
      </div>

      {/* Liste des sessions */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : sessionsToDisplay.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <VideoCameraIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">
            Aucune session {filter === "upcoming" ? "à venir" : "passée"} pour
            le moment
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessionsToDisplay.map((session) => {
            const status = getSessionStatus(session);
            return (
              <div
                key={session.liveSessionId}
                className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white ${
                  status === "ongoing" ? "border-l-4 border-green-500" : ""
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {session.title}
                      </h3>
                      <div className="mt-1">
                        {getStatusBadge(status)}
                      </div>
                    </div>
                    {canManageSession(session) && status === "scheduled" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(session);
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.liveSessionId);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {session.course?.title && (
                    <p className="text-gray-600 mb-4 text-sm">
                      Cours: {session.course.title}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatDate(session.startTime)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {formatTime(session.startTime)} -{" "}
                        {formatTime(session.endTime)}
                      </span>
                    </div>
                    {session.attendeesCount > 0 && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{session.attendeesCount} participant(s)</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {status === "scheduled" && user.role === "etudiant" ? (
                      <button
                        onClick={() => handleJoinSession(session.liveSessionId)}
                        disabled={!canJoin(session)}
                        className={`flex-1 py-2 rounded flex items-center justify-center text-sm font-medium shadow ${
                          canJoin(session)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Rejoindre
                      </button>
                    ) : status === "scheduled" && user.role === "enseignant" && canManageSession(session) ? (
                      <button
                        onClick={() => handleStartSession(session.liveSessionId)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center text-sm font-medium shadow"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Démarrer
                      </button>
                    ) : status === "completed" ? (
                      <button
                        onClick={() => navigate(`/recordings/${session.liveSessionId}`)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center justify-center text-sm font-medium shadow"
                      >
                        <VideoCameraIcon className="h-4 w-4 mr-1" />
                        Voir l'enregistrement
                      </button>
                    ) : null}
                    
                    {canManageSession(session) && (
                      <button
                        onClick={() => handleViewAttendees(session.liveSessionId)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium flex items-center"
                        title="Voir les participants"
                      >
                        <UserGroupIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <LiveSessionFormModal
          onClose={handleCloseModal}
          onSubmit={handleSaveSession}
          session={editingSession}
        />
      )}
      
      <LiveSessionAttendeesModal
        isOpen={showAttendeesModal}
        onClose={handleCloseAttendeesModal}
        attendees={attendees}
      />
    </div>
  );
};

export default LiveSessionsPage;