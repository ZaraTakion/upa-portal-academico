import axios from "axios";
import { resolveAllowedApiRequestUrl } from "../utils/apiRequestUrl";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

let refreshRequest;
const sessionEndpoint = /^\/token\/(?:csrf\/|refresh\/|logout\/)?$/;

async function bootstrapCsrf() {
  // The API's CSRF cookie can live on a different host than the React app.
  // document.cookie on the frontend cannot read that cookie.
  const response = await api.get("/token/csrf/");
  const csrf = response.data?.csrf;
  if (!csrf) throw new Error("A API não retornou o token CSRF.");
  sessionStorage.setItem("csrfToken", csrf);
  return csrf;
}

api.interceptors.request.use((config) => {
  resolveAllowedApiRequestUrl(
    config.url, config.baseURL || api.defaults.baseURL, window.location.origin,
  );
  const token = localStorage.getItem("accessToken");
  if (token && !sessionEndpoint.test(config.url || "")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
    const csrf = sessionStorage.getItem("csrfToken");
    if (csrf) config.headers["X-CSRFToken"] = csrf;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isSessionRequest = sessionEndpoint.test(request?.url || "");
    if (error.response?.status !== 401 || !request || request._retried || isSessionRequest) {
      return Promise.reject(error);
    }
    request._retried = true;
    try {
      refreshRequest ||= bootstrapCsrf()
        .then((csrf) => api.post("/token/refresh/", {}, {
          headers: { "X-CSRFToken": csrf },
        }))
        .then((response) => response.data.access)
        .finally(() => { refreshRequest = undefined; });
      const access = await refreshRequest;
      localStorage.setItem("accessToken", access);
      request.headers.Authorization = `Bearer ${access}`;
      return api(request);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("csrfToken");
      window.location.assign("/");
      return Promise.reject(refreshError);
    }
  },
);

export default api;
