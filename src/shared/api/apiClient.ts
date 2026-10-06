import axios from 'axios';

/**
 * Client API centralisé pour KAMER CINÉ TALENTS MANAGER.
 *
 * <p>Tous les appels HTTP passent par cette instance afin de garantir :
 * <ul>
 *   <li>Une URL de base unique (configurable via variable d'environnement).</li>
 *   <li>Une gestion centralisée du token JWT (injecté automatiquement).</li>
 *   <li>Un rafraîchissement automatique du token d'accès expiré (401 →
 *       tentative unique via /iam/auth/refresh, requêtes concurrentes mises
 *       en file plutôt que de déclencher plusieurs rafraîchissements).</li>
 * </ul>
 * Aucun module ne doit créer sa propre instance axios.</p>
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// MODE DÉMO TEMPORAIRE (npm run dev:demo) — voir src/demo/. À retirer avec ce dossier.
if (import.meta.env.MODE === 'demo') {
  apiClient.defaults.adapter = (config) => import('@/demo/demoAdapter').then((m) => m.demoAdapter(config));
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kct_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

function redirectToLogin() {
  localStorage.removeItem('kct_token');
  localStorage.removeItem('kct_refresh_token');
  localStorage.removeItem('kct_user');
  window.location.href = '/login';
}

/**
 * Rafraîchit le token d'accès une seule fois même si plusieurs requêtes
 * échouent en 401 simultanément (toutes attendent la même promesse).
 */
function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const storedRefreshToken = localStorage.getItem('kct_refresh_token');
    if (!storedRefreshToken) {
      redirectToLogin();
      return Promise.reject(new Error('Aucun token de rafraîchissement disponible'));
    }
    refreshPromise = axios
      .post(`${apiClient.defaults.baseURL}/iam/auth/refresh`, { refreshToken: storedRefreshToken })
      .then(({ data }) => {
        localStorage.setItem('kct_token', data.accessToken);
        localStorage.setItem('kct_refresh_token', data.refreshToken);
        return data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * Remplace le message générique d'Axios ("Request failed with status code
 * 403") par le texte réel renvoyé par l'API — {@link GlobalExceptionHandler}
 * répond au format RFC 7807 (`ProblemDetail`), dont le message se trouve
 * dans le champ `detail`, jamais `message`. Sans cette normalisation,
 * chaque `catch (e) { setError(e.message) }` du frontend afficherait un
 * message technique muet au lieu du texte pensé pour l'utilisateur final
 * (ex. "Permission requise: depense:valider_n3", ou le message générique
 * sûr renvoyé pour une erreur 500 — jamais une trace technique).
 */
function normalizeErrorMessage(error: unknown): void {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const detail = (response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string' && detail.trim() && error instanceof Error) {
      error.message = detail;
    }
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/iam/auth/');

    if (error.response?.status === 401 && !originalRequest?._retried && !isAuthEndpoint) {
      originalRequest._retried = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      redirectToLogin();
    }

    normalizeErrorMessage(error);
    return Promise.reject(error);
  }
);

export default apiClient;
