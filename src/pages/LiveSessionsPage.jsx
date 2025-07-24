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
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import LiveSessionFormModal from "../components/LiveSessionFormModal";
import LiveSessionAttendeesModal from "../components/LiveSessionAttendeesModal";
import { toast } from "react-toastify";
import { deleteData, getData, postData, putData } from "../services/ApiFetch";
import { API_BASE_URL } from "../services/ApiFetch";

const LiveSessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("scheduled");
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [selectedLiveSessionId, setSelectedLiveSessionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const baseUrl = `livesessions`;

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user.role === "enseignant") {
        const [data, error] = await getData(`${baseUrl}/teacher/${user.userId}`);
        if (error) throw error;
        
        const allSessions = Array.isArray(data) ? data : data?.sessions || [];
        const now = new Date();
        
        setSessions({
          scheduled: allSessions.filter(s => s.status === "scheduled"),
          ongoing: allSessions.filter(s => s.status === "ongoing"),
          completed: allSessions.filter(s => s.status === "completed")
        });
      } else {
        const [data, error] = await getData(`${baseUrl}/student/${user.userId}`);
        if (error) throw error;
        
        const allSessions = Array.isArray(data) ? data : data?.sessions || [];
        const now = new Date();
        
        setSessions({
          scheduled: allSessions.filter(s => s.status === "scheduled"),
          ongoing: allSessions.filter(s => s.status === "ongoing"),
          completed: allSessions.filter(s => s.status === "completed")
        });
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Erreur lors du chargement des sessions");
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    return session.status || "scheduled";
  };

  const canJoin = (session) => {
    return getSessionStatus(session) === "ongoing";
  };

  const canManageSession = (session) => {
    return user.role === "enseignant" && user.userId === session.hostId;
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
        const [data, error] = await deleteData(`${baseUrl}/${liveSessionId}`);
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
      if (error) throw error;
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

  const handleJoinOrRegister = async (liveSessionId, status) => {
    try {
      if (status === "ongoing") {
        await handleJoinSession(liveSessionId);
      } else if (status === "scheduled") {
        const [result, error] = await postData(`${baseUrl}/${liveSessionId}/attendees`);
        if (error) throw error;
        toast.success("Vous êtes inscrit à cette session");
        await fetchSessions();
      }
    } catch (error) {
      console.error("Error joining/registering for session:", error);
      toast.error("Erreur lors de l'inscription à la session");
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

  const filterSessions = useCallback((sessions) => {
    if (!searchTerm) return sessions;
    
    return sessions.filter(session => 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getFilteredSessions = () => {
    return filterSessions(sessions[activeFilter] || []);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sessions en direct</h1>
          <p className="text-gray-600 mt-1">
            {activeFilter === "scheduled" && "Sessions planifiées à venir"}
            {activeFilter === "ongoing" && "Sessions en cours actuellement"}
            {activeFilter === "completed" && "Sessions terminées"}
          </p>
        </div>
        
        {user?.role === "enseignant" && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-md whitespace-nowrap"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Planifier une session
          </button>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par titre ou nom du cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter("scheduled")}
          className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
            activeFilter === "scheduled"
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ClockIcon className="h-5 w-5 mr-2" />
          Planifiées
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {sessions.scheduled?.length || 0}
          </span>
        </button>
        
        <button
          onClick={() => setActiveFilter("ongoing")}
          className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
            activeFilter === "ongoing"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <PlayIcon className="h-5 w-5 mr-2" />
          En cours
          <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {sessions.ongoing?.length || 0}
          </span>
        </button>
        
        <button
          onClick={() => setActiveFilter("completed")}
          className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
            activeFilter === "completed"
              ? "bg-purple-100 text-purple-700 border border-purple-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Terminées
          <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
            {sessions.completed?.length || 0}
          </span>
        </button>
      </div>

      {/* Liste des sessions */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : getFilteredSessions().length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <VideoCameraIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">
            Aucune session {activeFilter === "scheduled" ? "planifiée" : activeFilter === "ongoing" ? "en cours" : "terminée"} pour le moment
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredSessions().map((session) => {
            const status = getSessionStatus(session);
            const isTeacher = user.role === "enseignant";
            const isStudent = user.role === "etudiant";
            
            return (
              <div
                key={session.liveSessionId}
                className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white ${
                  status === "ongoing" ? "border-l-4 border-green-500" : ""
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {session.title}
                      </h3>
                      <div className="mt-2">
                        {getStatusBadge(status)}
                      </div>
                    </div>
                    
                    {(isTeacher) && status === "scheduled" && (
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
                  
                  {session.description && (
                    <p className="text-gray-600 mb-3 text-sm">
                      {session.description}
                    </p>
                  )}

                  {session.course?.title && (
                    <p className="text-gray-600 mb-3 text-sm line-clamp-1">
                      <span className="font-medium">Cours:</span> {session.course.title}
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
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Boutons en fonction du statut et du rôle */}
                    {status === "scheduled" && isStudent && (
                      <button
                        onClick={() => handleJoinOrRegister(session.liveSessionId, "scheduled")}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center text-sm font-medium shadow"
                        
                      >
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        Participer
                      </button>
                    )}

                    {status === "scheduled" && isTeacher && canManageSession(session) && (
                      <button
                        onClick={() => handleStartSession(session.liveSessionId)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center text-sm font-medium shadow"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Démarrer
                      </button>
                    )}
                    
                    {status === "ongoing" && isTeacher && canManageSession(session) && (
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
                      </>
                    )}
                    
                    {status === "ongoing" && isStudent && (
                      <button
                        onClick={() => handleJoinSession(session.liveSessionId)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center justify-center text-sm font-medium shadow"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Rejoindre
                      </button>
                    )}
                    
                    {status === "completed" && (
                      <button
                        onClick={() => navigate(`/recordings/${session.liveSessionId}`)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center justify-center text-sm font-medium shadow"
                      >
                        <VideoCameraIcon className="h-4 w-4 mr-1" />
                        Voir l'enregistrement
                      </button>
                    )}
                    
                    {(isTeacher) && (
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