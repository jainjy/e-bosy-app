import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { MagnifyingGlassIcon, PlusIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import UserFormModal from '../../components/UserFormModal';
import { getData, postData, putData, deleteData, API_BASE_URL } from '../../services/ApiFetch';
import { useAuth } from '../../contexts/AuthContext';
import "../../styles/user.css"
const ROLES = {
  ADMIN: 'administrateur',
  TEACHER: 'enseignant',
  STUDENT: 'etudiant',
  ALL: 'Tous les Utilisateurs'
};

const UserManagementPage = () => {
  const { user, logged } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(ROLES.ALL);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentFormMode, setCurrentFormMode] = useState('add');
  const [userToEdit, setUserToEdit] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAllUsers = async () => {
    try {
      const [data, err] = await getData('users');
      if (err) throw err;
      setAllUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      toast.error('Erreur serveur lors de la récupération des utilisateurs');
      console.error(err);
    }
  };

  useEffect(() => {
    if (logged && user?.role === ROLES.ADMIN) {
      fetchAllUsers();
    }
  }, [logged, user?.role]);

  useEffect(() => {
    let filtered = allUsers;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedRoleFilter !== ROLES.ALL) {
      filtered = filtered.filter(user => user.role === selectedRoleFilter.toLowerCase());
    }
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setPage(1);
  }, [searchTerm, selectedRoleFilter, allUsers, pageSize]);

  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const getRoleColorClass = (role) => {
    switch (role.toLowerCase()) {
      case ROLES.STUDENT: return 'bg-blue-100 text-blue-800';
      case ROLES.TEACHER: return 'bg-green-100 text-green-800';
      case ROLES.ADMIN: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserStatus = (user) => {
    return user.isSubscribed ? 'Actif' : 'Inactif';
  };

  const getStatusColorClass = (status) => {
    return status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const createFormData = (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (key === 'profilePicture' && userData[key]) {
        formData.append('ProfilePicture', userData[key]);
      } else if (Array.isArray(userData[key])) {
        userData[key].forEach(item => formData.append(key, item));
      } else if (userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });
    return formData;
  };

  const handleAddUser = async (newUserData) => {
    try {
      const formData = createFormData(newUserData);
      const [_, err] = await postData('users', formData, true);
      if (err) throw err;
      fetchAllUsers();
      setIsFormModalOpen(false);
      toast.success('Utilisateur créé avec succès');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateUser = async (updatedUserData) => {
    try {
      const formData = createFormData(updatedUserData);
      const [_, err] = await putData(`users/${updatedUserData.userId}`, formData, true);
      if (err) throw err;
      fetchAllUsers();
      setIsFormModalOpen(false);
      toast.success('Utilisateur mis à jour avec succès');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteUser = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimez-le !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        const [_, err] = await deleteData(`users/${id}`);
        if (err) throw err;
        await Swal.fire('Supprimé !', 'L\'utilisateur a été supprimé.', 'success');
        fetchAllUsers();
      } catch (err) {
        toast.error('Erreur serveur lors de la suppression de l\'utilisateur');
        console.error(err);
      }
    }
  };

  const openAddFormModal = () => {
    setCurrentFormMode('add');
    setUserToEdit(null);
    setIsFormModalOpen(true);
  };

  const openEditFormModal = (user) => {
    setCurrentFormMode('edit');
    setUserToEdit({
      ...user,
      birthDate: user.birthDate ? user.birthDate.toString().split('T')[0] : '',
      subscriptionDate: user.subscriptionDate ? user.subscriptionDate.split('T')[0] : '',
      subscriptionExpiry: user.subscriptionExpiry ? user.subscriptionExpiry.split('T')[0] : '',
    });
    setIsFormModalOpen(true);
    setOpenDropdownId(null);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setUserToEdit(null);
  };

  const toggleDropdown = (userId) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (!logged || user?.role !== ROLES.ADMIN) {
    return <div className="p-6 text-red-600">Accès refusé. Vous devez être administrateur pour voir cette page.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
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
      <div className="mb-6 bg-white p-2 rounded-lg shadow-sm flex space-x-2">
        {[ROLES.ALL, ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN].map(role => (
          <button
            key={role}
            onClick={() => setSelectedRoleFilter(role)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
              ${selectedRoleFilter === role ? 'bg-e-bosy-purple text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {role}
          </button>
        ))}
      </div>
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
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <tr key={user.userId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profilePictureUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={API_BASE_URL + user.profilePictureUrl} alt={`${user.firstName} ${user.lastName}`} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                              {`${user.firstName[0]}${user.lastName[0]}`.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColorClass(user.role)} capitalize`}>
                        {user.role.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(getUserStatus(user))}`}>
                        {getUserStatus(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium relative">
                      <button
                        onClick={() => toggleDropdown(user.userId)}
                        className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-e-bosy-purple focus:ring-opacity-50 transition-all duration-150"
                        aria-label="Options"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                      {openDropdownId === user.userId && (
                        <div className="origin-top-right absolute -top-12 right-full mr-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 animate-fade-in-down">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <Link
                              to={`${user.userId}/profile`}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors duration-150"
                              role="menuitem"
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Voir
                            </Link>
                            <button
                              onClick={() => openEditFormModal(user)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors duration-150"
                              role="menuitem"
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.userId)}
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
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Précédent
          </button>
          <span>Page {page} sur {totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
      {isFormModalOpen && (
        <UserFormModal
          mode={currentFormMode}
          user={userToEdit}
          onClose={closeFormModal}
          onSubmit={currentFormMode === 'add' ? handleAddUser : handleUpdateUser}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
