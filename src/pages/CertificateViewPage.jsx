import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowDownTrayIcon, ShareIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { QRCode } from 'react-qr-code';
import { getData } from '../services/ApiFetch';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Navbar from '../Components/Navbar';
import generateCertificatePDF from '../utils/generateCertificatePDF';
import html2canvas from 'html2canvas';

const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5173';

const CertificateViewPage = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data] = await getData(`enrollments/certificates/${id}`);
        if (data) {
          setCertificate({
            certificateId: data.certificateId,
            courseTitle: data.course?.title || 'Cours inconnu',
            studentName: `${data.user?.firstName} ${data.user?.lastName}`.toUpperCase(),
            issueDate: new Date(data.issuedAt).toLocaleDateString(),
            completionDate: new Date(data.issuedAt).toLocaleDateString(),
            verificationCode: data.verificationCode,
            instructor: data.course?.teacher?.firstName ? `${data.course.teacher.firstName} ${data.course.teacher.lastName}` : 'Instructeur inconnu',
            duration: data.course?.duration || 'Durée inconnue',
            description: data.course?.description || 'Ce certificat atteste de la réussite du cours.',
            imageUrl: data.course?.thumbnailUrl || DEFAULT_COURSE_IMAGE,
            verifierUrl: `${BASE_URL}/verify?code=${data.verificationCode}`,
            grade: data.course?.grade || null,
            courseId: data.courseId
          });
        } else {
          setError('Certificat non trouvé.');
        }
      } catch (err) {
        setError('Erreur lors de la récupération du certificat.');
        toast.error('Erreur lors de la récupération du certificat.');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  const handleDownload = async () => {
    try {
      let qrCodeDataUrl = null;
      if (qrCodeRef.current) {
        const canvas = await html2canvas(qrCodeRef.current);
        qrCodeDataUrl = canvas.toDataURL('image/png');
      }
      generateCertificatePDF(certificate, certificate.courseId, qrCodeDataUrl);
      toast.success(`Téléchargement du certificat pour ${certificate.courseTitle}`);
    } catch (err) {
      console.error('Erreur lors du téléchargement du certificat:', err);
      toast.error('Erreur lors du téléchargement du certificat.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: certificate.courseTitle,
        text: `Découvrez mon certificat de ${certificate.courseTitle} obtenu sur e-BoSy !`,
        url: certificate.verifierUrl,
      }).catch((shareError) => {
        console.error('Erreur lors du partage du certificat:', shareError);
        toast.error('Erreur lors du partage du certificat.');
      });
    } else {
      navigator.clipboard.writeText(certificate.verifierUrl);
      toast.success('Lien du certificat copié dans le presse-papiers !');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <p className="text-gray-600">Données du certificat non disponibles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.005]">
          <div className="p-8 md:p-12 text-center relative">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-e-bosy-purple mb-4">
                CERTIFICAT DE RÉUSSITE
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-6 font-medium">
                EST DÉCERNÉ À
              </p>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-serif">
                {certificate.studentName}
              </h2>
              <p className="text-lg md:text-xl text-gray-700 mb-6 font-medium">
                POUR AVOIR TERMINÉ AVEC SUCCÈS LE COURS
              </p>
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
                "{certificate.courseTitle}"
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-left max-w-2xl mx-auto mb-8">
                <div className="flex items-center text-gray-700">
                  <InformationCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                  <span className="font-medium">Date de Délivrance:</span> {certificate.issueDate}
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                  <span className="font-medium">Date d'Achèvement:</span> {certificate.completionDate}
                </div>
                <div className="flex items-center text-gray-700 col-span-full">
                  <InformationCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                  <span className="font-medium">Instructeur:</span> {certificate.instructor}
                </div>
                {certificate.grade && (
                  <div className="flex items-center text-gray-700 col-span-full">
                    <InformationCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                    <span className="font-medium">Niveau:</span> <span className="font-bold text-e-bosy-purple">{certificate.grade}</span>
                  </div>
                )}
              </div>

              <p className="text-md text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                {certificate.description}
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" /> Vérifiez l'authenticité
                  </h4>
                  <div ref={qrCodeRef}>
                    <QRCode value={certificate.verifierUrl} size={128} level="H" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Scannez pour vérifier</p>
                </div>
                <div className="text-center md:text-left md:border-l md:border-gray-300 md:pl-8">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Code de Vérification:</h4>
                  <p className="text-2xl font-bold text-e-bosy-purple tracking-wider">
                    {certificate.verificationCode}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Visitez <a href={`${BASE_URL}/verify`} target="_blank" rel="noopener noreferrer" className="text-e-bosy-purple hover:underline">e-bosy.com/verify</a> et entrez ce code.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  onClick={handleDownload}
                  className="bg-e-bosy-purple text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors duration-200 text-lg"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" />
                  <span>Télécharger le Certificat</span>
                </button>
                <button
                  onClick={handleShare}
                  className="bg-white text-e-bosy-purple border border-e-bosy-purple px-6 py-3 rounded-lg shadow-md flex items-center justify-center space-x-2 hover:bg-e-bosy-purple hover:text-white transition-colors duration-200 text-lg"
                >
                  <ShareIcon className="h-6 w-6" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link to="/dashboard/certificates" className="text-e-bosy-purple hover:underline text-lg flex items-center justify-center">
            ← Retour à Mes Certificats
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CertificateViewPage;