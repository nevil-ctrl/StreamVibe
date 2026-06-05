export const Role = {
  USER: 'USER' as const,
  ADMIN: 'ADMIN' as const,
  SUPERADMIN: 'SUPERADMIN' as const,
};

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES = [Role.USER, Role.ADMIN, Role.SUPERADMIN] as const;
