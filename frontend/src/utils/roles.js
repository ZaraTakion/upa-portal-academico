export const roleHomePath = {
  admin: "/admin-panel",
  professor: "/teacher/classes",
  student: "/dashboard",
};

export function getUserRole(user) {
  if (user?.is_staff || user?.is_superuser) return "admin";
  if (user?.groups?.includes("Professor")) return "professor";
  return "student";
}

export function getRoleHome(user) {
  return roleHomePath[getUserRole(user)];
}
