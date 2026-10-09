/**
 * Guard the authenticated Axios instance: it is reserved for the configured API.
 * Axios joins relative request paths to baseURL, even when they begin with "/".
 * Resolve the same joined path before attaching a Bearer token or cookies.
 */
export function resolveAllowedApiRequestUrl(requestUrl, apiBaseUrl, browserOrigin) {
  if (typeof requestUrl !== "string" || !requestUrl.trim()) {
    throw new Error("A rota da API deve ser um endereço válido.");
  }

  const value = requestUrl.trim();
  // Reject non-HTTP schemes and CR/LF/control characters before URL normalization.
  if (/[\x00-\x1f\x7f]/.test(value) || (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value))) {
    throw new Error("O endereço da requisição não é permitido.");
  }

  const base = new URL(apiBaseUrl, browserOrigin);
  if (!["http:", "https:"].includes(base.protocol)) {
    throw new Error("O endereço configurado da API é inválido.");
  }
  const basePath = base.pathname.replace(/\/+$/, "");
  const absolute = /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(value);
  const url = absolute
    ? new URL(value, base)
    : new URL(`${basePath}/${value.replace(/^\/+/, "")}`, base.origin);

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.origin !== base.origin ||
    (basePath && url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`))
  ) {
    throw new Error("Requisição bloqueada: endereço fora da API autorizada.");
  }

  return url.href;
}
