import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

let refreshRequest;

function csrfToken() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("csrftoken="));
  return cookie ? decodeURIComponent(cookie.slice("csrftoken=".length)) : "";
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
    const csrf = csrfToken();
    if (csrf) config.headers["X-CSRFToken"] = csrf;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const requestUrl = request?.url || "";
    const isSessionEndpoint = /\/token\/(refresh|logout)\/?$|\/token\/?$/.test(requestUrl);

    if (error.response?.status !== 401 || !request || request._retried || isSessionEndpoint) {
      return Promise.reject(error);
    }

    request._retried = true;
    try {
      refreshRequest ||= api
        .post("/token/refresh/", {}, { skipRefreshRetry: true })
        .then((response) => response.data.access)
        .finally(() => {
          refreshRequest = undefined;
        });
      const access = await refreshRequest;
      localStorage.setItem("accessToken", access);
      request.headers.Authorization = `Bearer ${access}`;
      return api(request);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");
      window.location.assign("/");
      return Promise.reject(refreshError);
    }
  }
);

export default api;
