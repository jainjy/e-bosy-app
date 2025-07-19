import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../services/ApiFetch';
import { Grid, List } from 'lucide-react';

const AdminLiveSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'grid'
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/LiveSessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('user_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Cette action est irréversible!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/LiveSessions/${sessionId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('user_token')}`
          }
        });

        if (response.ok) {
          setSessions(sessions.filter(session => session.liveSessionId !== sessionId));
          toast.success('Session supprimée avec succès');
        } else {
          toast.error('Erreur lors de la suppression');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (statusFilter === 'all') return true;
    return session.status === statusFilter;
  });

  const TableView = () => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredSessions.map((session) => (
            <tr key={session.liveSessionId}>
              <td className="px-6 py-4 whitespace-nowrap">{session.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">{session.course?.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(new Date(session.startTime), 'Pp', { locale: fr })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                  session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {session.status === 'scheduled' ? 'Planifiée' :
                   session.status === 'ongoing' ? 'En cours' :
                   session.status === 'completed' ? 'Terminée' :
                   'Annulée'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(session.liveSessionId)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSessions.map((session) => (
        <div key={session.liveSessionId} className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-2">{session.title}</h3>
          <p className="text-gray-600 mb-2">{session.course?.title}</p>
          <p className="text-sm text-gray-500 mb-2">
            {format(new Date(session.startTime), 'Pp', { locale: fr })}
          </p>
          <span className={`px-2 py-1 rounded-full text-xs ${
            session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
            session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
            session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {session.status === 'scheduled' ? 'Planifiée' :
             session.status === 'ongoing' ? 'En cours' :
             session.status === 'completed' ? 'Terminée' :
             'Annulée'}
          </span>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleDelete(session.liveSessionId)}
              className="text-red-600 hover:text-red-900"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Sessions en Direct</h1>
        <div className="flex space-x-4">
          <select
            className="rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="scheduled">Planifiées</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminées</option>
            <option value="cancelled">Annulées</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? <TableView /> : <GridView />}
    </div>
  );
};

export default AdminLiveSessionsPage;
