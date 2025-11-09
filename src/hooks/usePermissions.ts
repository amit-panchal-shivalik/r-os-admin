import { useMemo } from 'react';

export type ModuleKey = 'project' | 'opportunity' | 'blueCollarJob' | 'territory';
export type ActionKey = 'view' | 'create' | 'edit' | 'delete';

type Permissions = Record<ActionKey, boolean>;
type RoleMatrix = Record<ModuleKey, Permissions>;

const FULL: Permissions = { view: true, create: true, edit: true, delete: true };
const VIEW_ONLY: Permissions = { view: true, create: false, edit: false, delete: false };

// Define default permissions per role
const PERMISSION_MATRIX: Record<string, RoleMatrix> = {
  // registered users can only view everywhere
  registered_user: {
    project: VIEW_ONLY,
    opportunity: VIEW_ONLY,
    blueCollarJob: VIEW_ONLY,
    territory: VIEW_ONLY,
  },

  // developer/builder/sales admin can create/manage projects and blue-collar jobs
  developer_builder_sales_admin: {
    project: FULL,
    opportunity: FULL,
    blueCollarJob: FULL,
    territory: VIEW_ONLY,
  },

  // super admins can do everything
  superadmin: {
    project: FULL,
    opportunity: FULL,
    blueCollarJob: FULL,
    territory: FULL,
  },
};

function normalizeRole(role: string): string {
  return (role || '').trim().toLowerCase();
}

function getRolesFromStorage(): string[] {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.userRoles) && parsed.userRoles.length) {
      return parsed.userRoles.map((r: string) => normalizeRole(r));
    }
    if (typeof parsed?.role === 'string' && parsed.role) {
      // role may be a comma separated string
      return String(parsed.role)
        .split(',')
        .map((r: string) => normalizeRole(r))
        .filter(Boolean);
    }
  } catch {
    // ignore
  }
  return [];
}

function computeModulePermissions(roles: string[], module: ModuleKey): Permissions {
  // Start from most restrictive (no access) and merge role permissions with OR
  const base: Permissions = { view: false, create: false, edit: false, delete: false };
  for (const r of roles) {
    const matrix = PERMISSION_MATRIX[r];
    const mod = matrix?.[module];
    if (mod) {
      base.view = base.view || mod.view;
      base.create = base.create || mod.create;
      base.edit = base.edit || mod.edit;
      base.delete = base.delete || mod.delete;
    }
  }

  // If no explicit role matched, fallback to FULL (backoffice roles) except when we know nothing
  // Project rules can expand later; for now, unknown roles get FULL to not block admins.
  if (!roles.length) return FULL;
  return base;
}

export function usePermissions() {
  const roles = useMemo(() => getRolesFromStorage(), []);

  const can = (action: ActionKey, module: ModuleKey): boolean => {
    const perm = computeModulePermissions(roles, module);
    return perm[action];
  };

  return {
    roles,
    can,
    canView: (m: ModuleKey) => can('view', m),
    canCreate: (m: ModuleKey) => can('create', m),
    canEdit: (m: ModuleKey) => can('edit', m),
    canDelete: (m: ModuleKey) => can('delete', m),
  };
}

export const Permissions = {
  getRolesFromStorage,
  computeModulePermissions,
};
