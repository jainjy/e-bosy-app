import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDownTrayIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getData } from '../services/ApiFetch';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import Navbar from '../Components/Navbar';
import generateCertificatePDF from '../utils/generateCertificatePDF';

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5173';
const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";

const CertificateVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for verification code in URL query params
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setVerificationCode(codeFromUrl);
      verifyCertificate(codeFromUrl);
    }
  }, [searchParams]);

  const verifyCertificate = async (code) => {
    if (!code) {
      toast.error('Veuillez entrer un code de vérification.');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const [data, error] = await getData(`enrollments/certificates/verify/${code}`);
      if (!error && data) {
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
        toast.success('Certificat vérifié avec succès !');
      } else {
        setError('Code de vérification invalide ou certificat non trouvé.');
        toast.error('Code de vérification invalide.');
      }
    } catch (err) {
      setError('Erreur lors de la vérification du certificat.');
      toast.error('Erreur lors de la vérification du certificat.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    verifyCertificate(verificationCode);
  };

  const handleDownload = () => {
    try {
      generateCertificatePDF(certificate, certificate.courseId, null); // No QR code
      toast.success(`Téléchargement du certificat pour ${certificate.courseTitle}`);
    } catch (err) {
      console.error('Erreur lors du téléchargement du certificat:', err);
      toast.error('Erreur lors du téléchargement du certificat.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircleIcon className="h-8 w-8 text-e-bosy-purple" />
            Vérification de Certificat
          </h1>
          <p className="text-gray-600 mb-8">
            Entrez le code de vérification pour afficher et vérifier l’authenticité du certificat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Entrez le code de vérification"
                className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple shadow"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="bg-e-bosy-purple text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
            >
              Vérifier
            </button>
          </div>

          {loading && <LoadingSpinner />}

          {error && !loading && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-md">
              <ExclamationCircleIcon className="h-6 w-6" />
              <p>{error}</p>
            </div>
          )}

          {certificate && !loading && (
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

                  <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Code de Vérification:</h4>
                    <p className="text-2xl font-bold text-e-bosy-purple tracking-wider">
                      {certificate.verificationCode}
                    </p>
   
                  </div>

                  <div className="flex justify-center gap-4 mt-8">
                    <button
                      onClick={handleDownload}
                      className="bg-e-bosy-purple text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors duration-200 text-lg"
                    >
                      <ArrowDownTrayIcon className="h-6 w-6" />
                      <span>Télécharger le Certificat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/dashboard" className="text-e-bosy-purple hover:underline text-lg">
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CertificateVerificationPage;