import React, { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { PlusIcon, TrashIcon, PencilIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { getData, postData, putData, deleteData } from "../../services/ApiFetch";
import { useAuth } from '../../contexts/AuthContext';

const CategoryFormModal = ({ onClose, onSubmit, initialData = {} }) => {
  const [categoryData, setCategoryData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
  });
  const [errors, setErrors] = useState({});
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: null,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!categoryData.name.trim()) {
      newErrors.name = "Le nom de la catégorie est requis.";
    } else if (categoryData.name.length > 100) {
      newErrors.name = "Le nom ne peut dépasser 100 caractères.";
    }
    if (categoryData.description && categoryData.description.length > 250) {
      newErrors.description = "La description ne peut dépasser 250 caractères.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(categoryData, initialData.categoryId);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {initialData.categoryId ? "Modifier la Catégorie" : "Créer une Nouvelle Catégorie"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nom de la Catégorie:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={categoryData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              required
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              value={categoryData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
              rows="4"
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-e-bosy-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {initialData.categoryId ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminCategoriesPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [categoriesData, categoriesError] = await getData("courses/categories");
        if (categoriesError) throw new Error(categoriesError.message);
        setCategories(categoriesData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySubmit = async (categoryData, categoryId) => {
    try {
      if (categoryId) {
        // Mise à jour
        const [_, error] = await putData(`courses/categories/${categoryId}`, categoryData);
        if (error) throw new Error(error.message);
        setCategories(categories.map((cat) =>
          cat.categoryId === categoryId ? { ...cat, ...categoryData } : cat
        ));
        toast.success("Catégorie mise à jour avec succès.");
      } else {
        // Création
        const [data, error] = await postData("courses/categories", categoryData);
        if (error) throw new Error(error.message);
        setCategories([...categories, data]);
        toast.success("Catégorie créée avec succès.");
      }
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCategoryDelete = async (categoryId, categoryName) => {
    const result = await Swal.fire({
      title: `Supprimer "${categoryName}" ?`,
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        const [_, error] = await deleteData(`courses/categories/${categoryId}`);
        if (error) throw new Error(error.message);
        setCategories(categories.filter((category) => category.categoryId !== categoryId));
        toast.success("Catégorie supprimée avec succès.");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const openCategoryForm = (category = null) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const closeCategoryForm = () => {
    setIsCategoryFormOpen(false);
    setEditingCategory(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Catégories</h1>
        <Link
          to="/courses"
          className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour aux Cours
        </Link>
      </div>
      <div className="mb-6">
        <button
          onClick={() => openCategoryForm()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Créer une Nouvelle Catégorie
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="max-h-96 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="p-6 text-gray-600">Aucune catégorie disponible.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-gray-700">Nom</th>
                  <th className="px-4 py-2 text-left text-gray-700">Description</th>
                  <th className="px-4 py-2 text-right text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.categoryId} className="border-b">
                    <td className="px-4 py-2">{category.name}</td>
                    <td className="px-4 py-2">{category.description || "Aucune description"}</td>
                    <td className="px-4 py-2 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openCategoryForm(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleCategoryDelete(category.categoryId, category.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {isCategoryFormOpen && (
        <CategoryFormModal
          onClose={closeCategoryForm}
          onSubmit={handleCategorySubmit}
          initialData={editingCategory || {}}
        />
      )}
    </div>
  );
};

export default AdminCategoriesPage;