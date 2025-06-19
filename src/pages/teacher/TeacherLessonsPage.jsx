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
  Bars3Icon, // Icon for drag handle (was ArrowsUpDownIcon)
} from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for sections and lessons

// DND Kit Imports
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners, // Strategy for finding drop target
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove, // Utility to reorder arrays
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import SectionFormModal from "../../components/SectionFormModal"; // Import the new modal
import { getData, postData, putData, deleteData } from "../../services/ApiFetch";
import { toast } from "react-toastify";

// --- SortableItem Component for Lessons ---
// This component wraps each draggable lesson
const SortableLessonItem = ({ lesson, courseId, handleDeleteLesson }) => {
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
    opacity: isDragging ? 0.5 : 1, // Visual feedback for dragging
    zIndex: isDragging ? 100 : 'auto', // Keep dragged item on top
    boxShadow: isDragging ? '0px 4px 10px rgba(0, 0, 0, 0.1)' : 'none',
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case "external_video_url":
      case "uploaded_video_file":
        return <VideoCameraIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />;
      case "text":
      case "pdf":
        return <DocumentTextIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />;
      case "image":
        return <PhotoIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />;
      case "ar":
        return <CubeTransparentIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />;
      default:
        return <PlayCircleIcon className="h-4 w-4 inline-block mr-1 text-gray-500" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} // Important for accessibility and default behaviors
      className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between cursor-grab"
    >
      <div className="flex-grow flex items-center">
        {/* Drag handle */}
        <button
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab mr-3"
          {...listeners} // Listeners for dragging are applied here
        >
          <Bars3Icon className="h-5 w-5" />
        </button>
        <span className="text-md font-bold text-gray-800 mr-2 flex-shrink-0">
          {lesson.position_in_section}.
        </span>
        <h3 className="text-md font-semibold text-gray-800 flex-grow">
          {lesson.title}
        </h3>
        {lesson.is_subscriber_only && (
          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex-shrink-0">
            Abonnés seulement
          </span>
        )}
        {!lesson.is_subscriber_only && (
          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
            Gratuit (Aperçu)
          </span>
        )}
        <span className="ml-auto text-gray-500 text-sm flex-shrink-0 flex items-center">
          {getContentTypeIcon(lesson.content_type)}
          {lesson.content_type.replace(/_/g, " ")}
        </span>
      </div>

      {/* Lesson Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-3 sm:mt-0 sm:ml-6 justify-end flex-shrink-0">
        <Link
          to={`/dashboard/courses/${courseId}/lessons/${lesson.id}/edit`}
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


// --- SortableItem Component for Sections ---
// This component wraps each draggable section
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
    opacity: isDragging ? 0.5 : 1, // Visual feedback for dragging
    zIndex: isDragging ? 10 : 'auto', // Sections should be under lessons if dragging across
    boxShadow: isDragging ? '0px 4px 10px rgba(0, 0, 0, 0.1)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 border-b pb-3 -mx-6 px-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          {/* Drag handle for sections */}
          <button
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab mr-3"
            {...listeners} // Listeners for dragging are applied here
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
      {children} {/* Renders the lessons for this section */}
    </div>
  );
};

const TeacherLessonsPage = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for section management modal
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null); // null for add, section object for edit

  // DND Kit Sensors configuration
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
          id: data.course.courseId,
          title: data.course.title,
          status: data.course.status,
          sections: data.sections.map(section => ({
            id: uuidv4(), // Générer un ID unique pour la section
            title: section.title,
            order: section.order
          }))
        });

        setLessons(data.lessons.map(lesson => ({
          id: lesson.lessonId,
          section_id: lesson.sectionTitle, // Utiliser sectionTitle comme identifiant de section
          position_in_section: lesson.position,
          title: lesson.title,
          content: lesson.content,
          content_type: lesson.contentType,
          course_id: lesson.courseId,
          is_subscriber_only: lesson.isSubscriberOnly
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

  // Sort sections by their 'order' property for display
  const sortedSections = useMemo(() => {
    if (!course?.sections) return [];
    return [...course.sections].sort((a, b) => a.order - b.order);
  }, [course]);

  // Helper to get lessons for a specific section, sorted by position
  const getLessonsForSection = (sectionTitle) => {
    return lessons
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
    setSectionToEdit(null); // Clear section to edit state
  };

  const handleSaveSection = async (newTitle) => {
    try {
        if (sectionToEdit) {
            // Mise à jour d'une section existante
            const [data, error] = await putData(`courses/${courseId}/sections/${encodeURIComponent(sectionToEdit.title)}`, {
                title: newTitle,
                order: sectionToEdit.order
            });
            
            if (error) throw error;

            // Mettre à jour le state des sections
            setCourse(prevCourse => ({
                ...prevCourse,
                sections: prevCourse.sections.map(sec =>
                    sec.id === sectionToEdit.id ? { ...sec, title: newTitle } : sec
                )
            }));

            // Mettre à jour les leçons avec le nouveau titre de section
            setLessons(prevLessons => prevLessons.map(lesson =>
                lesson.section_id === sectionToEdit.title
                    ? { ...lesson, section_id: newTitle }
                    : lesson
            ));
            
            toast.success("Section mise à jour avec succès");
        } else {
            // Création d'une nouvelle section
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
        // Réorganisation des sections
        const activeSection = course.sections.find(sec => sec.id === active.id);
        const overSection = course.sections.find(sec => sec.id === over.id);

        if (!activeSection || !overSection) return;

        const [, error] = await postData(`courses/${courseId}/sections/reorder`, {
          courseId: parseInt(courseId),
          sectionId: parseInt(activeSection.order), // Utiliser l'order comme identifiant
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
        // Réorganisation des leçons (code existant)
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

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-center text-gray-600">
        Chargement du cours et des leçons...
      </div>
    );
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
      {/* Back to Courses Link */}
      <Link
        to="/dashboard/courses"
        className="flex items-center text-e-bosy-purple hover:underline mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Retour aux Cours
      </Link>

      {/* Course Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
      <p className="text-gray-600 mb-4">Gérer les leçons et les sections pour ce cours.</p>

      {/* Course Status and Action Buttons */}
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
            to={`/dashboard/courses/${course.id}/lessons/add`}
            className="flex items-center px-4 py-2 bg-e-bosy-purple text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter une Leçon
          </Link>
          <Link
            to={`/dashboard/live-sessions/schedule?courseId=${course.id}`}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
          >
            <VideoCameraIcon className="h-5 w-5 mr-2" />
            Session Live Générale
          </Link>
        </div>
      </div>

      {/* DndContext for both sections and lessons */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        {/* SortableContext for Sections */}
        <SortableContext
          items={sortedSections.map(sec => sec.id)} // IDs of sections
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
                  {/* SortableContext for Lessons within this Section */}
                  <SortableContext
                    items={getLessonsForSection(section.title).map(lesson => lesson.id)} // Utiliser section.title
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4 pt-2">
                      {getLessonsForSection(section.title).length > 0 ? ( // Utiliser section.title
                        getLessonsForSection(section.title).map((lesson) => ( // Utiliser section.title
                          <SortableLessonItem
                            key={lesson.id}
                            lesson={lesson}
                            courseId={course.id}
                            handleDeleteLesson={handleDeleteLesson}
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-600 italic py-4">
                          Aucune leçon dans cette section.
                        </p>
                      )}
                    </div>
                    {console.log('Sections:', sortedSections)}
                    {console.log('Lessons:', lessons)}
                    {console.log('Lessons for section:', section.title, getLessonsForSection(section.title))}
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
    </div>
  );
};

export default TeacherLessonsPage;