export type UserRole = "owner" | "admin" | "member";
type CanManageUserProps = {
  currentRole: UserRole;
  targetRole: UserRole;
};

export default function canManageUser({
  currentRole,
  targetRole,
}: CanManageUserProps): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    owner: 3,
    admin: 2,
    member: 1,
  };

  return roleHierarchy[currentRole] > roleHierarchy[targetRole];
}
