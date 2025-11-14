import { PermissionType } from "../enums/role.enum";
import { RolePermissions } from "./rolePermission";
import { UnauthorizedException } from "./appError";

export const roleGuard = (
  role: keyof typeof RolePermissions,
  requiredPermissions: PermissionType[]
) => {
  const Permissions = RolePermissions[role];

  const hasPermission = requiredPermissions.every((permission) =>
    Permissions.includes(permission)
  );

  if (!hasPermission) {
    throw new UnauthorizedException(
      "You do not have the necessary permissions to perform this action"
    );
  }
};
