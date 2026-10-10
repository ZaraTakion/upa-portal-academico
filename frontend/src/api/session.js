let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
  // Remove credentials from installations using the previous persistence model.
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}
