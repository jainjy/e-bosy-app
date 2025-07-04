import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CloudArrowUpIcon, // For upload icon
} from "@heroicons/react/24/outline";
import { postData, putData, getData } from "../../services/ApiFetch";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const LessonFormPage = () => {
  const { courseId, lessonId } = useParams(); // lessonId will be present for edits
  const navigate = useNavigate();

  const [lesson, setLesson] = useState({
    title: "",
    content: "", // This will hold URL for external video, or be empty for file uploads
    contentType: "external_video_url", // Default to external video URL
    course_id: courseId,
    isSubscriberOnly: false,
    sectionTitle: "", // Ajout du titre de la section
    position: 1, // Position par défaut
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null); // State to hold the uploaded file object for display
  const [sections, setSections] = useState([]); // State for sections

  // --- Fetch Lesson Data ---
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        if (lessonId) {
          const [data, error] = await getData(`courses/lessons/${lessonId}`);
          if (error) throw error;

          setLesson({
            title: data.title,
            content: data.content,
            contentType: data.contentType,
            course_id: data.courseId,
            isSubscriberOnly: data.isSubscriberOnly,
            sectionTitle: data.sectionTitle,
            position: data.position
          });

          // If it's an uploaded file, set the file state for display
          if (
            data.contentType === "video" || // Changed from uploaded_video_file
            data.contentType === "pdfs" // Changed from pdf
          ) {
            setFile({ name: data.content.split("/").pop() || "Fichier Existant" });
          }
        }
      } catch (err) {
        setError("Échec du chargement des données.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, lessonId]);

  // --- Fetch Sections ---
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const [data, error] = await getData(`courses/${courseId}/sections`);
        if (error) throw error;
        setSections(data);
      } catch (err) {
        console.error('Erreur lors du chargement des sections:', err);
        setError('Impossible de charger les sections');
      }
    };

    fetchSections();
  }, [courseId]);

  // --- File Dropzone Logic ---
  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      let newContentType;

      // Aligner les types avec le backend
      if (uploadedFile.type.startsWith("video/")) {
        newContentType = "video"; // Matches backend folder "videos"
      } else if (uploadedFile.type === "application/pdf") {
        newContentType = "pdfs"; // Matches backend folder "pdfs"
      } else {
        // Fallback for unsupported file types, though dropzone can be configured to only accept certain types
        toast.error("Type de fichier non supporté.");
        setFile(null);
        return;
      }

      setLesson((prev) => ({
        ...prev,
        contentType: newContentType,
        content: "", // Clear content as it's now a file upload
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Accept only video and PDF files
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'application/pdf': ['.pdf']
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLesson((prev) => {
      let newState = { ...prev, [name]: type === "checkbox" ? checked : value };

      if (name === "contentType") {
        setFile(null); // Clear file from dropzone preview when content type changes
        newState.content = ""; // Clear content value for new type
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', lesson.title);
      formData.append('courseId', courseId);
      formData.append('contentType', lesson.contentType);
      formData.append('isSubscriberOnly', lesson.isSubscriberOnly);
      formData.append('sectionTitle', lesson.sectionTitle || '');
      formData.append('position', lesson.position || 1);

      // Handle content based on type
      if (lesson.contentType === "video" || lesson.contentType === "pdfs") {
        if (file) {
          formData.append('contentFile', file);
        } else if (!lessonId) { // If creating a new lesson and no file is selected for file-based types
          throw new Error("Veuillez télécharger un fichier pour ce type de contenu.");
        }
        // If editing and no new file is selected, the existing content path will be used by backend
        // We don't append 'content' string for file uploads
      } else if (lesson.contentType === "external_video_url") {
        if (!lesson.content) {
          throw new Error("Veuillez entrer l'URL de la vidéo externe.");
        }
        formData.append('content', lesson.content);
      } else {
        // This case should ideally not be hit with the current select options
        formData.append('content', lesson.content || '');
      }

      if (lessonId) {
        const [data, error] = await putData(`courses/lessons/${lessonId}`, formData, true);
        if (error) throw error;
        toast.success("Leçon mise à jour avec succès !");
      } else {
        const [data, error] = await postData('courses/lessons', formData, true);
        if (error) throw error;
        toast.success("Leçon créée avec succès !");
      }

      navigate(`/dashboard/courses/${courseId}/lessons`);
    } catch (err) {
      const errorMessage = err.errors?.Content?.[0] || err.message || "Échec de la sauvegarde de la leçon.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeLabel = (contentType) => {
    switch (contentType) {
      case 'video':
        return 'VIDÉO (Upload)';
      case 'pdfs':
        return 'PDF';
      case 'external_video_url':
        return 'VIDÉO (Lien Externe)';
      default:
        return contentType.toUpperCase();
    }
  };

  const getFileTypeMessage = (contentType) => {
    switch (contentType) {
      case 'video':
        return "MP4, MOV, AVI, WEBM (max 100MB)";
      case 'pdfs':
        return "PDF (max 20MB)";
      default:
        return "Type de fichier non supporté";
    }
  };

  if (loading) {
    return (
      <LoadingSpinner />
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

        {/* Section Selector */}
        <div>
          <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <select
            id="sectionTitle"
            name="sectionTitle"
            value={lesson.sectionTitle}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
            required
          >
            <option value="">Sélectionner une section</option>
            {sections.map(section => (
              <option key={section.id} value={section.title}>
                {section.title}
              </option>
            ))}
          </select>
        </div>

        {/* Content Type Selection */}
        <div>
          <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
            Type de contenu
          </label>
          <select
            id="contentType"
            name="contentType"
            value={lesson.contentType}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-e-bosy-purple focus:border-e-bosy-purple sm:text-sm"
          >
            <option value="external_video_url">Video (URL YouTube/Vimeo)</option>
            <option value="video">Video (Upload)</option>
            <option value="pdfs">PDF</option>
          </select>
        </div>

        {/* Conditional Content Input */}
        {lesson.contentType === "external_video_url" && (
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

        {(lesson.contentType === "video" || lesson.contentType === "pdfs") && (
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Télécharger un fichier ({getContentTypeLabel(lesson.contentType)})
            </label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-e-bosy-purple transition duration-150 ease-in-out"
            >
              <input {...getInputProps()} id="file-upload" />
              <div className="text-center">
                {file ? (
                  <>
                    {lesson.contentType === "video" && (
                      <VideoCameraIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    {lesson.contentType === "pdfs" && (
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
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
                      {getFileTypeMessage(lesson.contentType)}
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
            id="isSubscriberOnly"
            name="isSubscriberOnly"
            checked={lesson.isSubscriberOnly}
            onChange={handleChange}
            className="h-4 w-4 text-e-bosy-purple border-gray-300 rounded focus:ring-e-bosy-purple"
          />
          <label htmlFor="isSubscriberOnly" className="ml-2 block text-sm text-gray-900">
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
              <LoadingSpinner />
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