import axios from 'axios';

/**
 * Client API centralisé pour KAMER CINÉ TALENTS MANAGER.
 *
 * <p>Tous les appels HTTP passent par cette instance afin de garantir :
 * <ul>
 *   <li>Une URL de base unique (configurable via variable d'environnement).</li>
 *   <li>Une gestion centralisée du token JWT (injecté automatiquement).</li>
 *   <li>Une interception uniforme des erreurs (401 → redirection login).</li>
 * </ul>
 * Aucun module ne doit créer sa propre instance axios.</p>
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requête : injecte le token JWT depuis le localStorage.
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kct_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Intercepteur de réponse : en cas de 401, le token est expiré ou invalide.
 * On nettoie le stockage et on redirige vers /login.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kct_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
