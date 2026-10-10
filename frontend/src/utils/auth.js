export function isAuthenticated() {
  return Boolean(localStorage.getItem("accessToken"));
}

export function saveTokens(access) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("sessionStarted", "1");
  localStorage.removeItem("refreshToken");
}

export function saveUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getUser() {
  const stored = localStorage.getItem("currentUser");
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    if (user && typeof user === "object" && !Array.isArray(user)) return user;
  } catch {
    // Cache is not authoritative; ignore malformed sessions.
  }
  localStorage.removeItem("currentUser");
  return null;
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("sessionStarted");
  sessionStorage.removeItem("csrfToken");
}

export async function logout({ revoke = true } = {}) {
  if (revoke) {
    try {
      const base = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8000/api")).replace(/\/$/, "");
      const csrfResponse = await fetch(`${base}/token/csrf/`, {
        credentials: "include",
      });
      if (csrfResponse.ok) {
        const { csrf } = await csrfResponse.json();
        await fetch(`${base}/token/logout/`, {
          method: "POST",
          credentials: "include",
          headers: { "X-CSRFToken": csrf },
        });
      }
    } catch {
      // Even when the server is offline, clear all local authentication state.
    }
  }
  clearSession();
  window.location.assign("/");
}

export function hasGroup(groupName) {
  const user = getUser();
  return Boolean(user?.groups?.includes(groupName));
}
