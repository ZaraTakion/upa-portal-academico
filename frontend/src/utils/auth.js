import { getAccessToken, setAccessToken } from "../api/session.js";

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function saveTokens(access) {
  setAccessToken(access);
}

export function saveUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getUser() {
  const stored = localStorage.getItem("currentUser");
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    if (user && typeof user === "object" && !Array.isArray(user)) {
      return user;
    }
  } catch {
    // Ignore invalid cached profile data; the server remains authoritative.
  }
  localStorage.removeItem("currentUser");
  return null;
}

export function hasGroup(groupName) {
  const user = getUser();
  return Boolean(user?.groups?.includes(groupName));
}
