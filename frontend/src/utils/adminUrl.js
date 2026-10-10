const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function buildAdminUrl(adminBaseUrl, path = "", { allowLocalhost = true, browserOrigin } = {}) {
  if (typeof adminBaseUrl !== "string" || !adminBaseUrl.trim()) return null;
  try {
    const input = adminBaseUrl.trim();
    const relative = input.startsWith("/") && !input.startsWith("//");
    if (relative && !/^\/admin\/?$/.test(input)) return null;
    const origin = browserOrigin || (typeof window !== "undefined" ? window.location.origin : undefined);
    if (relative && !origin) return null;
    const url = relative ? new URL(input, origin) : new URL(input);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    if (!allowLocalhost && LOCAL_HOSTS.has(url.hostname)) return null;
    const basePath = url.pathname.replace(/\/+$/, "");
    const targetPath = path.replace(/^\/+/, "");
    url.pathname = targetPath ? basePath + "/" + targetPath : basePath + "/";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}
