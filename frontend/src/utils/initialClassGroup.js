export function getInitialClassGroup(groups, requestedId) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return null;
  }

  return groups.find((group) => String(group.id) === String(requestedId)) || groups[0];
}

export function getRequestedClassGroupId(groups, requestedId) {
  const requestedGroup = groups.find(
    (group) => String(group.id) === String(requestedId),
  );
  return requestedGroup ? String(requestedGroup.id) : "";
}
