import React, { useState, useEffect, useRef } from 'react';

const ROLES = {
  ADMIN: 'administrateur',
  TEACHER: 'enseignant',
  STUDENT: 'etudiant',
};

const UserFormModal = ({ onClose, onSubmit, user = null, mode = 'add' }) => {
  const [formData, setFormData] = useState(() => {
    const formatDate = (isoDate) => {
      if (!isoDate) return '';
      const date = new Date(isoDate);
      return isNaN(date.getTime()) ? '' : isoDate.split('T')[0];
    };

    const baseData = {
      userId: user?.userId || null,
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      role: user?.role?.toLowerCase() === 'admin' ? ROLES.ADMIN : user?.role || ROLES.STUDENT,
      profilePicture: null,
      isActive: user?.isActive || false,
    };

    if (mode === 'edit' && user) {
      return {
        ...baseData,
        bio: user.bio || '',
        experienceLevel: user.experienceLevel || '',
        birthDate: formatDate(user.birthDate),
        isSubscribed: user.isSubscribed || false,
        subscriptionDate: formatDate(user.subscriptionDate),
        subscriptionExpiry: formatDate(user.subscriptionExpiry),
        specialty: user.specialty || '',
        education: user.education || '',
        yearsOfExperience: user.yearsOfExperience || '',
        badges: user.badges || [],
      };
    }

    return {
      ...baseData,
      password: '',
      bio: '',
      experienceLevel: '',
      birthDate: '',
      isSubscribed: false,
      subscriptionDate: '',
      subscriptionExpiry: '',
      specialty: '',
      education: '',
      yearsOfExperience: '',
      badges: [],
    };
  });

  const [activeTab, setActiveTab] = useState('general');
  const modalRef = useRef(null);

  // Common fields for all roles
  const commonFields = [
    { name: 'firstName', label: 'Prénom', type: 'text', required: true },
    { name: 'lastName', label: 'Nom', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { 
      name: 'role', 
      label: 'Rôle', 
      type: 'select', 
      required: true,
      options: [
        { value: ROLES.STUDENT, label: 'Étudiant' },
        { value: ROLES.TEACHER, label: 'Enseignant' },
        { value: ROLES.ADMIN, label: 'Administrateur' },
      ]
    },
    { name: 'profilePicture', label: 'Photo de profil', type: 'file' },
  ];

  // Role-specific fields
  const roleFields = {
    [ROLES.STUDENT]: [
      { name: 'bio', label: 'Biographie', type: 'textarea' },
      { name: 'experienceLevel', label: 'Niveau', type: 'select', options: ['Débutant', 'Intermédiaire', 'Avancé'] },
      { name: 'birthDate', label: 'Date de naissance', type: 'date' },
      { 
        name: 'isSubscribed', 
        label: 'Abonné', 
        type: 'checkbox',
        conditionalFields: [
          { name: 'subscriptionDate', label: 'Date d\'abonnement', type: 'date' },
          { name: 'subscriptionExpiry', label: 'Date d\'expiration', type: 'date' },
        ]
      },
    ],
    [ROLES.TEACHER]: [
      { name: 'bio', label: 'Biographie', type: 'textarea' },
      { name: 'specialty', label: 'Spécialité', type: 'text' },
      { name: 'education', label: 'Éducation', type: 'text' },
      { name: 'yearsOfExperience', label: 'Années d\'expérience', type: 'number' },
      { name: 'badges', label: 'Badges', type: 'tags' },
    ],
    [ROLES.ADMIN]: [
      { name: 'isActive', label: 'Compte actif', type: 'checkbox' },
    ],
  };

  // Password field only for add mode
  if (mode === 'add') {
    commonFields.splice(3, 0, { 
      name: 'password', 
      label: 'Mot de passe', 
      type: 'password', 
      required: true 
    });
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
  };

  const handleArrayChange = (name, values) => {
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for submission
    const submissionData = { ...formData };
    
    // Clean up empty values
    Object.keys(submissionData).forEach(key => {
      if (submissionData[key] === '' || submissionData[key] === null) {
        submissionData[key] = undefined;
      }
    });

    onSubmit(submissionData);
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            className="input-field"
            required={field.required}
          >
            <option value="">Sélectionner...</option>
            {field.options.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            className="input-field"
            rows="3"
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={field.name}
              checked={formData[field.name] || false}
              onChange={handleChange}
              className="h-4 w-4 text-e-bosy-purple focus:ring-e-bosy-purple border-gray-300 rounded"
            />
            <label className="ml-2">{field.label}</label>
          </div>
        );
      case 'file':
        return (
          <input
            type="file"
            name={field.name}
            onChange={handleChange}
            accept="image/*"
            className="input-field"
          />
        );
      case 'tags':
        return (
          <div>
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  handleArrayChange(field.name, [...(formData[field.name] || []), e.target.value]);
                  e.target.value = '';
                  e.preventDefault();
                }
              }}
              placeholder="Ajouter un badge et appuyez sur Entrée"
              className="input-field"
            />
            <div className="flex flex-wrap mt-2">
              {(formData[field.name] || []).map((badge, index) => (
                <span key={index} className="badge">
                  {badge}
                  <button
                    type="button"
                    onClick={() => handleArrayChange(
                      field.name, 
                      formData[field.name].filter((_, i) => i !== index)
                    )}
                    className="ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            className="input-field"
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Ajouter un Utilisateur' : 'Modifier l\'Utilisateur'}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="tabs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={activeTab === 'general' ? 'active-tab' : ''}
          >
            Informations Générales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('role')}
            className={activeTab === 'role' ? 'active-tab' : ''}
          >
            Informations Spécifiques
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonFields.map(field => (
                <div key={field.name} className={`form-group ${field.type === 'checkbox' ? 'flex items-center' : ''}`}>
                  <label>{field.label}</label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'role' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(roleFields[formData.role] || []).map(field => (
                <React.Fragment key={field.name}>
                  <div className={`form-group ${field.type === 'checkbox' ? 'flex items-center' : ''}`}>
                    <label>{field.label}</label>
                    {renderField(field)}
                  </div>
                  {field.conditionalFields && formData[field.name] && 
                    field.conditionalFields.map(condField => (
                      <div key={condField.name} className="form-group">
                        <label>{condField.label}</label>
                        {renderField(condField)}
                      </div>
                    ))
                  }
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
            <button type="submit" className="submit-button">
              {mode === 'add' ? 'Créer' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;