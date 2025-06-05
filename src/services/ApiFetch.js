import axios from "axios";

// Configuration de base de l'API
const API_CONFIG = {
  baseURL: "http://127.0.0.1:5196/api/",
  timeout: 10000, // Timeout de 10 secondes
  headers: {
    "Content-Type": "application/json",
  }
};

// Configuration pour les requêtes avec fichiers
const API_CONFIG_FILE = {
  ...API_CONFIG,
  headers: {
    'Content-Type': 'multipart/form-data',
  }
};

// Création des instances axios
const api = axios.create(API_CONFIG);
const apiWithFile = axios.create(API_CONFIG_FILE);

/**
 * Intercepteur pour ajouter le token aux requêtes
 */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

/**
 * Intercepteur pour gérer les erreurs globales
 */
api.interceptors.response.use(
  response => response,
  error => {
    // Vous pouvez ajouter une logique de gestion d'erreur globale ici
    // Par exemple, rediriger vers /login si 401
    return Promise.reject(error);
  }
);

/**
 * Helper générique pour les requêtes API
 * @param {string} method - La méthode HTTP (get, post, put, delete)
 * @param {string} url - L'URL de l'endpoint
 * @param {Object} [data=null] - Les données à envoyer
 * @param {Object} [config={}] - Configuration supplémentaire
 * @returns {Promise<Array>} Un tableau [data, error]
 */
export const apiHelper = async (method, url, data = null, config = {}) => {
  try {
    // Choisir l'instance axios en fonction du type de contenu
    const instance = config.headers?.['Content-Type'] === 'multipart/form-data' 
      ? apiWithFile 
      : api;
    
    const response = await instance({
      method,
      url,
      data,
      ...config
    });

    // Retourner les données et pas de erreur
    return [response.data, null];
  } catch (error) {
    // Normalisation des erreurs
    const err = {
      message: error.response?.data?.message || error.message,
      errors: error.response?.data?.errors,
      status: error.response?.status,
      data: error.response?.data
    };

    return [null, err];
  }
};

/**
 * Fonction pour les requêtes GET
 * @param {string} url - L'URL de l'endpoint
 * @param {Object} [config={}] - Configuration supplémentaire
 * @returns {Promise<Array>} Un tableau [data, error]
 */
export const getData = (url, config = {}) => apiHelper('get', url, null, config);

/**
 * Fonction pour les requêtes POST
 * @param {string} url - L'URL de l'endpoint
 * @param {Object} data - Les données à envoyer
 * @param {Object} [config={}] - Configuration supplémentaire
 * @returns {Promise<Array>} Un tableau [data, error]
 */
export const postData = (url, data, config = {}) => apiHelper('post', url, data, config);

/**
 * Fonction pour les requêtes POST avec fichiers
 * @param {string} url - L'URL de l'endpoint
 * @param {FormData} data - Les données FormData à envoyer
 * @returns {Promise<Array>} Un tableau [data, error]
 */
export const postDataFile = (url, data) => {
  return apiHelper('post', url, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * Fonction pour les requêtes PUT
 * @param {string} url - L'URL de l'endpoint
 * @param {Object} data - Les données à envoyer
 * @param {Object} [config={}] - Configuration supplémentaire
 * @returns {Promise<Array>} Un tableau [data, error]
 */
export const putData = (url, data, config = {}) => apiHelper('put', url, data, config);

/**
 * Fonction pour les requêtes DELETE
 * @param {string} url - L'URL de l'endpoint
 * @param {Object} [config={}] - Configuration supplémentaire
 * @returns {Promise<Array>} Un tableau [data, error]
 */
export const deleteData = (url, config = {}) => apiHelper('delete', url, null, config);