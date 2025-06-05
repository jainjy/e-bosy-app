/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { apiHelper } from "./ApiFetch";

/**
 * Crée un contexte d'authentification
 */
const AuthContext = createContext();

/**
 * Fournisseur d'authentification qui englobe l'application
 * @param {Object} props - Les propriétés du composant
 * @param {ReactNode} props.children - Les enfants à rendre
 */
export const AuthProvider = ({ children }) => {
  // État pour stocker les informations de l'utilisateur
  const [user, setUser] = useState(null);
  // État pour suivre si l'utilisateur est connecté
  const [logged, setLogged] = useState(false);
  // État pour gérer le chargement
  const [loading, setLoading] = useState(true);

  /**
   * Récupère le token depuis le localStorage
   * @returns {string|null} Le token de l'utilisateur
   */
  const getToken = () => localStorage.getItem('user_token');

  /**
   * Stocke le token dans le localStorage
   * @param {string} token - Le token à stocker
   */
  const setToken = (token) => localStorage.setItem('user_token', token);

  /**
   * Supprime le token du localStorage
   */
  const removeToken = () => localStorage.removeItem('user_token');

  /**
   * Connecte un utilisateur
   * @param {string} email - L'email de l'utilisateur
   * @param {string} password - Le mot de passe de l'utilisateur
   * @returns {Promise<Object>} Un objet avec le résultat de la connexion
   */
  const login = async (email, password) => {
    try {
      const [response, error] = await apiHelper('post', 'auth/login', { email, password });

      if (error) {
        removeToken();
        return { success: false, error };
      }

      if (response?.error) {
        removeToken();
        return { success: false, error: response.error };
      }

      setToken(response.token);
      setUser(response.user);
      setLogged(true);
      return { success: true, user: response.user };

    } catch (error) {
      removeToken();
      return { success: false, error: error.message };
    }
  };

  /**
   * Déconnecte l'utilisateur
   */
  const logout = async () => {
    try {
      await apiHelper('post', 'auth/logout');
    } finally {
      // On nettoie toujours même si la requête échoue
      removeToken();
      setUser(null);
      setLogged(false);
    }
  };

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      if (getToken()) {
        const [userData, error] = await apiHelper('get', 'me');
        
        if (error) throw error;
        
        setUser(userData);
        setLogged(true);
      }
    } catch (error) {
      // Si erreur 401 (non autorisé), on déconnecte
      if (error.status === 401) {
        removeToken();
        setLogged(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Au montage du composant, on récupère les infos utilisateur
  useEffect(() => {
    fetchUserInfo();

    // Optionnel: vérification périodique de la session
    const sessionCheckInterval = setInterval(fetchUserInfo, 1000 * 60 * 5); // Toutes les 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, []);

  // Valeurs exposées par le contexte
  const contextValue = {
    user,
    login,
    logout,
    logged,
    loading,
    refreshUser: fetchUserInfo
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder au contexte d'authentification
 * @returns {Object} Les valeurs du contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};