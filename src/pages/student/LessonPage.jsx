import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayCircleIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { API_BASE_URL, getData, postData } from "../../services/ApiFetch";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import Navbar from "../../Components/Navbar";

// Default Video Player Component
const DefaultVideoPlayer = ({ 
  url, 
  onProgress, 
  onComplete,
  poster 
}) => {
  const videoRef = useRef(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const videoProgress = (video.currentTime / video.duration) * 100;
      onProgress?.({ played: videoProgress / 100 });

      // Trigger onComplete when 90% of the video is watched
      if (videoProgress >= 90 && !hasCompleted) {
        onComplete?.();
        setHasCompleted(true);
      }

      // Save progress to localStorage
      if (video.currentTime > 0) {
        localStorage.setItem(`video-progress-${url}`, video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      // Restore last position
      const savedTime = localStorage.getItem(`video-progress-${url}`);
      if (savedTime) {
        video.currentTime = parseFloat(savedTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [url, onProgress, onComplete, hasCompleted]);

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        controls
        poster={poster}
        className="w-full h-full"
        preload="metadata"
      >
        <source src={url} type="video/mp4" />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    </div>
  );
};

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0); // Progression de la vidéo actuelle
  const [courseProgress, setCourseProgress] = useState(0); // Progression du cours
  const [enrollment, setEnrollment] = useState();
  const [contentFilter] = useState("video");

  useEffect(() => {
    if (!user) return; // Attendre que user soit disponible
    
    const fetchData = async () => {
      try {
        console.log(user)
        setLoading(true);
        const [courseData, courseError] = await getData(
          `courses/${courseId}/lessons`
        );
        if (courseError) throw courseError;

        const videoLessons = courseData.lessons.filter(
          (lesson) => lesson.contentType?.toLowerCase() === "video"
        );
        setLessons(videoLessons);
        setCourse(courseData.course);
        const [data,error]=await getData(`enrollments/student/${user.userId}/${courseId}`);
        const [completionData, completionError] = await getData(`progress/enrollment/${data.enrollmentId}/completion-rate`);
        console.log(data)
        if (!completionError) {
          data.completionRate = completionData;
          setCourseProgress(completionData); // Mettre à jour la progression du cours
        }
        setEnrollment(data)
        const [lessonData, lessonError] = await getData(
          `courses/lessons/${lessonId}`
        );
        if (lessonError) throw lessonError;

        if (lessonData.isSubscriberOnly && !user?.IsSubscribed) {
          toast.error("Cette leçon est réservée aux abonnés Premium.");
        }

        setCurrentLesson(lessonData);
        console.log(user,enrollment)
      } catch (err) {
        setError(err.message);
        toast.error("Erreur lors du chargement de la leçon");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId,user]);

  const handleLessonComplete = async () => {
    try {
      const [data, error] = await postData(`progress/enrollment/${enrollment.enrollmentId}/complete-lesson`,parseInt(lessonId));

      if (error) throw error;

      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson.lessonId === parseInt(lessonId)
            ? { ...lesson, completed: true }
            : lesson
        )
      );

      // Mettre à jour la progression du cours après avoir terminé une leçon
      const [updatedCompletionData, completionError] = await getData(`progress/enrollment/${enrollment.enrollmentId}/completion-rate`);
      if (!completionError) {
        setCourseProgress(updatedCompletionData);
      }

      toast.success("Progression enregistrée");
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement de la progression");
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

  const filteredAndGroupedLessons = useMemo(() => {
    return groupLessonsBySection(lessons);
  }, [lessons]);

  const getTypeIcon = () => {
    return <PlayCircleIcon className="h-5 w-5" />;
  };

  const renderContent = () => {
    if (!currentLesson) return null;

    const isLocked = currentLesson.isSubscriberOnly && !user?.IsSubscribed;

    if (isLocked) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-yellow-800">
              Contenu réservé aux abonnés
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Cette leçon est disponible uniquement pour les utilisateurs Premium.
            </p>
          </div>
          <button
            onClick={() => navigate("/abonnement")}
            className="bg-e-bosy-purple text-white px-5 py-2 rounded-md hover:bg-purple-700 transition"
          >
            Devenir Premium
          </button>
        </div>
      );
    }

    if (currentLesson.contentType?.toLowerCase() === "video") {
      return (
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <DefaultVideoPlayer
              url={`${API_BASE_URL}/${currentLesson.content}`}
              poster={
                currentLesson.thumbnail
                  ? `${API_BASE_URL}/${currentLesson.thumbnail}`
                  : ""
              }
              onProgress={(state) => setVideoProgress(state.played * 100)}
              onComplete={handleLessonComplete}
            />
          </div>
          
        </div>
      );
    }

    return (
      <p className="text-red-500">
        Ce contenu n'est pas une vidéo et ne peut pas être affiché ici.
      </p>
    );
  };

  const getNavigationLinks = () => {
    if (!currentLesson || !lessons.length) return { prev: null, next: null };

    const currentIndex = lessons.findIndex(
      (l) => l.lessonId === parseInt(lessonId)
    );
    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? lessons[currentIndex - 1] : null,
      next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null,
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

      <div className="w-80 bg-white p-6 shadow-md flex flex-col mt-11">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {course?.title}
          </h3>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-gray-600 text-sm mb-2">Progression du cours</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-e-bosy-purple font-semibold">
                {courseProgress}%
              </span>
              <span className="text-gray-500 text-sm">
                {enrollment?.completedLessons?.length || 0}/{lessons.length} leçons
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-e-bosy-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </div>
        </div>

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
                          ${
                            lesson.lessonId === parseInt(lessonId)
                              ? "bg-e-bosy-purple/20"
                              : ""
                          }
                        `}
                      >
                        {getTypeIcon()}
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

      <div className="flex-1 p-8 overflow-y-auto mt-11">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {currentLesson?.title}
          </h2>
          <div className="flex gap-3">
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

        <div className="bg-white rounded-lg shadow-md p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;