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
} from "@heroicons/react/24/outline";
import LiveSessionFormModal from "../components/LiveSessionFormModal";
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
  const navigate = useNavigate();
  const baseUrl = `${API_BASE_URL}/api/livesessions`;

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint;
      if (user.role === "enseignant") {
        endpoint = filter === "upcoming" ? `${baseUrl}/upcoming` : `${baseUrl}/past`;
      } else {
        // Étudiant : récupérer les sessions où il est inscrit
        endpoint = filter === "upcoming" 
          ? `${baseUrl}/upcoming?attendeeId=${user.userId}`
          : `${baseUrl}/past?attendeeId=${user.userId}`;
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

  const isSessionOngoing = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return now >= start && now <= end;
  };

  const canJoin = (session) => {
    return isSessionOngoing(session);
  };

  const isHost = (session) => {
    return user?.userId === session.hostId || user?.role === "administrateur";
  };

  const handleOpenModal = (session = null) => {
    setEditingSession(session);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSession(null);
  };

  const handleSaveSession = async (sessionData) => {
    try {
      await fetchSessions(); // Refresh the sessions list
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

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) {
      try {
        const [data, error] = await postData(`${baseUrl}/${sessionId}/delete`);
        if (error) throw error;
        await fetchSessions();
        toast.success("Session supprimée avec succès");
      } catch (error) {
        console.error("Error deleting session:", error);
        toast.error("Erreur lors de la suppression de la session");
      }
    }
  };

  const handleViewAttendees = (sessionId) => {
    navigate(`/live-session/${sessionId}/attendees`);
  };

  const handleStartSession = async (sessionId) => {
    try {
      const [data, error] = await postData(`${baseUrl}/${sessionId}/start`);
      if (error) throw error;
      toast.success("Session démarrée avec succès");
      navigate(`/live-session/${sessionId}`);
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Erreur lors du démarrage de la session");
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const [data, error] = await postData(`${baseUrl}/${sessionId}/attendees/${user.userId}`);
      if (error) throw error;
      toast.success("Vous avez rejoint la session");
      navigate(`/live-session/${sessionId}`);
    } catch (error) {
      console.error("Error joining session:", error);
      toast.error("Erreur lors de la tentative de rejoindre la session");
    }
  };

  // Séparer les sessions en cours des autres
  const ongoingSessions = sessions.filter(isSessionOngoing);
  const otherSessions = sessions.filter((session) => !isSessionOngoing(session));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sessions en direct</h1>
        {user?.role === "enseignant" && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Planifier une session
          </button>
        )}
      </div>

      {/* Section pour les sessions en cours */}
      {ongoingSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Sessions en cours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingSessions.map((session) => (
              <div
                key={session.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {session.title}
                    </h3>
                    {user.role === "enseignant" && isHost(session) && (
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
                            handleDeleteSession(session.id);
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
                    {user.role === "enseignant" && isHost(session) ? (
                      <>
                        <button
                          onClick={() => handleStartSession(session.id)}
                          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center text-sm font-medium"
                        >
                          <PlayIcon className="h-4 w-4 mr-1" />
                          Démarrer
                        </button>
                        <button
                          onClick={() => handleViewAttendees(session.id)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium flex items-center"
                          title="Voir les participants"
                        >
                          <UserGroupIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinSession(session.id)}
                        disabled={!canJoin(session) || !session.attendeesIds.includes(user.userId)}
                        className={`flex-1 py-2 rounded flex items-center justify-center text-sm font-medium ${
                          canJoin(session) && session.attendeesIds.includes(user.userId)
                            ? "bg-green-500 hover:bg-green-600 text-white"
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

      {/* Tabs pour À venir et Passées */}
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : otherSessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <VideoCameraIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">
            Aucune session {filter === "upcoming" ? "à venir" : "passée"} pour
            le moment
          </h3>
          {filter === "upcoming" && user?.role === "enseignant" && (
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Planifier votre première session
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherSessions.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {session.title}
                  </h3>
                  {user.role === "enseignant" && isHost(session) && (
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
                          handleDeleteSession(session.id);
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
                  {filter === "upcoming" && user.role === "etudiant" ? (
                    <button
                      onClick={() => handleJoinSession(session.id)}
                      disabled={!canJoin(session) || !session.attendeesIds.includes(user.userId)}
                      className={`flex-1 py-2 rounded flex items-center justify-center text-sm font-medium ${
                        canJoin(session) && session.attendeesIds.includes(user.userId)
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-100 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      {canJoin(session) ? "Rejoindre" : "Bientôt"}
                    </button>
                  ) : filter === "past" ? (
                    <button
                      onClick={() => navigate(`/recordings/${session.id}`)}
                      className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center text-sm font-medium"
                    >
                      <VideoCameraIcon className="h-4 w-4 mr-1" />
                      Voir l'enregistrement
                    </button>
                  ) : null}
                  {user.role === "enseignant" && isHost(session) && (
                    <button
                      onClick={() => handleViewAttendees(session.id)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium flex items-center"
                      title="Voir les participants"
                    >
                      <UserGroupIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <LiveSessionFormModal
          onClose={handleCloseModal}
          onSubmit={handleSaveSession}
          session={editingSession}
        />
      )}
    </div>
  );
};

export default LiveSessionsPage;