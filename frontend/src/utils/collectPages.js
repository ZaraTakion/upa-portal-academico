// Requests stay relative to the configured API; server-provided next URLs are never followed.
export async function collectPages(client, endpoint, params = {}) {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const { data } = await client.get(endpoint, { params: { ...params, page, page_size: 100 } });
    if (Array.isArray(data)) return data;
    if (!Array.isArray(data.results)) throw new Error("Resposta de lista inválida.");
    rows.push(...data.results);
    if (!data.next) return rows;
    if (page >= 10000) throw new Error("A lista excedeu o limite de páginas.");
  }
}
