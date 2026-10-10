export function adminPayload(fields, form) {
  const payload = {};
  for (const field of fields) {
    const value = form[field.name] ?? field.default ?? "";
    if (field.type === "password" && !value) continue;
    if (field.nullable && value === "") payload[field.name] = null;
    else if (field.type === "checkbox") payload[field.name] = Boolean(value);
    else if (["number", "relation"].includes(field.type)) payload[field.name] = value === "" ? undefined : Number(value);
    else payload[field.name] = value;
  }
  return payload;
}
