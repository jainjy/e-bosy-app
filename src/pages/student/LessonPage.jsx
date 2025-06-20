import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { 
  PlayCircleIcon, 
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockClosedIcon,
  CheckCircleIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { getData, postData } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = "http://localhost:5196";

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lesson');
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [contentFilter, setContentFilter] = useState('Video');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, courseError] = await getData(`courses/${courseId}/lessons`);
        if (courseError) throw courseError;

        setCourse(courseData.course);
        setLessons(courseData.lessons);

        const [lessonData, lessonError] = await getData(`courses/lessons/${lessonId}`);
        if (lessonError) throw lessonError;

        setCurrentLesson(lessonData);

      } catch (err) {
        setError(err.message);
        toast.error("Erreur lors du chargement de la leçon");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId]);

  const handleLessonComplete = async () => {
    try {
      const [data, error] = await postData(`enrollments/progress`, {
        courseId: parseInt(courseId),
        lessonId: parseInt(lessonId),
        completionRate: Math.min(progress + (100 / lessons.length), 100)
      });

      if (error) throw error;
      toast.success("Progression enregistrée");
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement de la progression");
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const [data, error] = await postData(`lessons/${lessonId}/comments`, {
        content: newComment,
        userId: user.userId
      });

      if (error) throw error;
      
      setComments([...comments, data]);
      setNewComment('');
      toast.success("Commentaire ajouté");
    } catch (err) {
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const navigateToLesson = (lessonId) => {
    navigate(`/course/${courseId}/lesson/${lessonId}`);
  };

  const groupedLessons = lessons.reduce((acc, lesson) => {
    const type = lesson.contentType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(lesson);
    return acc;
  }, {});

  const groupLessonsBySection = (lessons) => {
    return lessons.reduce((acc, lesson) => {
      const sectionTitle = lesson.sectionTitle || 'Sans section';
      if (!acc[sectionTitle]) {
        acc[sectionTitle] = [];
      }
      acc[sectionTitle].push(lesson);
      return acc;
    }, {});
  };

  const filteredAndGroupedLessons = useMemo(() => {
    const filtered = contentFilter === 'all' 
      ? lessons 
      : lessons.filter(lesson => lesson.contentType === contentFilter);
    return groupLessonsBySection(filtered);
  }, [lessons, contentFilter]);

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <PlayCircleIcon className="h-5 w-5" />;
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'text':
        return <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const filteredLessons = contentFilter === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.contentType === contentFilter);

  const renderContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.contentType.toLowerCase()) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <ReactPlayer
              url={`${API_BASE_URL}/${currentLesson.content}`}
              width="100%"
              height="100%"
              controls
              playing={false} // Ne pas lancer automatiquement
              light={true} // Afficher une miniature avant la lecture
              pip={true} // Activer le mode picture-in-picture
              stopOnUnmount={true} // Arrêter la vidéo quand le composant est démonté
              onProgress={({ played }) => setProgress(played * 100)}
              onEnded={handleLessonComplete}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload', // Empêcher le téléchargement
                    onContextMenu: e => e.preventDefault() // Désactiver le clic droit
                  }
                }
              }}
            />
          </div>
        );
      case 'text':
        return (
          <div className="prose max-w-none">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentLesson.content }}
            />
          </div>
        );
      case 'pdf':
        return (
          <div className="aspect-[16/9]">
            <iframe
              src={`${API_BASE_URL}/${currentLesson.content}`}
              className="w-full h-full border-0 rounded-lg"
              title={currentLesson.title}
            />
          </div>
        );
      default:
        return <p>Type de contenu non pris en charge</p>;
    }
  };

  const getNavigationLinks = () => {
    if (!currentLesson || !lessons.length) return { prev: null, next: null };

    const currentIndex = lessons.findIndex(l => l.lessonId === parseInt(lessonId));
    if (currentIndex === -1) return { prev: null, next: null };

    return {
      prev: currentIndex > 0 ? lessons[currentIndex - 1] : null,
      next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-e-bosy-purple"></div>
      </div>
    );
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
                {lessons.filter(l => l.completed).length}/{lessons.length} leçons
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

        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setContentFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                contentFilter === 'all'
                  ? 'bg-e-bosy-purple text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {Object.keys(groupedLessons).map(type => (
              <button
                key={type}
                onClick={() => setContentFilter(type)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  contentFilter === type
                    ? 'bg-e-bosy-purple text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getTypeIcon(type)}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <nav className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          {Object.entries(filteredAndGroupedLessons).map(([sectionTitle, sectionLessons]) => (
            <div key={sectionTitle} className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-px flex-grow bg-gray-200"></div>
                <h3 className="text-sm font-semibold text-gray-500 whitespace-nowrap px-2">
                  {sectionTitle}
                </h3>
                <div className="h-px flex-grow bg-gray-200"></div>
              </div>

              {sectionLessons.map((lesson) => (
                <div
                  key={lesson.lessonId}
                  onClick={() => navigateToLesson(lesson.lessonId)}
                  className={`
                    group flex items-center gap-3 p-3 rounded-lg cursor-pointer
                    transition-all duration-200 hover:bg-gray-50
                    ${lesson.lessonId === parseInt(lessonId) ? 'bg-e-bosy-purple/10 border-l-4 border-e-bosy-purple' : ''}
                  `}
                >
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${lesson.completed ? 'bg-green-100' : 'bg-gray-100'}
                    ${lesson.lessonId === parseInt(lessonId) ? 'bg-e-bosy-purple/20' : ''}
                  `}>
                    {getTypeIcon(lesson.contentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      lesson.lessonId === parseInt(lessonId) ? 'text-e-bosy-purple' : 'text-gray-700'
                    }`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FolderIcon className="h-3 w-3" />
                        {lesson.sectionTitle}
                      </span>
                      <span>•</span>
                      <span>{lesson.duration || '10 min'}</span>
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
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{currentLesson?.title}</h2>
          <div className="flex gap-3">
            {/* Bouton précédent */}
            {getNavigationLinks().prev && (
              <button 
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 flex items-center"
                onClick={() => navigateToLesson(getNavigationLinks().prev.lessonId)}
              >
                <ChevronLeftIcon className="h-4 w-4 inline-block mr-2" />
                Leçon précédente
              </button>
            )}
            
            {/* Bouton suivant */}
            {getNavigationLinks().next && (
              <button 
                className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700 flex items-center"
                onClick={() => navigateToLesson(getNavigationLinks().next.lessonId)}
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
              >
                Publier
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {comments.map((comment, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{comment.author}</p>
                    <p className="text-xs text-gray-500">{comment.time}</p>
                  </div>
                </div>
                <p className="text-gray-700 ml-11">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;