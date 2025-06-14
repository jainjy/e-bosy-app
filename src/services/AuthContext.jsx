/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { apiHelper } from "./ApiFetch";

/**
 *Cree un contexte d'authentification
 */
const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  // État pour stocker les informations de l'utilisateur
  const [user, setUser] = useState(null);
  // État pour suivre si l'utilisateur est connecte
  const [logged, setLogged] = useState(false);
  // État pour gerer le chargement
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('user_token');

  const setToken = (token) => localStorage.setItem('user_token', token);

  /**
   * Supprime le token du localStorage
   */
  const removeToken = () => localStorage.removeItem('user_token');


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
   * Deconnecte l'utilisateur
   */
  const logout = async () => {
    try {
      await apiHelper('post', 'auth/logout');
    } finally {
      // On nettoie toujours même si la requête echoue
      removeToken();
      setUser(null);
      setLogged(false);
    }
  };

  /**
   * Recupère les informations de l'utilisateur connecte
   */
  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      if (getToken()) {
        const [userData, error] = await apiHelper('get', 'users/me');
        
        if (error) throw error;
        
        setUser(userData);
        setLogged(true);
      }
    } catch (error) {
      // Si erreur 401 (non autorise), on deconnecte
      if (error.status === 401) {
        removeToken();
        setLogged(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Au montage du composant, on recupère les infos utilisateur
  useEffect(() => {
    fetchUserInfo();

    // Optionnel: verification periodique de la session
    const sessionCheckInterval = setInterval(fetchUserInfo, 1000 * 60 * 5); // Toutes les 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, []);

  // Valeurs exposees par le contexte
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
 * Hook personnalise pour acceder au contexte d'authentification
 * @returns {Object} Les valeurs du contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilise dans un AuthProvider');
  }
  return context;
};