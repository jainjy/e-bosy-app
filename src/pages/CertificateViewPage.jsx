import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowDownTrayIcon, // Download icon
  ShareIcon,        // Share icon
  CheckCircleIcon,  // Verified icon
  InformationCircleIcon // Info icon
} from '@heroicons/react/24/outline';
import { QRCode } from 'react-qr-code'; // Import QRCode component as a named export
import Navbar from '../Components/Navbar'; // Assuming you have a Navbar component

const CertificateViewPage = () => {
  const { id } = useParams(); // Get certificate ID from URL parameters
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy certificate data (in a real app, this would come from an API call)
  const dummyCertificates = [
    {
      id: '1',
      courseTitle: 'Maîtrise du Developpement Web Frontend',
      studentName: 'RAKOTO Malala',
      issueDate: '25/05/2024',
      completionDate: '20/05/2024',
      verificationCode: 'EBSY-WEB-2024-ABC12345',
      grade: 'A+',
      instructor: 'Jane Doe',
      duration: '120 heures',
      description: 'Ce certificat atteste de la maîtrise des competences fondamentales et avancees en developpement web frontend, incluant HTML5, CSS3, JavaScript (ES6+), React, et les meilleures pratiques de conception reactive.',
      imageUrl: 'https://via.placeholder.com/800x600?text=Certificat+Web+Dev', // Placeholder image if certificate has a visual
      verifierUrl: 'https://e-bosy.com/verify?code=EBSY-WEB-2024-ABC12345' // URL for QR code
    },
    {
      id: '2',
      courseTitle: 'Intelligence Artificielle pour les Debutants',
      studentName: 'RANDRIA Zo',
      issueDate: '10/04/2024',
      completionDate: '05/04/2024',
      verificationCode: 'EBSY-AI-2024-DEF67890',
      grade: 'B',
      instructor: 'John Smith',
      duration: '80 heures',
      description: 'Introduction aux concepts fondamentaux de l\'intelligence artificielle, incluant le machine learning, le deep learning et les reseaux neuronaux.',
      imageUrl: 'https://via.placeholder.com/800x600?text=Certificat+AI',
      verifierUrl: 'https://e-bosy.com/verify?code=EBSY-AI-2024-DEF67890'
    },
    {
        id: '3',
        courseTitle: 'Introduction à JavaScript',
        studentName: 'RAKOTOARIVONY Tiana',
        issueDate: '15/05/2024',
        completionDate: '10/05/2024',
        verificationCode: 'EBSY-JS-2024-GHI10111',
        grade: 'A',
        instructor: 'Dr. Expert',
        duration: '40 heures',
        description: 'Ce certificat valide les competences en JavaScript de base à intermediaire.',
        imageUrl: 'https://via.placeholder.com/800x600?text=JS+Cert',
        verifierUrl: 'https://e-bosy.com/verify?code=EBSY-JS-2024-GHI10111'
    }
  ];

  useEffect(() => {
    // Simulate fetching data based on ID
    setLoading(true);
    setError(null);
    const foundCertificate = dummyCertificates.find(cert => cert.id === id);
    if (foundCertificate) {
      setCertificate(foundCertificate);
    } else {
      setError('Certificate not found.');
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <p className="text-gray-600">Loading certificate...</p>
      </div>
    );
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
        <p className="text-gray-600">Certificate data is not available.</p>
      </div>
    );
  }

  // Function to simulate download (in a real app, this would generate a PDF/image)
  const handleDownload = () => {
    alert(`Downloading certificate for ${certificate.courseTitle} by ${certificate.studentName}`);
    // Here you would typically generate a PDF or an image of the certificate
    // using libraries like html2canvas + jspdf, or a backend API.
  };

  // Function to simulate sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: certificate.courseTitle,
        text: `Check out my certificate from e-BoSy for ${certificate.courseTitle}!`,
        url: window.location.href, // Current URL
      }).then(() => {
        console.log('Certificate shared successfully');
      }).catch((shareError) => {
        console.error('Error sharing certificate:', shareError);
      });
    } else {
      // Fallback for browsers that do not support navigator.share
      alert(`Share this link: ${window.location.href}`);
      console.log('Web Share API not supported, fallback to manual copy.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 pt-20"> {/* Added pt-20 for fixed navbar */}
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.005]">
          <div className="p-8 md:p-12 text-center relative">
            {/* Background elements, if any */}
            {/* <div className="absolute inset-0 bg-e-bosy-purple opacity-10 blur-sm rounded-lg"></div> */}
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-e-bosy-purple mb-4">
                CERTIFICAT DE REUSSITE
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-6 font-medium">
                EST DECERNE À
              </p>
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-serif">
                {certificate.studentName.toUpperCase()}
              </h2>
              <p className="text-lg md:text-xl text-gray-700 mb-6 font-medium">
                POUR AVOIR TERMINE AVEC SUCCÈS LE COURS
              </p>
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
                "{certificate.courseTitle}"
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-left max-w-2xl mx-auto mb-8">
                <div className="flex items-center text-gray-700">
                  <InformationCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                  <span className="font-medium">Date de Delivrance:</span> {certificate.issueDate}
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                  <span className="font-medium">Date d'Achèvement:</span> {certificate.completionDate}
                </div>
                <div className="flex items-center text-gray-700 col-span-full">
                  <InformationCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                  <span className="font-medium">Duree du Cours:</span> {certificate.duration}
                </div>
                <div className="flex items-center text-gray-700 col-span-full">
                  <InformationCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                  <span className="font-medium">Instructeur:</span> {certificate.instructor}
                </div>
                {certificate.grade && (
                    <div className="flex items-center text-gray-700 col-span-full">
                        <InformationCircleIcon className="h-5 w-5 text-e-bosy-purple mr-2" />
                        <span className="font-medium">Note Obtenue:</span> <span className="font-bold text-e-bosy-purple">{certificate.grade}</span>
                    </div>
                )}
              </div>

              <p className="text-md text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                {certificate.description}
              </p>

              {/* Verification Section */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" /> Verifiez l'authenticite
                  </h4>
                  <QRCode value={certificate.verifierUrl} size={128} level="H"  />
                  <p className="text-sm text-gray-500 mt-2">Scannez pour verifier</p>
                </div>
                <div className="text-center md:text-left md:border-l md:border-gray-300 md:pl-8">
                  <h4 className="text-md font-semibold text-gray-800 mb-2">Code de Verification:</h4>
                  <p className="text-2xl font-bold text-e-bosy-purple tracking-wider">
                    {certificate.verificationCode}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Visitez <a href="https://e-bosy.com/verify" target="_blank" rel="noopener noreferrer" className="text-e-bosy-purple hover:underline">e-bosy.com/verify</a> et entrez ce code.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  onClick={handleDownload}
                  className="bg-e-bosy-purple text-white px-6 py-3 rounded-lg shadow-md flex items-center justify-center space-x-2 hover:bg-purple-700 transition-colors duration-200 text-lg"
                >
                  <ArrowDownTrayIcon className="h-6 w-6" />
                  <span>Telecharger le Certificat</span>
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
        {/* Optional: Back to Certificates link */}
        <div className="text-center mt-8">
          <Link to="/dashboard/certificates" className="text-e-bosy-purple hover:underline text-lg flex items-center justify-center">
            &larr; Retour à Mes Certificats
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CertificateViewPage;