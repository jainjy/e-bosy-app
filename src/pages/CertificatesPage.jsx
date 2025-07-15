import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { QRCode } from 'react-qr-code';
import { API_BASE_URL, getData } from '../services/ApiFetch';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import generateCertificatePDF from '../utils/generateCertificatePDF';
import html2canvas from 'html2canvas';
const DEFAULT_COURSE_IMAGE = "/images/default-course.jpg";
const CertificatesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const qrCodeRefs = useRef({});

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      if (!user?.userId) return;
      const [data, error] = await getData(`enrollments/certificates/user/${user.userId}`);
      if (!error) {
        setCertificates(data.map(certificate => ({
          certificateId: certificate.certificateId,
          courseTitle: certificate.course?.title || 'Cours inconnu',
          studentName: `${certificate.user?.firstName} ${certificate.user?.lastName}`.toUpperCase(),
          issueDate: new Date(certificate.issuedAt).toLocaleDateString(),
          completionDate: new Date(certificate.issuedAt).toLocaleDateString(),
          verificationCode: certificate.verificationCode,
          instructor: certificate.course?.teacher?.firstName ? `${certificate.course.teacher.firstName} ${certificate.course.teacher.lastName}` : 'Instructeur inconnu',
          duration: certificate.course?.duration || 'Durée inconnue',
          description: certificate.course?.description || 'Ce certificat atteste de la réussite du cours.',
          imageUrl: certificate.course?.thumbnailUrl || DEFAULT_COURSE_IMAGE,
          verifierUrl: `http://loclhost:5173/verify?code=${certificate.verificationCode}`,
          grade: certificate.course?.level || null,
          courseId: certificate.courseId
        })) || []);
      } else {
        toast.error('Erreur lors de la récupération des certificats.');
      }
      setLoading(false);
    };
    fetchCertificates();
  }, [user?.userId]);

  const filteredCertificates = certificates.filter(certificate =>
    certificate.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    certificate.verificationCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (certificate) => {
    try {
      let qrCodeDataUrl = null;
      const qrCodeElement = qrCodeRefs.current[certificate.certificateId];
      if (qrCodeElement) {
        const canvas = await html2canvas(qrCodeElement);
        qrCodeDataUrl = canvas.toDataURL('image/png');
      }
      generateCertificatePDF(certificate, certificate.courseId, qrCodeDataUrl);
      toast.success(`Téléchargement du certificat pour ${certificate.courseTitle}`);
    } catch (err) {
      console.error('Erreur lors du téléchargement du certificat:', err);
      toast.error('Erreur lors du téléchargement du certificat.');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <AcademicCapIcon className="h-8 w-8 text-e-bosy-purple" />
            Mes Certificats
          </h1>
          <p className="text-gray-600">Gérez et téléchargez vos certificats de cours</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-96">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un certificat..."
                className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Link
            to="/certificates/available"
            className="flex items-center gap-2 bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700 transition whitespace-nowrap"
            title="Découvrir les cours disponibles pour certification"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Obtenir de nouvelles certifications
          </Link>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map(certificate => (
              <div
                key={certificate.certificateId}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 group relative"
              >
                <div className="relative h-44 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <img
                    src={API_BASE_URL+certificate.imageUrl}
                    alt="Certificate"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-40"></div>
                  <div className="absolute top-4 right-4 text-white text-opacity-80">
                    <AcademicCapIcon className="h-8 w-8" />
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-e-bosy-purple shadow">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    {certificate.verificationCode}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                    {certificate.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Délivré le : {certificate.issueDate}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Code : <span className="font-medium text-gray-800">{certificate.verificationCode}</span>
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <Link
                      to={`/certificates/${certificate.verificationCode}`}
                      className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                    >
                      Voir
                    </Link>
                    <button
                      onClick={() => handleDownload(certificate)}
                      className="p-2 rounded-md text-e-bosy-purple hover:bg-e-bosy-purple hover:text-white transition-colors duration-200"
                      title="Télécharger le certificat"
                    >
                      <DocumentArrowDownIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                {/* Hidden QR Code for PDF generation */}
                <div style={{ position: 'absolute', left: '-9999px' }}>
                  <div ref={el => (qrCodeRefs.current[certificate.certificateId] = el)}>
                    <QRCode value={certificate.verifierUrl} size={128} level="H" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600 text-lg py-10">
              Aucun certificat trouvé.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;