import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LoadingSpinner } from '../components/LoadingSpinner';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate fetching notifications from your backend
  useEffect(() => {
    const fetchNotifications = async () => {
      // In a real application, you would make an API call here:
      // try {
      //   const response = await fetch('/api/user/1/notifications'); // Assuming user_id 1
      //   if (!response.ok) {
      //     throw new Error(`HTTP error! status: ${response.status}`);
      //   }
      //   const data = await response.json();
      //   setNotifications(data);
      // } catch (e) {
      //   setError(e.message);
      // } finally {
      //   setLoading(false);
      // }

      const dummyNotifications = [
        {
          notification_id: 1,
          user_id: 1,
          title: 'Nouveau cours disponible!',
          message: 'Le cours "Introduction à l\'IA" a été publié. Inscrivez-vous dès maintenant!',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 heure passée
          link_url: '/courses/104',
        },
        {
          notification_id: 2,
          user_id: 1,
          title: 'Progression du cours',
          message: 'Vous avez complété 50% du cours "JavaScript Fondamentaux". Continuez votre excellent travail!',
          is_read: false,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 jour passé
          link_url: '/course/101',
        },
        {
          notification_id: 3,
          user_id: 1,
          title: 'Nouveau message',
          message: 'Vous avez reçu un nouveau message de votre instructeur dans le cours "Développement React".',
          is_read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 jours passés
          link_url: '/dashboard/messages',
        },
        {
          notification_id: 4,
          user_id: 1,
          title: 'Rappel de session live',
          message: 'Votre session live pour "Python pour Data Science" commence dans 30 minutes.',
          is_read: false,
          created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes passées
          link_url: '/live-session/42',
        },
        {
          notification_id: 5,
          user_id: 1,
          title: 'Certificat disponible',
          message: 'Votre certificat pour le cours "Python pour Data Science" est maintenant disponible. Téléchargez-le!',
          is_read: true,
          created_at: new Date(Date.now() - 604800000).toISOString(), // 1 semaine passée
          link_url: '/dashboard/certificates',
        },
      ];

      setTimeout(() => {
        setNotifications(dummyNotifications);
        setLoading(false);
      }, 500); // Simulate network delay
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    // In a real application, you would make an API call to update the notification status:
    // await fetch(`/api/notifications/${id}`, { method: 'PUT', body: JSON.stringify({ is_read: true }), headers: { 'Content-Type': 'application/json' } });
    setNotifications(notifications.map(n =>
      n.notification_id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    // In a real application, you would make an API call to update all notifications for the user.
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  if (loading) {
    return (
<LoadingSpinner/>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
        <p className="text-lg text-red-600">Erreur lors du chargement des notifications : {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="bg-e-bosy-purple text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700 transition duration-200"
          >
            Marquer tout comme lu
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-6 text-gray-600 text-center">Aucune nouvelle notification.</div>
        ) : (
          <ul>
            {notifications.map(notification => (
              <li
                key={notification.notification_id}
                className={`px-4 py-3 border-b last:border-b-0 flex items-start ${
                  !notification.is_read ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0">
                  <BellIcon className={`h-6 w-6 ${notification.is_read ? 'text-gray-400' : 'text-e-bosy-purple'}`} />
                </div>
                <div className="ml-3 w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <p className="text-gray-700">{notification.message}</p>
                  <div className="mt-2 flex items-center justify-end">
                    {notification.link_url && (
                      <Link
                        to={notification.link_url}
                        className="text-e-bosy-purple hover:underline text-sm font-medium mr-4"
                      >
                        Voir plus
                      </Link>
                    )}
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.notification_id)}
                        className="text-gray-500 hover:text-green-500 transition duration-200 flex items-center text-sm"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" /> Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;