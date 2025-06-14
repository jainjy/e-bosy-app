import React from 'react';
import { TicketIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const CertificateCard = ({ certificate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        <TicketIcon className="h-8 w-8 text-e-bosy-purple" />
      </div>
      <h3 className="font-semibold text-lg text-gray-800">{certificate.title}</h3>
      <p className="text-sm text-gray-600 mt-2">Delivre le {certificate.issuedDate}</p>
      <p className="text-sm text-gray-500 mt-1">Code: {certificate.code}</p>
      <div className="flex space-x-3 mt-4">
        <button className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-1 hover:bg-purple-700">
          <EyeIcon className="h-5 w-5" />
          <span>Voir</span>
        </button>
        <button className="border border-e-bosy-purple text-e-bosy-purple px-4 py-2 rounded-md flex items-center space-x-1 hover:bg-purple-50">
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Telecharger</span>
        </button>
      </div>
    </div>
  );
};

export default CertificateCard;