import React from 'react';
import { Dialog } from '@headlessui/react';
import { StarIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from '../services/ApiFetch';

const ReviewsModal = ({ isOpen, onClose, reviews }) => {
  const StarRating = ({ value }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-5 w-5 ${
            star <= value ? 'text-yellow-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                Avis des étudiants
              </Dialog.Title>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-3xl font-bold text-e-bosy-purple">{calculateAverageRating()}</span>
                <StarRating value={Math.round(calculateAverageRating())} />
                <span className="text-gray-500">({reviews.length} avis)</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4 pr-2">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div 
                  key={review.enrollmentId} 
                  className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      
                        {review.userProfilePicture?<img src={API_BASE_URL+review.userProfilePicture} className="h-10 w-10 rounded-full bg-e-bosy-purple/10 flex items-center justify-center"/>:
                        <div className="h-10 w-10 rounded-full bg-e-bosy-purple/10 flex items-center justify-center">
                        <span className="text-e-bosy-purple font-medium">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                        </div>}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{review.userName}</h4>
                        <StarRating value={review.rating} />
                     
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.rateAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 ml-13">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun avis pour le moment
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ReviewsModal;