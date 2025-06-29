import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { liveSessionService } from "../services/liveSessionService";
import {
  VideoCameraIcon,
  PlayIcon,
  PlusIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const LiveSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = filter === "upcoming"
          ? await liveSessionService.getUpcomingSessions()
          : await liveSessionService.getPastSessions();
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [filter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canJoin = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return now >= start && now <= end;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Live Sessions</h1>
        <button
          onClick={() => navigate("/dashboard/live-sessions/schedule")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Schedule Session
        </button>
      </div>

      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 ${filter === "upcoming" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`py-2 px-4 ${filter === "past" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setFilter("past")}
        >
          Past
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12">
          <VideoCameraIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No {filter} sessions</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                <p className="text-gray-600 mb-4">{session.course?.title}</p>
                
                <div className="flex items-center text-gray-500 mb-2">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  <span>{formatDate(session.startTime)}</span>
                </div>
                
                <div className="flex items-center text-gray-500 mb-4">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                </div>

                {filter === "upcoming" ? (
                  <button
                    onClick={() => navigate(`/live-session/${session.id}`)}
                    disabled={!canJoin(session)}
                    className={`w-full py-2 rounded flex items-center justify-center ${
                      canJoin(session)
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    {canJoin(session) ? "Join Now" : "Not Started Yet"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/recordings/${session.id}`)}
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center"
                  >
                    <VideoCameraIcon className="h-4 w-4 mr-2" />
                    View Recording
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveSessionsPage;