export function getInitialClassGroup(groups, requestedId) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return null;
  }

  return groups.find((group) => String(group.id) === String(requestedId)) || groups[0];
}
