const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function buildAdminUrl(adminBaseUrl, path = "", { allowLocalhost = true } = {}) {
  if (typeof adminBaseUrl !== "string" || !adminBaseUrl.trim()) return null;

  try {
    const url = new URL(adminBaseUrl.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    if (!allowLocalhost && LOCAL_HOSTS.has(url.hostname)) return null;

    const basePath = url.pathname.replace(/\/+$/, "");
    const targetPath = path.replace(/^\/+/, "");
    url.pathname = targetPath ? `${basePath}/${targetPath}` : `${basePath}/`;
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
