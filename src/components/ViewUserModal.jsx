import React, { useRef, useEffect } from 'react';
import moment from 'moment';

const ViewUserModal = ({ user, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!user) return null;

  const getRoleColorClass = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserStatus = (user) => {
    return user.is_verified ? 'Actif' : 'Non Vérifié';
  };

  const getStatusColorClass = (status) => {
    return status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD/MM/YYYY') : 'N/A';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-900">Profil Utilisateur</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          {user.profile_picture_url ? (
            <img className="h-24 w-24 rounded-full object-cover shadow-md border-4 border-white" src={user.profile_picture_url} alt={`${user.name || user.email}'s avatar`} />
          ) : (
            <div className="h-24 w-24 rounded-full bg-e-bosy-purple flex items-center justify-center text-white font-bold text-4xl shadow-md border-4 border-white">
              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : user.email.substring(0,2).toUpperCase()}
            </div>
          )}
          <h3 className="text-2xl font-bold text-gray-900 mt-4">{user.name || user.email}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-gray-700 mb-8">
          <div className="flex flex-col">
            <p className="font-semibold text-sm text-gray-500">Rôle</p>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full capitalize ${getRoleColorClass(user.role)}`}>
              {user.role === 'student' ? 'étudiant' : user.role === 'teacher' ? 'enseignant' : user.role === 'admin' ? 'administrateur' : user.role}
            </span>
          </div>
          <div className="flex flex-col">
            <p className="font-semibold text-sm text-gray-500">Statut</p>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColorClass(getUserStatus(user))}`}>
              {getUserStatus(user)}
            </span>
          </div>

          {user.country && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Pays</p>
              <p className="text-base">{user.country}</p>
            </div>
          )}
          {user.birth_date && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Date de Naissance</p>
              <p className="text-base">{formatDate(user.birth_date)}</p>
            </div>
          )}
          {user.learning_style && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Style d'Apprentissage</p>
              <p className="text-base">{user.learning_style}</p>
            </div>
          )}
          {user.experience_level && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Niveau d'Expérience</p>
              <p className="text-base">{user.experience_level}</p>
            </div>
          )}
          {user.points !== undefined && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Points</p>
              <p className="text-base">{user.points}</p>
            </div>
          )}

          {user.is_subscribed && (
            <>
              <div className="flex flex-col">
                <p className="font-semibold text-sm text-gray-500">Abonné</p>
                <p className="text-base">Oui</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-sm text-gray-500">Date d'abonnement</p>
                <p className="text-base">{formatDate(user.subscription_date)}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-sm text-gray-500">Expiration abonnement</p>
                <p className="text-base">{formatDate(user.subscription_expiry)}</p>
              </div>
            </>
          )}
          {user.is_verified !== undefined && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Email Vérifié</p>
              <p className="text-base">{user.is_verified ? 'Oui' : 'Non'}</p>
            </div>
          )}
          {user.bio && (
            <div className="md:col-span-2 flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Biographie</p>
              <p className="text-base">{user.bio}</p>
            </div>
          )}
          {user.badges && Object.keys(user.badges).length > 0 && (
            <div className="md:col-span-2 flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Badges</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(user.badges).map(badgeKey => (
                  <span key={badgeKey} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    {badgeKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          )}
          {user.created_at && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Créé le</p>
              <p className="text-base">{moment(user.created_at).format('DD/MM/YYYY HH:mm')}</p>
            </div>
          )}
          {user.updated_at && (
            <div className="flex flex-col">
              <p className="font-semibold text-sm text-gray-500">Dernière mise à jour</p>
              <p className="text-base">{moment(user.updated_at).format('DD/MM/YYYY HH:mm')}</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;