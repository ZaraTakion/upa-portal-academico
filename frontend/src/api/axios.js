import axios from "axios";
import { resolveAllowedApiRequestUrl } from "../utils/apiRequestUrl";
import { getAccessToken, setAccessToken } from "./session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  timeout: 30000,
});

let refreshRequest;
let csrfRequest;
let csrfToken = "";

export function ensureCsrfToken() {
  csrfRequest ||= api.get("/accounts/csrf/").then(({ data }) => {
    csrfToken = data.csrfToken;
    return csrfToken;
  }).finally(() => { csrfRequest = undefined; });
  return csrfRequest;
}

export async function refreshSession() {
  refreshRequest ||= (async () => {
    await ensureCsrfToken();
    const { data } = await api.post("/token/refresh/");
    setAccessToken(data.access);
    return data.access;
  })().finally(() => { refreshRequest = undefined; });
  return refreshRequest;
}

export async function endSession() {
  await ensureCsrfToken();
  await api.post("/token/logout/");
  setAccessToken(null);
  localStorage.removeItem("currentUser");
}

api.interceptors.request.use(async (config) => {
  resolveAllowedApiRequestUrl(config.url, config.baseURL || api.defaults.baseURL, window.location.origin);
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())) {
    if (!csrfToken) await ensureCsrfToken();
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isSessionEndpoint = /\/token\/(refresh|logout)\/?$|\/token\/?$/.test(request?.url || "");
    if (error.response?.status !== 401 || !request || request._retried || isSessionEndpoint) {
      return Promise.reject(error);
    }
    request._retried = true;
    try {
      const access = await refreshSession();
      request.headers.Authorization = `Bearer ${access}`;
      return api(request);
    } catch (refreshError) {
      if ([401, 403].includes(refreshError.response?.status)) {
        setAccessToken(null);
        localStorage.removeItem("currentUser");
        window.dispatchEvent(new Event("upa:session-expired"));
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;

export async function logout() {
  try {
    await endSession();
    window.location.assign("/");
  } catch {
    window.dispatchEvent(new Event("upa:logout-failed"));
  }
}
