import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { getData, putData } from '../services/ApiFetch';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const [data, error] = await getData(`notifications/user/${user.userId}`);
        if (error) throw error;
        
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const [_, error] = await putData(`notifications/${id}/read`);
      if (error) throw error;

      setNotifications(notifications.map(n =>
        n.notificationId === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Erreur lors du marquage de la notification:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const [_, error] = await putData(`notifications/user/${user.userId}/read-all`);
      if (error) throw error;

      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
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
        {notifications.some(n => !n.isRead) && (
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
                key={notification.notificationId}
                className={`px-4 py-3 border-b last:border-b-0 flex items-start ${
                  !notification.isRead ? 'bg-gray-100 hover:bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0">
                  <BellIcon className={`h-6 w-6 ${notification.isRead ? 'text-gray-400' : 'text-e-bosy-purple'}`} />
                </div>
                <div className="ml-3 w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <p className="text-gray-700">{notification.message}</p>
                  <div className="mt-2 flex items-center justify-end">
                    {notification.linkUrl && (
                      <Link
                        to={notification.linkUrl}
                        className="text-e-bosy-purple hover:underline text-sm font-medium mr-4"
                      >
                        Voir plus
                      </Link>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.notificationId)}
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