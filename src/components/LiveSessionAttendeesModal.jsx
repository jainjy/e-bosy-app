import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const LiveSessionAttendeesModal = ({ isOpen, onClose, attendees }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Participants à la session
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 py-3">
            {attendees && attendees.length > 0 ? (
              <ul>
                {attendees.map((attendee) => (
                  <li key={attendee.userId} className="py-2">{attendee.firstName} {attendee.lastName}</li>
                ))}
              </ul>
            ) : (
              <p>Aucun participant pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionAttendeesModal;