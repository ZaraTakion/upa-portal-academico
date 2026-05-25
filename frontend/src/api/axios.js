import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;