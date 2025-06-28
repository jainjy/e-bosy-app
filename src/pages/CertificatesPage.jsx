import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { getData } from '../services/ApiFetch';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const CertificatesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupération des certificats de l'utilisateur connecté
  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      if (!user?.userId) return;
      const [data, error] = await getData(`enrollments/certificates/user/${user.userId}`);
      if (!error) setCertificates(data || []);
      setLoading(false);
    };
    fetchCertificates();
  }, [user?.userId]);

  // Filtrage
  const filteredCertificates = certificates.filter(certificate =>
    certificate.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    certificate.verificationCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Téléchargement simulé
  const handleDownload = (certificate) => {
    window.open(certificate.certificateUrl, '_blank');
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
            to="/dashboard/certificates/available"
            className="flex items-center gap-2 bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700 transition whitespace-nowrap"
            title="Découvrir les cours disponibles pour certification"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Obtenir de nouvelles certifications
          </Link>
        </div>
      </div>

      {/* Loading spinner */}
      {loading && 
      <LoadingSpinner/>
      }

      {/* Certificates Grid */}
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
                    src={certificate.course?.thumbnailUrl || 'https://via.placeholder.com/300x180?text=Certificat'}
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
                    {certificate.course?.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Délivré le : {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Code : <span className="font-medium text-gray-800">{certificate.verificationCode}</span>
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <Link
                      to={`/dashboard/certificates/${certificate.certificateId}`}
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