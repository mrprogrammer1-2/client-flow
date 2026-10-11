type UserRole = "owner" | "admin" | "member";

export default function canAssignRole({
  currentRole,
  newRole,
}: {
  currentRole: UserRole;
  newRole: UserRole;
}) {
  // Owners can assign any role except owner, admins can only assign member role, and members cannot assign any roles.
  if (currentRole === "owner" && newRole !== "owner") {
    return true;
  } else if (currentRole === "admin" && newRole === "member") {
    return true;
  } else {
    return false;
  }
}
