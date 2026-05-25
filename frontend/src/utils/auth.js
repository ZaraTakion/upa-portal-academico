export function isAuthenticated() {
  return Boolean(localStorage.getItem("accessToken"));
}

export function saveTokens(access, refresh) {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
}

export function saveUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("currentUser");
  window.location.href = "/";
}

export function hasGroup(groupName) {
  const user = getUser();

  if (!user?.groups) {
    return false;
  }

  return user.groups.includes(groupName);
}