// src/components/LessonFormPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusCircleIcon,
  CubeIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

const LessonFormPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState({
    title: "",
    description: "", // Corresponds to Lessons.content
    video_url: "", // Used specifically for external video URLs
    content_type: "text", // Default type
    content_value: "", // Will hold file URL or text content (or internal video URL)
    module_id: "",
    is_preview: false,
  });
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null); // State to hold the uploaded file object

  // --- Mock Data Fetching ---
  useEffect(() => {
    const fetchCourseModulesAndLesson = async () => {
      try {
        const mockModules = [
          { id: "module-1", title: "Introduction to React" },
          { id: "module-2", title: "Advanced State Management" },
          { id: "module-3", title: "Building APIs with Node.js" },
        ];
        setModules(mockModules);

        if (lessonId) {
          // Simulate fetching existing lesson for edit mode
          const mockExistingLesson = {
            id: lessonId,
            title: "Understanding React Hooks",
            description: "A deep dive into useState, useEffect, and custom hooks.",
            // Example: Lesson with external video URL
            // video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            // content_type: "external_video_url",
            // content_value: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Embed URL for external video

            // Example: Lesson with uploaded video file
            video_url: "", // Not used for uploaded video
            content_type: "uploaded_video_file",
            content_value: "/uploads/my_react_hooks_lesson.mp4", // Conceptual path to uploaded file
            module_id: "module-1",
            is_preview: true,
          };
          setLesson(mockExistingLesson);
          if (mockExistingLesson.content_type === "uploaded_video_file" || mockExistingLesson.content_type === "image" || mockExistingLesson.content_type === "pdf" || mockExistingLesson.content_type === "ar" || mockExistingLesson.content_type === "other_file") {
            // If it's a file type, we might need to display its name
            setFile({ name: mockExistingLesson.content_value.split('/').pop() || 'Existing File' });
          }
        }
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseModulesAndLesson();
  }, [courseId, lessonId]);

  // --- File Dropzone Logic ---
  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      let newContentType = lesson.content_type; // Keep current content type by default

      // Determine content_type based on file type if not already set or specifically for files
      if (uploadedFile.type.startsWith("video/") && lesson.content_type !== "external_video_url") {
        newContentType = "uploaded_video_file"; // Set to our new specific type for uploaded videos
      } else if (uploadedFile.type.startsWith("image/")) {
        newContentType = "image";
      } else if (uploadedFile.type === "application/pdf") {
        newContentType = "pdf";
      } else if (uploadedFile.type.includes("glb") || uploadedFile.type.includes("usdz")) { // Basic check for AR
        newContentType = "ar";
      } else {
        newContentType = "other_file"; // General fallback for other files
      }

      setLesson((prev) => ({
        ...prev,
        content_type: newContentType,
        content_value: `/uploads/${uploadedFile.name}`, // Conceptual URL for the uploaded file
        video_url: "", // Clear video_url if a file is uploaded
      }));
    }
  }, [lesson.content_type]); // Re-run if lesson.content_type changes

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // --- Form Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setLesson((prev) => {
      let newState = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Special handling for content_type change
      if (name === "content_type") {
        // Clear content_value and video_url when type changes
        newState.content_value = "";
        newState.video_url = "";
        setFile(null); // Clear any previously selected file

        // If the new content type is 'text', ensure description is the main content
        if (value === 'text') {
            newState.description = prev.description || ""; // Keep existing description or make empty
        } else {
            // If changing from 'text' to a file/video type, clear description if it was used as primary content
            // This logic might need refinement based on how 'description' maps to 'content' in your DB
            // For now, let's keep it as is, as 'description' is separate from 'content_value' in the DB.
        }
      }
      return newState;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real app, you'd handle file upload to backend first
      // If `file` exists and content_type is 'uploaded_video_file', 'image', 'pdf', 'ar', 'other_file':
      //   const fileUrl = await uploadFile(file); // Call your backend upload API
      //   lesson.content_value = fileUrl; // Update content_value with actual URL

      if (lessonId) {
        console.log("Updating lesson:", lesson);
        alert("Leçon mise à jour avec succès !");
      } else {
        console.log("Creating new lesson:", lesson);
        alert("Leçon créée avec succès !");
      }
      navigate(`/dashboard/courses/${courseId}/lessons`);
    } catch (err) {
      setError("Failed to save lesson.");
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
        {lessonId ? "Modifier la Leçon" : "Créer une Nouvelle Leçon"}
      </h1>
      <p className="text-gray-600 mb-8">
        Remplissez les détails ci-dessous pour {lessonId ? "modifier" : "créer"} cette leçon.
      </p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

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

        {/* Module Selection */}
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
            required
          >
            <option value="">Sélectionnez un module</option>
            {modules.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.title}
              </option>
            ))}
          </select>
        </div>

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
            <option value="external_video_url">Vidéo (URL YouTube/Vimeo)</option>
            <option value="uploaded_video_file">Fichier Vidéo (Upload)</option> {/* New option */}
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
            <option value="ar">Réalité Augmentée (AR)</option>
            <option value="other_file">Autre Fichier</option>
          </select>
        </div>

        {/* Dynamic Content Input based on content_type */}
        {lesson.content_type === "text" && (
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Contenu textuel
            </label>
            <textarea
              id="description"
              name="description"
              value={lesson.description}
              onChange={handleChange}
              rows="6"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
              placeholder="Écrivez le contenu de la leçon ici..."
            ></textarea>
            <p className="mt-2 text-sm text-gray-500">
                Le texte de la leçon sera stocké dans la colonne `content` de votre base de données.
            </p>
          </div>
        )}

        {lesson.content_type === "external_video_url" && (
          <div>
            <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
              URL Vidéo Externe (YouTube/Vimeo)
            </label>
            <input
              type="url"
              id="video_url"
              name="video_url"
              value={lesson.video_url}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
              placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
                L'URL de la vidéo sera stockée dans la colonne `video_url`.
            </p>
          </div>
        )}

        {(lesson.content_type === "uploaded_video_file" || lesson.content_type === "image" || lesson.content_type === "pdf" || lesson.content_type === "ar" || lesson.content_type === "other_file") && (
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Télécharger un fichier ({lesson.content_type.replace(/_/g, ' ').toUpperCase()})
            </label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-e-bosy-purple transition duration-150 ease-in-out"
            >
              <input {...getInputProps()} id="file-upload" />
              <div className="text-center">
                {file ? (
                  <>
                    {lesson.content_type === "uploaded_video_file" && <VideoCameraIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />}
                    {lesson.content_type === "image" && <PhotoIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />}
                    {lesson.content_type === "pdf" && <DocumentTextIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />}
                    {lesson.content_type === "ar" && <CubeIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />}
                    {lesson.content_type === "other_file" && <CloudArrowUpIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />}
                    <p className="text-e-bosy-purple text-lg font-medium mt-2">
                      Fichier sélectionné: {file.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Cliquez ou déposez un autre fichier pour le remplacer.
                    </p>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium text-e-bosy-purple hover:text-purple-500">
                        Cliquez pour télécharger
                      </span>{" "}
                      ou glissez-déposez ici
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
            {isDragActive && <p className="text-center text-e-bosy-purple mt-2">Déposez le fichier ici...</p>}
            {file && (
                <p className="mt-2 text-sm text-gray-500">
                    L'URL de ce fichier sera stockée dans la colonne `content_value` après téléchargement sur le serveur.
                </p>
            )}
          </div>
        )}


        {/* Is Preview Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_preview"
            name="is_preview"
            checked={lesson.is_preview}
            onChange={handleChange}
            className="h-4 w-4 text-e-bosy-purple border-gray-300 rounded focus:ring-e-bosy-purple"
          />
          <label htmlFor="is_preview" className="ml-2 block text-sm text-gray-900">
            Leçon gratuite (aperçu)
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
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sauvegarde...
              </span>
            ) : (
              lessonId ? "Mettre à jour la Leçon" : "Créer la Leçon"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonFormPage;