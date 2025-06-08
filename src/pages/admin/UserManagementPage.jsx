// src/pages/UserManagementPage.jsx
import React, { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import UserFormModal from '../../components/UserFormModal';
import ViewUserModal from '../../components/ViewUserModal';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('Tous les Utilisateurs');

  // Mise à jour des données d'exemple pour correspondre à la nouvelle structure de BDD
  const [users, setUsers] = useState([
    {
      id: 1,
      email: 'student@example.com',
      password: 'hashed_password_1', // Ne pas afficher ou éditer en front-end directement
      role: 'student',
      is_verified: true,
      is_subscribed: true,
      subscription_date: '2024-01-01T08:00:00Z',
      subscription_expiry: '2025-01-01T08:00:00Z',
      profile_picture_url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=JS',
      bio: 'Apprenant passionné par le développement web et l\'intelligence artificielle.',
      learning_style: 'Visuel',
      experience_level: 'Débutant',
      birth_date: '2000-01-15',
      points: 150,
      badges: { "first_course_completed": true, "active_learner": true },
      created_at: '2023-12-01T10:00:00Z',
      updated_at: '2024-05-20T14:30:00Z',
      name: 'Jean Étudiant', // Ajouté pour l'affichage, il faudrait un champ 'first_name'/'last_name' ou 'full_name' dans la BDD pour cela
    },
    {
      id: 2,
      email: 'teacher@example.com',
      password: 'hashed_password_2',
      role: 'teacher',
      is_verified: true,
      is_subscribed: false,
      subscription_date: null,
      subscription_expiry: null,
      profile_picture_url: 'https://via.placeholder.com/150/008000/FFFFFF?text=JT',
      bio: 'Enseignant expérimenté en React et Node.js, toujours à l\'affût des nouvelles technologies.',
      learning_style: 'Pratique',
      experience_level: 'Expert',
      birth_date: '1985-03-20',
      points: 500,
      badges: { "top_teacher": true, "mentor_pro": true },
      created_at: '2022-06-10T09:00:00Z',
      updated_at: '2024-06-01T11:00:00Z',
      name: 'Jeanne Enseignante',
    },
    {
      id: 3,
      email: 'admin@example.com',
      password: 'hashed_password_3',
      role: 'admin',
      is_verified: true,
      is_subscribed: true,
      subscription_date: '2023-01-01T09:00:00Z',
      subscription_expiry: null, // Admin subscription might not expire
      profile_picture_url: 'https://via.placeholder.com/150/800080/FFFFFF?text=AU',
      bio: 'Administrateur système et responsable de la plateforme.',
      learning_style: 'Analytique',
      experience_level: 'Avancé',
      birth_date: '1978-07-01',
      points: 999,
      badges: { "super_admin": true },
      created_at: '2021-01-01T08:00:00Z',
      updated_at: '2024-06-05T16:00:00Z',
      name: 'Admin Utilisateur',
    },
    {
        id: 4,
        email: 'alice@example.com',
        password: 'hashed_password_4',
        role: 'student',
        is_verified: false,
        is_subscribed: false,
        subscription_date: null,
        subscription_expiry: null,
        profile_picture_url: 'https://via.placeholder.com/150/FFC0CB/000000?text=AS',
        bio: 'Nouvelle dans le monde de la programmation, très motivée.',
        learning_style: 'Auditif',
        experience_level: 'Débutant',
        birth_date: '2002-11-25',
        points: 50,
        badges: {},
        created_at: '2024-02-10T11:00:00Z',
        updated_at: '2024-02-10T11:00:00Z',
        name: 'Alice Étudiante',
      },
      {
        id: 5,
        email: 'bob@example.com',
        password: 'hashed_password_5',
        role: 'teacher',
        is_verified: true,
        is_subscribed: true,
        subscription_date: '2024-03-15T09:00:00Z',
        subscription_expiry: '2025-03-15T09:00:00Z',
        profile_picture_url: 'https://via.placeholder.com/150/FFA500/FFFFFF?text=BT',
        bio: 'Spécialisé en science des données et apprentissage automatique.',
        learning_style: 'Kinesthésique',
        experience_level: 'Intermédiaire',
        birth_date: '1990-09-10',
        points: 300,
        badges: {"data_guru": true},
        created_at: '2023-05-01T14:00:00Z',
        updated_at: '2024-06-01T10:00:00Z',
        name: 'Bob Enseignant',
      },
  ]);

  // States pour la modale de formulaire unifiée
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentFormMode, setCurrentFormMode] = useState('add'); // 'add' ou 'edit'
  const [userToEdit, setUserToEdit] = useState(null); // L'objet utilisateur en mode 'edit'

  // State pour la modale de visualisation
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userToView, setUserToView] = useState(null);

  // State pour gérer la visibilité du menu déroulant d'actions
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const filteredUsers = users.filter(user => {
    // Assurez-vous que `user.name` existe, ou utilisez `user.email` comme fallback pour la recherche
    const userName = user.name || user.email.split('@')[0]; // Utiliser le nom ou une partie de l'email
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'Tous les Utilisateurs' ||
                        user.role === selectedRoleFilter.toLowerCase().replace('administrateur', 'admin'); // Convertir "administrateur" en "admin" pour la comparaison

    return matchesSearch && matchesRole;
  });

  const getRoleColorClass = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Adapter le statut en fonction de is_verified ou d'autres critères si nécessaire
  // Pour l'exemple, nous allons utiliser une logique simplifiée
  const getUserStatus = (user) => {
    return user.is_verified ? 'Actif' : 'Inactif'; // Ou 'Non Vérifié'
  };

  const getStatusColorClass = (status) => {
    // Nous allons utiliser une classe basée sur le rôle ou une logique plus complexe pour un vrai statut
    return status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Opérations CRUD
  const handleAddUser = (newUserData) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    // Générer une date de création et mise à jour
    const now = new Date().toISOString(); // Format ISO pour TIMESTAMP
    setUsers([...users, {
      id: newId,
      is_verified: false, // Par défaut, les nouveaux utilisateurs ne sont pas vérifiés
      is_subscribed: false, // Par défaut, non abonnés
      subscription_date: null,
      subscription_expiry: null,
      profile_picture_url: `https://via.placeholder.com/150/CCCCCC/000000?text=${newUserData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}`,
      points: 0,
      badges: {},
      created_at: now,
      updated_at: now,
      ...newUserData,
      // Le champ 'name' n'est pas dans la BDD, il faut l'ajouter si vous le gardez en front-end
      name: newUserData.name || newUserData.email.split('@')[0],
      // Assurez-vous que le rôle est 'student' ou 'teacher' ou 'admin' pour la BDD
      role: newUserData.role.toLowerCase().replace('administrateur', 'admin'),
    }]);
    setIsFormModalOpen(false);
    console.log('Utilisateur Ajouté:', newUserData);
  };

  const handleUpdateUser = (updatedUserData) => {
    const now = new Date().toISOString();
    setUsers(users.map(user =>
      user.id === updatedUserData.id ? {
        ...user,
        ...updatedUserData,
        updated_at: now,
        // Assurez-vous que le rôle est 'student' ou 'teacher' ou 'admin' pour la BDD
        role: updatedUserData.role.toLowerCase().replace('administrateur', 'admin'),
      } : user
    ));
    setIsFormModalOpen(false);
    setOpenDropdownId(null);
    console.log('Utilisateur Mis à Jour:', updatedUserData);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setUsers(users.filter(user => user.id !== id));
      setOpenDropdownId(null);
      console.log('Utilisateur Supprimé:', id);
    }
  };

  // Gestionnaires pour la modale de formulaire unifiée
  const openAddFormModal = () => {
    setCurrentFormMode('add');
    setUserToEdit(null); // S'assurer qu'aucune ancienne donnée n'est présente
    setIsFormModalOpen(true);
  };

  const openEditFormModal = (user) => {
    setCurrentFormMode('edit');
    setUserToEdit(user);
    setIsFormModalOpen(true);
    setOpenDropdownId(null); // Fermer le menu déroulant lors de l'ouverture de la modale
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setUserToEdit(null); // Effacer les données de l'utilisateur à la fermeture
  };

  // Gestionnaires pour la modale de visualisation
  const openViewModal = (user) => {
    setUserToView(user);
    setIsViewModalOpen(true);
    setOpenDropdownId(null);
  };
  const closeViewModal = () => {
    setUserToView(null);
    setIsViewModalOpen(false);
  };

  // Gestionnaire du menu déroulant
  const toggleDropdown = (userId) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Gérez les comptes utilisateurs, les rôles et les permissions.</p>
        </div>
        <button
          onClick={openAddFormModal}
          className="bg-e-bosy-purple text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-purple-700 transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Ajouter un Utilisateur</span>
        </button>
      </div>

      {/* Filtres de Rôle */}
      <div className="mb-6 bg-white p-2 rounded-lg shadow-sm flex space-x-2">
        {['Tous les Utilisateurs', 'Student', 'Teacher', 'Admin'].map(role => (
          <button
            key={role}
            onClick={() => setSelectedRoleFilter(role)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${selectedRoleFilter === role
                ? 'bg-e-bosy-purple text-white'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {role === 'Student' ? 'Étudiant' : role === 'Teacher' ? 'Enseignant' : role === 'Admin' ? 'Administrateur' : role}
          </button>
        ))}
      </div>

      {/* Recherche et Tableau */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher des utilisateurs..."
            className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:ring-e-bosy-purple focus:border-e-bosy-purple transition-shadow duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tableau des Utilisateurs */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            {/* Afficher l'image de profil si disponible, sinon les initiales */}
                            {user.profile_picture_url ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={user.profile_picture_url} alt={`${user.name}'s avatar`} />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : user.email.substring(0,2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColorClass(user.role)} capitalize`}>
                        {user.role === 'student' ? 'étudiant' : user.role === 'teacher' ? 'enseignant' : user.role === 'admin' ? 'administrateur' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(getUserStatus(user))}`}>
                        {getUserStatus(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button
                        onClick={() => toggleDropdown(user.id)}
                        className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:ring-opacity-50 transition-all duration-150"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                      {openDropdownId === user.id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in-down">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button
                              onClick={() => openViewModal(user)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors duration-150"
                              role="menuitem"
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Voir
                            </button>
                            <button
                              onClick={() => openEditFormModal(user)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors duration-150"
                              role="menuitem"
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-100 hover:text-red-900 w-full text-left transition-colors duration-150"
                              role="menuitem"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-600">Aucun utilisateur trouvé correspondant à vos critères.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale de formulaire utilisateur unifiée */}
      {isFormModalOpen && (
        <UserFormModal
          mode={currentFormMode} // Passer le mode ('add' ou 'edit')
          user={userToEdit}     // Passer l'objet utilisateur pour le mode édition
          onClose={closeFormModal}
          onSubmit={currentFormMode === 'add' ? handleAddUser : handleUpdateUser}
        />
      )}

      {/* Modale de visualisation utilisateur */}
      {isViewModalOpen && userToView && (
        <ViewUserModal
          user={userToView}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};

export default UserManagementPage;