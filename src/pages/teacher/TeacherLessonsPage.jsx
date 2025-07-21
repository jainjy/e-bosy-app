import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  VideoCameraIcon,
  PencilIcon,
  TrashIcon,
  PlayCircleIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from 'uuid';

// DND Kit Imports
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import SectionFormModal from "../../components/SectionFormModal";
import LiveSessionFormModal from "../../components/LiveSessionFormModal";
import { getData, postData, putData, deleteData, API_BASE_URL } from "../../services/ApiFetch";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import SearchBar from '../../components/SearchBar';

// Modal Component for Video
const VideoModal = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="">
          <video
            src={API_BASE_URL+videoUrl}
            autoPlay
            controls

          ></video>
        </div>
      </div>
    </div>
  );
};

// SortableItem Component for Lessons
const SortableLessonItem = ({ lesson, courseId, handleDeleteLesson, onVideoClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
    boxShadow: isDragging ? '0px 4px 10px rgba(0, 0, 0, 0.1)' : 'none',
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "external_video_url":
      case "uploaded_video_file":
        return <VideoCameraIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />;
      case "pdf":
        return <DocumentTextIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />;
      default:
        return <PlayCircleIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between cursor-grab"
    >
      <div className="flex-grow flex items-center">
        <button
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab mr-3"
          {...listeners}
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <span className="text-md font-bold text-gray-800 mr-2 flex-shrink-0">
          {lesson.position_in_section}.
        </span>
        <h3 className="text-md font-semibold text-gray-800 flex-grow">
          {lesson.title}
        </h3>
        {lesson.isSubscriberOnly && (
          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex-shrink-0">
            Abonnés seulement
          </span>
        )}
        {!lesson.isSubscriberOnly && (
          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
            Gratuit (Aperçu)
          </span>
        )}
        <span className="ml-auto text-gray-500 text-sm flex-shrink-0 flex items-center">
          {getContentTypeIcon(lesson.contentType)}
          {lesson.contentType.replace(/_/g, " ")}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:ml-6 justify-end flex-shrink-0">
        {lesson.contentType.includes("video") && (
          <button
            onClick={() => onVideoClick(lesson.content)}
            className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            <PlayCircleIcon className="h-3 w-3 mr-1" /> Lire la vidéo
          </button>
        )}
        <Link
          to={`/courses/${courseId}/lessons/${lesson.id}/edit`}
          className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <PencilIcon className="h-3 w-3 mr-1" /> Modifier
        </Link>
        <button
          onClick={() => handleDeleteLesson(lesson.id)}
          className="flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          <TrashIcon className="h-3 w-3 mr-1" /> Supprimer
        </button>
      </div>
    </div>
  );
};

// SortableItem Component for Sections
const SortableSectionItem = ({ section, children, courseSections, handleOpenEditSectionModal, handleDeleteSection }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    boxShadow: isDragging ? '0px 4px 10px rgba(0, 0, 0, 0.1)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4 border-b pb-3 -mx-6 px-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab mr-3"
            {...listeners}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          {section.order}. {section.title}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => handleOpenEditSectionModal(section)}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <PencilIcon className="h-4 w-4 mr-1" /> Modifier
          </button>
          <button
            onClick={() => handleDeleteSection(section.id)}
            className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            <TrashIcon className="h-4 w-4 mr-1" /> Supprimer
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};

const TeacherLessonsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isLiveSessionModalOpen, setIsLiveSessionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      setLoading(true);
      try {
        const [data, error] = await getData(`courses/${courseId}/lessons`);
        if (error) throw error;

        setCourse({
          id: data.courseId,
          title: data.title,
          status: data.status,
          sections: data.sections.map(section => ({
            id: uuidv4(),
            title: section.title,
            order: section.order
          }))
        });

        setLessons(data.lessons.map(lesson => ({
          id: lesson.lessonId,
          section_id: lesson.sectionTitle,
          position_in_section: lesson.position,
          title: lesson.title,
          content: lesson.content,
          contentType: lesson.contentType,
          course_id: lesson.courseId,
          isSubscriberOnly: lesson.isSubscriberOnly
        })));
      } catch (err) {
        setError("Échec du chargement du cours et des leçons.");
        toast.error("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndLessons();
  }, [courseId]);

  const sortedSections = useMemo(() => {
    if (!course?.sections) return [];
    return [...course.sections].sort((a, b) => a.order - b.order);
  }, [course]);

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [lessons, searchQuery]);

  const getLessonsForSection = (sectionTitle) => {
    return filteredLessons
      .filter((lesson) => lesson.section_id === sectionTitle)
      .sort((a, b) => a.position_in_section - b.position_in_section);
  };

  const handleOpenAddSectionModal = () => {
    setSectionToEdit(null);
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSectionModal = (section) => {
    setSectionToEdit(section);
    setIsSectionModalOpen(true);
  };

  const handleCloseSectionModal = () => {
    setIsSectionModalOpen(false);
    setSectionToEdit(null);
  };

  const handleOpenVideoModal = (url) => {
    setVideoUrl(url);
    setIsVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setVideoUrl("");
  };

  const openLiveSessionModal = () => {
    setIsLiveSessionModalOpen(true);
  };

  const closeLiveSessionModal = () => {
    setIsLiveSessionModalOpen(false);
  };

  const handleSaveSection = async (newTitle) => {
    try {
      if (sectionToEdit) {
        const [data, error] = await putData(`courses/${courseId}/sections/${encodeURIComponent(sectionToEdit.title)}`, {
          title: newTitle,
          order: sectionToEdit.order
        });

        if (error) throw error;

        setCourse(prevCourse => ({
          ...prevCourse,
          sections: prevCourse.sections.map(sec =>
            sec.id === sectionToEdit.id ? { ...sec, title: newTitle } : sec
          )
        }));

        setLessons(prevLessons => prevLessons.map(lesson =>
          lesson.section_id === sectionToEdit.title
            ? { ...lesson, section_id: newTitle }
            : lesson
        ));

        toast.success("Section mise à jour avec succès");
      } else {
        const [data, error] = await postData(`courses/${courseId}/sections`, {
          title: newTitle,
          order: course.sections.length + 1,
          courseId: parseInt(courseId)
        });

        if (error) throw error;

        setCourse(prevCourse => ({
          ...prevCourse,
          sections: [...prevCourse.sections, {
            id: data.id,
            title: data.title,
            order: data.order
          }]
        }));

        toast.success("Section créée avec succès");
      }
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde de la section");
      console.error(err);
    } finally {
      handleCloseSectionModal();
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette section ?")) {
      try {
        const section = course.sections.find(s => s.id === sectionId);
        const [, error] = await deleteData(`courses/${courseId}/sections/${encodeURIComponent(section.title)}`);

        if (error) throw error;

        setCourse(prevCourse => ({
          ...prevCourse,
          sections: prevCourse.sections.filter(s => s.id !== sectionId)
        }));

        setLessons(prevLessons =>
          prevLessons.filter(lesson => lesson.section_id !== section.title)
        );

        toast.success("Section supprimée avec succès");
      } catch (err) {
        toast.error("Erreur lors de la suppression de la section");
        console.error(err);
      }
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette leçon ?")) {
      try {
        const [, error] = await deleteData(`courses/lessons/${lessonId}`);

        if (error) throw error;

        setLessons(prevLessons =>
          prevLessons.filter(lesson => lesson.id !== lessonId)
        );

        toast.success("Leçon supprimée avec succès");
      } catch (err) {
        toast.error("Erreur lors de la suppression de la leçon");
        console.error(err);
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    try {
      const isSectionDrag = course.sections.some(s => s.id === active.id);
      if (isSectionDrag) {
        const activeSection = course.sections.find(sec => sec.id === active.id);
        const overSection = course.sections.find(sec => sec.id === over.id);
        if (!activeSection || !overSection) return;

        const [, error] = await postData(`courses/${courseId}/sections/reorder`, {
          courseId: parseInt(courseId),
          sectionId: parseInt(activeSection.order),
          newOrder: parseInt(overSection.order)
        });

        if (error) throw error;

        setCourse(prevCourse => {
          const oldIndex = prevCourse.sections.findIndex(sec => sec.id === active.id);
          const newIndex = prevCourse.sections.findIndex(sec => sec.id === over.id);

          const newSections = arrayMove(prevCourse.sections, oldIndex, newIndex);
          return {
            ...prevCourse,
            sections: newSections.map((sec, index) => ({ ...sec, order: index + 1 }))
          };
        });
      } else {
        const activeLesson = lessons.find(l => l.id === active.id);
        const overLesson = lessons.find(l => l.id === over.id);

        if (!activeLesson || !overLesson) return;

        const [, error] = await postData(`courses/lessons/reorder`, {
          courseId: parseInt(courseId),
          fromPosition: activeLesson.position_in_section,
          toPosition: overLesson.position_in_section
        });

        if (error) throw error;

        setLessons(prevLessons => {
          const updatedLessons = arrayMove(
            prevLessons,
            prevLessons.findIndex(l => l.id === active.id),
            prevLessons.findIndex(l => l.id === over.id)
          );

          return updatedLessons.map((lesson, index) => ({
            ...lesson,
            position_in_section: index + 1
          }));
        });
      }

      toast.success("Réorganisation effectuée avec succès");
    } catch (err) {
      toast.error("Erreur lors de la réorganisation");
      console.error(err);
    }
  };

  const handleLiveSessionSubmit = async (sessionData) => {
    try {
      toast.success("Session en direct planifiée/mise à jour avec succès!");
    } catch (error) {
      toast.error("Erreur lors de la planification/mise à jour de la session en direct.");
    } finally {
      closeLiveSessionModal();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-center text-red-500">
        Erreur: {error}
      </div>
    );
  }

  if (!course || !course.sections) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-center text-gray-600">
        Données du cours non disponibles.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link
        to="/mycourses"
        className="flex items-center text-e-bosy-purple hover:underline mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Retour aux Cours
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">Gérer les leçons et les sections pour ce cours.</p>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            {course.status === "Published" ? "Publié" : "Brouillon"}
          </span>
          <span className="text-gray-600 text-sm">
            {lessons.length} leçons au total
          </span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleOpenAddSectionModal}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter une Section
          </button>
          <Link
            to={`/courses/${course.id}/lessons/add`}
            className="flex items-center px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter une Leçon
          </Link>
          <button
            onClick={openLiveSessionModal}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Planifie Session Live 
          </button>
        </div>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher une leçon..."
          className="max-w-md"
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSections.map(sec => sec.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-8">
            {sortedSections.length > 0 ? (
              sortedSections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  courseSections={course.sections}
                  handleOpenEditSectionModal={handleOpenEditSectionModal}
                  handleDeleteSection={handleDeleteSection}
                >
                  <SortableContext
                    items={getLessonsForSection(section.title).map(lesson => lesson.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4 pt-2">
                      {getLessonsForSection(section.title).length > 0 ? (
                        getLessonsForSection(section.title).map((lesson) => (
                          <SortableLessonItem
                            key={lesson.id}
                            lesson={lesson}
                            courseId={course.id}
                            handleDeleteLesson={handleDeleteLesson}
                            onVideoClick={handleOpenVideoModal}
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-600 italic py-4">
                          Aucune leçon dans cette section.
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </SortableSectionItem>
              ))
            ) : (
              <p className="text-center text-gray-600">
                Aucune section trouvée pour ce cours. Ajoutez la première section !
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {isSectionModalOpen && (
        <SectionFormModal
          onClose={handleCloseSectionModal}
          onSubmit={handleSaveSection}
          sectionToEdit={sectionToEdit}
          courseSections={course.sections}
        />
      )}

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
        videoUrl={videoUrl}
      />

      {isLiveSessionModalOpen && (
        <LiveSessionFormModal
          onClose={closeLiveSessionModal}
          onSubmit={handleLiveSessionSubmit}
        />
      )}
    </div>
  );
};

export default TeacherLessonsPage;
