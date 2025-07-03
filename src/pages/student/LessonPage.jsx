import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
// ReactPlayer is not strictly needed if VideoPlayer component is used
// import ReactPlayer from 'react-player';
import {
  PlayCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { getData, postData } from "../../services/ApiFetch";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import VideoPlayer from "../../components/VideoPlayer"; // Ensure this component is correctly implemented
import { LoadingSpinner } from "../../components/LoadingSpinner";

const API_BASE_URL = "http://localhost:5000";

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Removed activeTab and related state as it's not used in this simplified view
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  // Set default filter to 'video'
  const [contentFilter, setContentFilter] = useState("video");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, courseError] = await getData(
          `courses/${courseId}/lessons`
        );
        if (courseError) throw courseError;

        // Filter lessons immediately to only include videos
        const videoLessons = courseData.lessons.filter(
          (lesson) => lesson.contentType?.toLowerCase() === "video"
        );
        setLessons(videoLessons);
        setCourse(courseData.course);

        const [lessonData, lessonError] = await getData(
          `courses/lessons/${lessonId}`
        );
        if (lessonError) throw lessonError;

        if (lessonData.isSubscriberOnly && !user?.IsSubscribed) {
          toast.error("Cette leçon est réservée aux abonnés Premium.");
          // Ne redirige pas ! Laisse le rendu gérer l'affichage
        }
        

        setCurrentLesson(lessonData);
      } catch (err) {
        setError(err.message);
        toast.error("Erreur lors du chargement de la leçon");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId]); // Depend on courseId and lessonId

  const handleLessonComplete = async () => {
    try {
      const [data, error] = await postData(`enrollments/progress`, {
        courseId: parseInt(courseId),
        lessonId: parseInt(lessonId),
        completionRate: Math.min(progress + 100 / lessons.length, 100), // Ensure this logic is correct for your progress tracking
      });

      if (error) throw error;
      toast.success("Progression enregistrée");
      // Optionally re-fetch lessons to update completion status in sidebar
      // const [courseData, courseError] = await getData(`courses/${courseId}/lessons`);
      // if (!courseError) setLessons(courseData.lessons.filter(lesson => lesson.contentType?.toLowerCase() === 'video'));
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement de la progression");
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const [data, error] = await postData(`lessons/${lessonId}/comments`, {
        content: newComment,
        userId: user.userId, // Ensure user.userId is available
      });

      if (error) throw error;

      // Assuming data returned includes the full comment object with author and time
      setComments([
        ...comments,
        {
          author: user.name || user.email, // Use user's name or email if author not in data
          text: data.content,
          time: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }), // Or get from data if provided by API
        },
      ]);
      setNewComment("");
      toast.success("Commentaire ajouté");
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const navigateToLesson = (lessonIdToNavigate) => {
    navigate(`/course/${courseId}/lesson/${lessonIdToNavigate}`);
  };

  const groupLessonsBySection = (lessonsToGroup) => {
    return lessonsToGroup.reduce((acc, lesson) => {
      const sectionTitle = lesson.sectionTitle || "Sans section";
      if (!acc[sectionTitle]) {
        acc[sectionTitle] = [];
      }
      acc[sectionTitle].push(lesson);
      return acc;
    }, {});
  };

  // Only consider 'video' content for filtering and grouping in the sidebar
  const filteredAndGroupedLessons = useMemo(() => {
    // Already filtered `lessons` in useEffect, so just group them
    return groupLessonsBySection(lessons);
  }, [lessons]); // Only re-calculate when lessons state changes

  const getTypeIcon = (type) => {
    // Only return PlayCircleIcon since we're only displaying videos
    return <PlayCircleIcon className="h-5 w-5" />;
  };

const renderContent = () => {
  if (!currentLesson) return null;

  const isLocked = currentLesson.isSubscriberOnly && !user?.IsSubscribed;

  if (isLocked) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-yellow-800">Contenu réservé aux abonnés</h3>
          <p className="text-sm text-yellow-700 mt-1">Cette leçon est disponible uniquement pour les utilisateurs Premium.</p>
        </div>
        <button
          onClick={() => navigate('/abonnement')} // 🔁 À adapter selon ta route d’abonnement
          className="bg-e-bosy-purple text-white px-5 py-2 rounded-md hover:bg-purple-700 transition"
        >
          Devenir Premium
        </button>
      </div>
    );
  }

  if (currentLesson.contentType?.toLowerCase() === 'video') {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <VideoPlayer
          url={`${API_BASE_URL}/${currentLesson.content}`}
          poster={currentLesson.thumbnail ? `${API_BASE_URL}/${currentLesson.thumbnail}` : ''}
          onProgress={(state) => setProgress(state.played * 100)}
          onComplete={handleLessonComplete}
        />
      </div>
    );
  }

  return <p className="text-red-500">Ce contenu n'est pas une vidéo et ne peut pas être affiché ici.</p>;
};


  const getNavigationLinks = () => {
    if (!currentLesson || !lessons.length) return { prev: null, next: null };

    // Find index only within the filtered video lessons
    const currentIndex = lessons.findIndex(
      (l) => l.lessonId === parseInt(lessonId)
    );
    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? lessons[currentIndex - 1] : null,
      next:
        currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null,
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-80 bg-white p-6 shadow-md flex flex-col">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {course?.title}
          </h3>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-gray-600 text-sm mb-2">Progression</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-e-bosy-purple font-semibold">
                {Math.round(progress)}%
              </span>
              <span className="text-gray-500 text-sm">
                {lessons.filter((l) => l.completed).length}/{lessons.length}{" "}
                leçons
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-e-bosy-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Removed content type filter buttons, as only video is shown */}
        {/* <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setContentFilter('video')} // Only option left
              className={`px-3 py-1 rounded-full text-sm bg-e-bosy-purple text-white`}
            >
              <PlayCircleIcon className="h-5 w-5 mr-1" /> Vidéos
            </button>
          </div>
        </div> */}

        <nav className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {Object.entries(filteredAndGroupedLessons).map(
            ([sectionTitle, sectionLessons]) => (
              <div key={sectionTitle} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-px flex-grow bg-gray-200"></div>
                  <h3 className="text-sm font-semibold text-gray-500 whitespace-nowrap px-2">
                    {sectionTitle}
                  </h3>
                  <div className="h-px flex-grow bg-gray-200"></div>
                </div>
                {sectionLessons.map((lesson) => {
                  const isVideo = lesson.contentType?.toLowerCase() === "video";
                  const isSubscriberOnly = lesson.isSubscriberOnly === true;
                  const isAccessible =
                    !isSubscriberOnly || user?.IsSubscribed === true;

                  if (!isVideo) return null;

                  if (!isAccessible) {
                    return (
                      <div
                        key={lesson.lessonId}
                        className="group flex items-center gap-3 p-3 rounded-lg bg-gray-100 cursor-not-allowed opacity-60"
                        title="Contenu réservé aux abonnés Premium"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                          🔒
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-gray-600">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 italic">
                            Inaccessible sans abonnement
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={lesson.lessonId}
                      onClick={() => navigateToLesson(lesson.lessonId)}
                      className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer
        transition-all duration-200 hover:bg-gray-50
        ${
          lesson.lessonId === parseInt(lessonId)
            ? "bg-e-bosy-purple/10 border-l-4 border-e-bosy-purple"
            : ""
        }`}
                    >
                      <div
                        className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${lesson.completed ? "bg-green-100" : "bg-gray-100"}
        ${lesson.lessonId === parseInt(lessonId) ? "bg-e-bosy-purple/20" : ""}
      `}
                      >
                        {getTypeIcon(lesson.contentType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            lesson.lessonId === parseInt(lessonId)
                              ? "text-e-bosy-purple"
                              : "text-gray-700"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FolderIcon className="h-3 w-3" />
                            {lesson.sectionTitle}
                          </span>
                          <span>•</span>
                          <span>{lesson.duration || "N/A"}</span>
                          {lesson.completed && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircleIcon className="h-3 w-3" /> Complété
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </nav>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {currentLesson?.title}
          </h2>
          <div className="flex gap-3">
            {/* Bouton précédent */}
            {getNavigationLinks().prev && (
              <button
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 flex items-center"
                onClick={() =>
                  navigateToLesson(getNavigationLinks().prev.lessonId)
                }
              >
                <ChevronLeftIcon className="h-4 w-4 inline-block mr-2" />
                Leçon précédente
              </button>
            )}

            {/* Bouton suivant */}
            {getNavigationLinks().next && (
              <button
                className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700 flex items-center"
                onClick={() =>
                  navigateToLesson(getNavigationLinks().next.lessonId)
                }
              >
                Leçon suivante
                <ChevronRightIcon className="h-4 w-4 inline-block ml-2" />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {renderContent()}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
            <span>Discussion ({comments.length})</span>
          </h3>

          <div className="mb-6">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              rows="4"
              placeholder="Ajouter un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-3">
              <button
                className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700"
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()} // Disable if comment is empty
              >
                Publier
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                    {comment.author?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {comment.author}
                    </p>
                    <p className="text-xs text-gray-500">{comment.time}</p>
                  </div>
                </div>
                <p className="text-gray-700 ml-11">{comment.text}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-500 text-center">
                Aucun commentaire pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
