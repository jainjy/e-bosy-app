import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  DocumentArrowDownIcon,
  AcademicCapIcon // Ajout de l'import manquant
} from '@heroicons/react/24/outline';
const CertificatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data for certificates
  const allCertificates = [
    {
      id: 1,
      courseTitle: 'Introduction à JavaScript',
      issueDate: '15/05/2024',
      code: 'JS2024-ABC123',
      imageUrl: 'https://via.placeholder.com/300x180?text=JS+Cert' // Placeholder for cert image
    },
    {
      id: 2,
      courseTitle: 'React pour debutants',
      issueDate: '10/05/2024',
      code: 'REACT-XYZ789',
      imageUrl: 'https://via.placeholder.com/300x180?text=React+Cert'
    },
    {
      id: 3,
      courseTitle: 'Developpement d\'API avec Node.js',
      issueDate: '28/04/2024',
      code: 'NODE-DEF456',
      imageUrl: 'https://via.placeholder.com/300x180?text=Node.js+Cert'
    },
    {
      id: 4,
      courseTitle: 'Advanced Python Programming',
      issueDate: '01/03/2024',
      code: 'PYTH-ADV001',
      imageUrl: 'https://via.placeholder.com/300x180?text=Python+Adv'
    },
  ];

  const filteredCertificates = allCertificates.filter(certificate =>
    certificate.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    certificate.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (certificate) => {
    alert(`Downloading certificate for: ${certificate.courseTitle} (Code: ${certificate.code})`);
    // In a real app, you'd trigger a file download here.
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes Certificats</h1>
          <p className="text-gray-600">Gerez et telechargez vos certificats de cours</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un certificat par nom de cours..."
            className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.length > 0 ? (
          filteredCertificates.map(certificate => (
            <div key={certificate.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                {/* Placeholder for a certificate icon/image */}
                <img src={certificate.imageUrl} alt="Certificate Placeholder" className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-50"></div>
                <div className="absolute top-4 right-4 text-white text-opacity-80">
                    <AcademicCapIcon className="h-8 w-8" /> {/* A decorative icon */}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{certificate.courseTitle}</h3>
                <p className="text-sm text-gray-600 mb-1">Delivre le: {certificate.issueDate}</p>
                <p className="text-sm text-gray-600 mb-3">Code: <span className="font-medium text-gray-800">{certificate.code}</span></p>
                <div className="flex justify-between items-center mt-4">
                  <Link to={""+certificate.id} className="bg-e-bosy-purple text-white px-4 py-2 rounded-md hover:bg-purple-700">
                    Voir
                  </Link>
                  <button
                    onClick={() => handleDownload(certificate)}
                    className="p-2 rounded-md text-e-bosy-purple hover:bg-e-bosy-purple hover:text-white transition-colors duration-200"
                    title="Download Certificate"
                  >
                    <DocumentArrowDownIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg py-10">No certificates found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;