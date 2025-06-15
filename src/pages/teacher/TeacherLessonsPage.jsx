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
      try {
        const mockCourse = {
          id: courseId,
          title: "Developpement Web Fullstack",
          status: "Published",
          sections: [
            { id: "sec-1", title: "Introduction", order: 1 },
            { id: "sec-2", title: "HTML & CSS Avancé", order: 2 },
            { id: "sec-3", title: "JavaScript Essentiel", order: 3 },
          ],
        };
        setCourse(mockCourse);

        const mockLessons = [
          {
            id: "lesson-1", section_id: "sec-1", position_in_section: 1,
            title: "HTML Essentiel", content: "Apprenez les bases de la structure HTML.", content_type: "text",
            course_id: courseId, is_subscriber_only: false,
          },
          {
            id: "lesson-2", section_id: "sec-1", position_in_section: 2,
            title: "CSS Styles et Mise en Page", content: "https://www.youtube.com/embed/some_css_video", content_type: "external_video_url",
            course_id: courseId, is_subscriber_only: true,
          },
          {
            id: "lesson-3", section_id: "sec-2", position_in_section: 1,
            title: "Introduction à JavaScript (fichier)", content: "/uploads/js_intro.mp4", content_type: "uploaded_video_file",
            course_id: courseId, is_subscriber_only: false,
          },
          {
            id: "lesson-4", section_id: "sec-2", position_in_section: 2,
            title: "Les fondations de React", content: "/uploads/react_basics.pdf", content_type: "pdf",
            course_id: courseId, is_subscriber_only: true,
          },
          {
            id: "lesson-5", section_id: "sec-3", position_in_section: 1,
            title: "Images Responsives", content: "/uploads/responsive_image.jpg", content_type: "image",
            course_id: courseId, is_subscriber_only: false,
          },
          {
            id: "lesson-6", section_id: "sec-3", position_in_section: 2,
            title: "Modèle 3D d'une App", content: "/uploads/app_model.glb", content_type: "ar",
            course_id: courseId, is_subscriber_only: true,
          },
          {
            id: "lesson-7", section_id: "sec-1", position_in_section: 3,
            title: "Flexbox et Grid", content: "Maîtrisez les mises en page modernes avec Flexbox et Grid CSS.", content_type: "text",
            course_id: courseId, is_subscriber_only: true,
          },
        ];

        setLessons(mockLessons); // No need to pre-sort here, DND will manage.
      } catch (err) {
        setError("Échec du chargement du cours et des leçons.");
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
  const getLessonsForSection = (sectionId) => {
    return lessons
      .filter((lesson) => lesson.section_id === sectionId)
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

  const handleSaveSection = (newTitle) => {
    if (sectionToEdit) {
      setCourse((prevCourse) => ({
        ...prevCourse,
        sections: prevCourse.sections.map((sec) =>
          sec.id === sectionToEdit.id ? { ...sec, title: newTitle } : sec
        ),
      }));
      console.log("Section updated:", { ...sectionToEdit, title: newTitle });
    } else {
      const newSection = {
        id: uuidv4(),
        title: newTitle,
        order: course.sections.length + 1,
      };
      setCourse((prevCourse) => ({
        ...prevCourse,
        sections: [...prevCourse.sections, newSection].map((sec, index) => ({ ...sec, order: index + 1 })),
      }));
      console.log("New section added:", newSection);
    }
    handleCloseSectionModal();
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette section ? Toutes les leçons de cette section seront également supprimées.")) {
      setCourse((prevCourse) => ({
        ...prevCourse,
        sections: prevCourse.sections
          .filter((sec) => sec.id !== sectionId)
          .map((sec, index) => ({ ...sec, order: index + 1 })), // Re-order remaining sections
      }));
      setLessons((prevLessons) => prevLessons.filter((lesson) => lesson.section_id !== sectionId));
      console.log(`Section with ID: ${sectionId} and its lessons deleted.`);
    }
  };

  const handleDeleteLesson = (lessonId) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la leçon "${
          lessons.find((l) => l.id === lessonId)?.title
        }" ?`
      )
    ) {
      setLessons((prevLessons) => {
        const updatedLessons = prevLessons.filter((lesson) => lesson.id !== lessonId);
        // Re-calculate positions in the affected section
        const affectedSectionId = prevLessons.find(l => l.id === lessonId)?.section_id;
        return updatedLessons.map(lesson => {
            if (lesson.section_id === affectedSectionId) {
                const lessonsInThisSection = updatedLessons.filter(l => l.section_id === affectedSectionId).sort((a,b) => a.position_in_section - b.position_in_section);
                const newPos = lessonsInThisSection.findIndex(l => l.id === lesson.id) + 1;
                return {...lesson, position_in_section: newPos};
            }
            return lesson;
        });
      });
      console.log(`Deleting lesson with ID: ${lessonId}`);
    }
  };


  // --- DND Kit onDragEnd Handler ---
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return; // No change or dropped on itself
    }

    // Determine if it's a section being dragged
    const isSectionDrag = course.sections.some(s => s.id === active.id);

    if (isSectionDrag) {
      // Logic for reordering sections
      const oldIndex = course.sections.findIndex((sec) => sec.id === active.id);
      const newIndex = course.sections.findIndex((sec) => sec.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setCourse((prevCourse) => {
          const newSections = arrayMove(prevCourse.sections, oldIndex, newIndex);
          // Re-assign 'order' property based on new array index
          const reorderedAndNumberedSections = newSections.map((sec, index) => ({
            ...sec,
            order: index + 1,
          }));
          console.log("Sections reordered:", reorderedAndNumberedSections);
          // In a real app, send API request to update section orders
          return { ...prevCourse, sections: reorderedAndNumberedSections };
        });
      }
    } else {
      // Logic for reordering lessons (within or between sections)
      const activeLesson = lessons.find(l => l.id === active.id);
      const overLesson = lessons.find(l => l.id === over.id);

      if (!activeLesson) return;

      const oldSectionId = activeLesson.section_id;
      const newSectionId = overLesson ? overLesson.section_id : over.id; // If over is a section, use its ID

      setLessons((prevLessons) => {
        let updatedLessons = [...prevLessons];

        // 1. Remove the active lesson from its current position
        const activeLessonIndex = updatedLessons.findIndex(l => l.id === active.id);
        const [movedLesson] = updatedLessons.splice(activeLessonIndex, 1);

        // 2. Determine target index to insert
        let targetIndex;
        if (overLesson) {
          // Dropped over another lesson
          targetIndex = updatedLessons.findIndex(l => l.id === over.id);
          // Adjust target index if dropping below the overLesson (important for visual stability)
          const overLessonIndex = prevLessons.findIndex(l => l.id === over.id);
          const activeLessonOriginalIndex = prevLessons.findIndex(l => l.id === active.id);

          if (oldSectionId === newSectionId && activeLessonOriginalIndex < overLessonIndex) {
            // Moving downwards within the same section, insert after the target
            targetIndex++;
          }
        } else {
          // Dropped over a section (likely an empty one or at the end of a section)
          // Find the last lesson in the target section, or the end of the entire list if no lessons in section
          const lessonsInTargetSection = updatedLessons.filter(l => l.section_id === newSectionId);
          if (lessonsInTargetSection.length > 0) {
            const lastLessonInTarget = lessonsInTargetSection[lessonsInTargetSection.length - 1];
            targetIndex = updatedLessons.findIndex(l => l.id === lastLessonInTarget.id) + 1;
          } else {
            // Target section is empty, insert at the end of existing lessons (then positions will be re-calculated)
            targetIndex = updatedLessons.length;
          }
        }

        // 3. Update the section_id if moved to a different section
        movedLesson.section_id = newSectionId;

        // 4. Insert the moved lesson at the new position
        updatedLessons.splice(targetIndex, 0, movedLesson);

        // 5. Re-calculate `position_in_section` for affected sections
        // This is crucial because positions change when lessons are moved in/out/within sections.
        const sectionsToReorder = new Set([oldSectionId, newSectionId]);
        sectionsToReorder.forEach(secId => {
            const lessonsInCurrentSection = updatedLessons
                .filter(l => l.section_id === secId)
                .sort((a,b) => {
                    // Stable sort based on their current order in the `updatedLessons` array
                    return updatedLessons.findIndex(item => item.id === a.id) - updatedLessons.findIndex(item => item.id === b.id);
                });

            lessonsInCurrentSection.forEach((lesson, index) => {
                lesson.position_in_section = index + 1;
            });
        });

        console.log("Lessons reordered:", updatedLessons);
        // In a real app, send API requests to update lesson positions and section_id on the backend.
        return updatedLessons;
      });
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
                    items={getLessonsForSection(section.id).map(lesson => lesson.id)} // IDs of lessons in this section
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4 pt-2">
                      {getLessonsForSection(section.id).length > 0 ? (
                        getLessonsForSection(section.id).map((lesson) => (
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