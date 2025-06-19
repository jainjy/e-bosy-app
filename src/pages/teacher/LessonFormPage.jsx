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
import { postData, putData, getData } from "../../services/ApiFetch";
import { toast } from "react-toastify";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import '../../styles/editor.css';

const LessonFormPage = () => {
  const { courseId, lessonId } = useParams(); // lessonId will be present for edits
  const navigate = useNavigate();

  const [lesson, setLesson] = useState({
    title: "",
    content: "",
    content_type: "text",
    course_id: courseId,
    is_subscriber_only: false,
    section_title: "", // Ajout du titre de la section
    position: 1, // Position par défaut
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null); // State to hold the uploaded file object for display
  const [sections, setSections] = useState([]); // State for sections

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: lesson.content || '',
    editable: true,
    onUpdate: ({ editor }) => {
      setLesson(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(lesson.content, false)
    }
  }, [lesson.content, editor])

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
            content_type: data.contentType,
            course_id: data.courseId,
            is_subscriber_only: data.isSubscriberOnly,
            section_title: data.sectionTitle,
            position: data.position
          });

          // Si c'est un fichier, mettre à jour l'état du fichier
          if (
            data.contentType === "uploaded_video_file" ||
            data.contentType === "image" ||
            data.contentType === "pdf" ||
            data.contentType === "ar" ||
            data.contentType === "other_file"
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
        newContentType = "videos";
      } else if (uploadedFile.type.startsWith("image/")) {
        newContentType = "images";
      } else if (uploadedFile.type === "application/pdf") {
        newContentType = "pdfs";
      } else if (uploadedFile.type.includes("glb") || uploadedFile.type.includes("usdz")) {
        newContentType = "ar";
      }

      setLesson((prev) => ({
        ...prev,
        content_type: newContentType,
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

    try {
      const formData = new FormData();
      formData.append('title', lesson.title);
      formData.append('courseId', courseId);
      formData.append('contentType', lesson.content_type);
      formData.append('isSubscriberOnly', lesson.is_subscriber_only);
      formData.append('sectionTitle', lesson.section_title || '');
      formData.append('position', lesson.position || 1);
      formData.append('content', 'contenue'); // Envoyer une chaîne vide pour le champ content

      // Pour les types avec fichiers
      if (file && (lesson.content_type === "video" || 
                   lesson.content_type === "image" || 
                   lesson.content_type === "pdf" || 
                   lesson.content_type === "ar")) {
        formData.append('contentFile', file);
        
      } 
      // Pour les types texte ou URL
      else {
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
        return 'VIDÉO';
      case 'image':
        return 'IMAGE';
      case 'pdf':
        return 'PDF';
      case 'ar':
        return 'RÉALITÉ AUGMENTÉE';
      default:
        return contentType.toUpperCase();
    }
  };

  const getFileTypeMessage = (contentType) => {
    switch (contentType) {
      case 'videos':
        return "MP4, MOV, AVI (max 100MB)";
      case 'images':
        return "PNG, JPG, GIF (max 10MB)";
      case 'pdfs':
        return "PDF (max 20MB)";
      case 'ar':
        return "GLB, USDZ (max 50MB)";
      default:
        return "Type de fichier non supporté";
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

        {/* Section Selector */}
        <div>
          <label htmlFor="section_title" className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <select
            id="section_title"
            name="section_title"
            value={lesson.section_title}
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
            <option value="videos">Video (Upload)</option>
            <option value="images">Image</option>
            <option value="pdfs">PDF</option>
            <option value="ar">Contenu AR</option>
          </select>
        </div>

        {/* Dynamic Content Input based on content_type */}
        {lesson.content_type === "text" && (
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Contenu textuel de la leçon
            </label>
            <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl">
              <EditorContent editor={editor} />
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
              >
                Gras
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
              >
                Italique
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
              >
                Liste
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Le texte de la leçon sera stocké dans la colonne `content` de votre base de données.
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

        {(lesson.content_type === "videos" ||
          lesson.content_type === "images" ||
          lesson.content_type === "pdfs" ||
          lesson.content_type === "ar") && (
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
              Télécharger un fichier ({getContentTypeLabel(lesson.content_type)})
            </label>
            <div
              {...getRootProps()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-e-bosy-purple transition duration-150 ease-in-out"
            >
              <input {...getInputProps()} id="file-upload" />
              <div className="text-center">
                {file ? (
                  <>
                    {lesson.content_type === "videos" && (
                      <VideoCameraIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    {lesson.content_type === "images" && (
                      <PhotoIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    {lesson.content_type === "pdfs" && (
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
                    )}
                    {lesson.content_type === "ar" && (
                      <CubeIcon className="mx-auto h-12 w-12 text-e-bosy-purple" />
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
                      {getFileTypeMessage(lesson.content_type)}
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