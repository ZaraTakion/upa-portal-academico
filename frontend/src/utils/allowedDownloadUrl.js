/**
 * Restrict API file downloads to the configured API origin and path.
 * A crafted URL in an API response must never receive the user's Bearer token.
 */
export function resolveApiDownloadUrl(downloadUrl, apiBaseUrl, browserOrigin) {
  if (typeof downloadUrl !== "string" || !downloadUrl.trim()) {
    throw new Error("Endereço de download inválido.");
  }
  const apiBase = new URL(apiBaseUrl, browserOrigin);
  const target = new URL(downloadUrl, apiBase);
  const apiPath = apiBase.pathname.replace(/\/$/, "");
  if (target.origin !== apiBase.origin || !target.pathname.startsWith(`${apiPath}/`)) {
    throw new Error("O download está fora da API autorizada.");
  }
  return target.href;
}
