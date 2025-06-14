// src/components/LessonFormPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PhotoIcon,
  CubeIcon, // For AR content type
  CloudArrowUpIcon, // For upload icon
} from "@heroicons/react/24/outline";

const LessonFormPage = () => {
  const { courseId, lessonId } = useParams(); // lessonId will be present for edits
  const navigate = useNavigate();

  const [lesson, setLesson] = useState({
    title: "",
    content: "", // Maps to Lessons.content (text, file URL, external video URL)
    content_type: "text", // Default type
    course_id: courseId, // Directly from params
    is_subscriber_only: false, // Maps to Lessons.is_subscriber_only
  });
  const [modules, setModules] = useState([]); // Assuming lessons are linked to modules via a UI selection, though not directly in Lessons table in your schema. I will keep it for UI consistency if you intend to map it. If not, this can be removed.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null); // State to hold the uploaded file object for display

  // --- Mock Data Fetching ---
  useEffect(() => {
    const fetchCourseModulesAndLesson = async () => {
      try {
        // Simulate API call for modules (if you want to link lessons to modules in UI)
        const mockModules = [
          { id: "module-1", title: "Introduction au Developpement Web" },
          { id: "module-2", title: "Maîtrise de JavaScript" },
          { id: "module-3", title: "Frameworks Front-end Modernes" },
        ];
        setModules(mockModules);

        if (lessonId) {
          // Simulate fetching existing lesson for edit mode
          const mockExistingLesson = {
            id: lessonId,
            title: "Comprendre les Hooks React",
            // Example: A text lesson
            // content: "Une plongee approfondie dans useState, useEffect et les hooks personnalises.",
            // content_type: "text",

            // Example: An external video lesson
            // content: "https://www.youtube.com/watch?v=some_youtube_id",
            // content_type: "external_video_url",

            // Example: An uploaded video file lesson
            // content: "/uploads/my_react_hooks_lesson.mp4",
            // content_type: "uploaded_video_file",

            // Example: A PDF lesson
            content: "/uploads/dom_manipulation_guide.pdf",
            content_type: "pdf",

            course_id: courseId,
            is_subscriber_only: true, // This maps to is_preview in old code, now is_subscriber_only
          };
          setLesson(mockExistingLesson);

          // If the content is a file URL, set the file state for display
          if (
            mockExistingLesson.content_type === "uploaded_video_file" ||
            mockExistingLesson.content_type === "image" ||
            mockExistingLesson.content_type === "pdf" ||
            mockExistingLesson.content_type === "ar" ||
            mockExistingLesson.content_type === "other_file"
          ) {
            setFile({ name: mockExistingLesson.content.split("/").pop() || "Fichier Existant" });
          }
        }
      } catch (err) {
        setError("Echec du chargement des donnees.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseModulesAndLesson();
  }, [courseId, lessonId]);

  // --- File Dropzone Logic ---
  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0]; // Take only the first file
    if (uploadedFile) {
      setFile(uploadedFile);
      let newContentType;

      // Determine content_type based on file type
      if (uploadedFile.type.startsWith("video/")) {
        newContentType = "uploaded_video_file";
      } else if (uploadedFile.type.startsWith("image/")) {
        newContentType = "image";
      } else if (uploadedFile.type === "application/pdf") {
        newContentType = "pdf";
      } else if (uploadedFile.type.includes("glb") || uploadedFile.type.includes("usdz")) {
        // Basic check for common AR file types
        newContentType = "ar";
      } else {
        newContentType = "other_file"; // General fallback for other file types
      }

      setLesson((prev) => ({
        ...prev,
        content_type: newContentType,
        content: `/uploads/${uploadedFile.name}`, // Conceptual URL for the uploaded file
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // --- Form Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLesson((prev) => {
      let newState = { ...prev, [name]: type === "checkbox" ? checked : value };

      // When content_type changes, reset file and content for new input type
      if (name === "content_type") {
        setFile(null); // Clear file from dropzone preview
        newState.content = ""; // Clear content value for new type
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // In a real application, you would send this 'lesson' data to your backend API.
    // If 'file' exists and content_type implies an upload (e.g., uploaded_video_file, image, pdf, ar, other_file):
    //   You'd send the 'file' to a dedicated file upload endpoint first.
    //   The backend would store it (S3, local storage) and return the public URL.
    //   Then, you'd update 'lesson.content' with this actual URL before sending the lesson data.
    // For this mock, we are just using the conceptual path already set in 'onDrop'.

    try {
      if (lessonId) {
        console.log("Mise à jour de la leçon:", lesson);
        // await fetch(`/api/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(lesson), headers: { 'Content-Type': 'application/json' } });
        alert("Leçon mise à jour avec succès !");
      } else {
        console.log("Creation de la nouvelle leçon:", lesson);
        // await fetch(`/api/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(lesson), headers: { 'Content-Type': 'application/json' } });
        alert("Leçon creee avec succès !");
      }
      navigate(`/dashboard/courses/${courseId}/lessons`); // Redirect back to lessons list
    } catch (err) {
      setError("Echec de la sauvegarde de la leçon.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-center text-gray-600">
        Chargement du formulaire...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link
        to={`/dashboard/courses/${courseId}/lessons`}
        className="flex items-center text-e-bosy-purple hover:underline mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Retour aux leçons du cours
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {lessonId ? "Modifier la Leçon" : "Creer une Nouvelle Leçon"}
      </h1>
      <p className="text-gray-600 mb-8">
        Remplissez les details ci-dessous pour {lessonId ? "modifier" : "creer"} cette leçon.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {/* Lesson Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre de la leçon
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={lesson.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
            required
          />
        </div>

        {/* Module Selection (If you decide to keep modules linked visually in UI) */}
        {/* Removed module_id from Lessons table, so this is now purely UI/conceptual.
            If modules are needed for lessons, you might consider a join table or adding module_id back to Lessons.
            For now, I'm commenting it out to strictly follow your provided schema.
            If you still want it in UI, you'll need to decide how to manage its persistence.
        <div>
          <label htmlFor="module_id" className="block text-sm font-medium text-gray-700 mb-1">
            Module
          </label>
          <select
            id="module_id"
            name="module_id"
            value={lesson.module_id}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
            required // Or make it optional if not strictly tied in DB
          >
            <option value="">Selectionnez un module</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.title}
              </option>
            ))}
          </select>
        </div>
        */}

        {/* Content Type Selection */}
        <div>
          <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 mb-1">
            Type de contenu
          </label>
          <select
            id="content_type"
            name="content_type"
            value={lesson.content_type}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
          >
            <option value="text">Texte</option>
            <option value="external_video_url">Video (URL YouTube/Vimeo)</option>
            <option value="uploaded_video_file">Fichier Video (Upload)</option>
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
            <option value="ar">Realite Augmentee (AR)</option>
            <option value="other_file">Autre Fichier</option>
          </select>
        </div>

        {/* Dynamic Content Input based on content_type */}
        {lesson.content_type === "text" && (
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Contenu textuel de la leçon
            </label>
            <textarea
              id="content"
              name="content" // Maps to Lessons.content
              value={lesson.content}
              onChange={handleChange}
              rows="6"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
              placeholder="Ecrivez le contenu textuel de la leçon ici..."
            ></textarea>
            <p className="mt-2 text-sm text-gray-500">
              Le texte de la leçon sera stocke dans la colonne `content` de votre base de donnees.
            </p>
          </div>
        )}

        {lesson.content_type === "external_video_url" && (
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              URL Video Externe (YouTube/Vimeo)
            </label>
            <input
              type="url"
              id="content"
              name="content" // Maps to Lessons.content
              value={lesson.content}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
              placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              L'URL de la video externe sera stockee dans la colonne `content`.
            </p>
          </div>
        )}

        {(lesson.content_type === "uploaded_video_file" ||
          lesson.content_type === "image" ||
          lesson.content_type === "pdf" ||
          lesson.content_type === "ar" ||
          lesson.content_type === "other_file") && (
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Telecharger un fichier ({lesson.content_type.replace(/_/g, " ").toUpperCase()})
            </label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-e-bosy-purple transition duration-150 ease-in-out"
            >
              <input {...getInputProps()} id="file-upload" />
              <div className="text-center">
                {file ? (
                  <>
                    {lesson.content_type === "uploaded_video_file" && (
                      <VideoCameraIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    {lesson.content_type === "image" && (
                      <PhotoIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    {lesson.content_type === "pdf" && (
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    {lesson.content_type === "ar" && (
                      <CubeIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    {lesson.content_type === "other_file" && (
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    <p className="text-e-bosy-purple text-lg font-medium mt-2">
                      Fichier selectionne: {file.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Cliquez ou deposez un autre fichier pour le remplacer.
                    </p>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium text-e-bosy-purple hover:text-purple-500">
                        Cliquez pour telecharger
                      </span>{" "}
                      ou glissez-deposez ici
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {lesson.content_type === "uploaded_video_file" && "MP4, MOV, AVI (max 100MB)"}
                      {lesson.content_type === "image" && "PNG, JPG, GIF (max 10MB)"}
                      {lesson.content_type === "pdf" && "PDF (max 20MB)"}
                      {lesson.content_type === "ar" && "GLB, USDZ (max 50MB)"}
                      {lesson.content_type === "other_file" && "Tout type de fichier"}
                    </p>
                  </>
                )}
              </div>
            </div>
            {isDragActive && <p className="text-center text-e-bosy-purple mt-2">Deposez le fichier ici...</p>}
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                L'URL de ce fichier sera stockee dans la colonne `content` après son telechargement sur le serveur.
              </p>
            )}
          </div>
        )}

        {/* Is Subscriber Only Checkbox (replaces is_preview) */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_subscriber_only"
            name="is_subscriber_only"
            checked={lesson.is_subscriber_only}
            onChange={handleChange}
            className="h-4 w-4 text-e-bosy-purple border-gray-300 rounded focus:ring-e-bosy-purple"
          />
          <label htmlFor="is_subscriber_only" className="ml-2 block text-sm text-gray-900">
            Reserve aux abonnes (non disponible en aperçu gratuit)
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-e-bosy-purple hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-e-bosy-purple"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sauvegarde...
              </span>
            ) : lessonId ? (
              "Mettre à jour la Leçon"
            ) : (
              "Creer la Leçon"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonFormPage;