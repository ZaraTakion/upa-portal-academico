export function isAuthenticated() {
  return Boolean(localStorage.getItem("accessToken"));
}

export function saveTokens(access) {
  localStorage.setItem("accessToken", access);
  localStorage.removeItem("refreshToken");
}

export function saveUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

function readCsrfToken() {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("csrftoken="));
  return cookie ? decodeURIComponent(cookie.slice("csrftoken=".length)) : "";
}

export function logout({ revoke = true } = {}) {
  if (revoke) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    fetch(`${apiBase.replace(/\/$/, "")}/token/logout/`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRFToken": readCsrfToken() },
    }).catch(() => {});
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  window.location.assign("/");
}

export function hasGroup(groupName) {
  const user = getUser();
  return Boolean(user?.groups?.includes(groupName));
}
