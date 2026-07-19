import type { Context, MiddlewareHandler } from 'hono';
import type { AuthVariables, Permission, UserRole } from './types.js';

const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    'manage_own_account',
    'access_own_network',
    'view_users',
    'manage_users',
    'send_notifications',
    'impersonate_users',
  ],
  standard_user: ['manage_own_account', 'access_own_network'],
};

export function permissionsForRole(role: UserRole): Permission[] {
  return rolePermissions[role];
}

export function hasPermission(c: Context<{ Variables: AuthVariables }>, permission: Permission) {
  return c.get('actor').permissions.includes(permission);
}

export function requirePermission(
  permission: Permission
): MiddlewareHandler<{ Variables: AuthVariables }> {
  return async (c, next) => {
    if (!hasPermission(c, permission)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await next();
  };
}
