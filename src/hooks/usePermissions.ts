import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CurrentPermissionResponse,
  fetchCurrentPermissions,
  ModulePermission,
  RolePermissionMatrix,
} from '@/apis/ehs';
import { showMessage } from '@/utils/Constant';

type PermissionAction = 'view' | 'add' | 'edit' | 'delete' | 'all';

const ACTION_SYNONYMS: Record<string, PermissionAction> = {
  all: 'all',
  view: 'view',
  list: 'view',
  read: 'view',
  add: 'add',
  create: 'add',
  edit: 'edit',
  update: 'edit',
  delete: 'delete',
  remove: 'delete',
};

const MODULE_SYNONYMS: Record<string, string> = {
  safetyinduction: 'SafetyInduction',
  inductiontracking: 'InductionTracking',
  contractordirectory: 'ContractorDirectory',
  sitedirectory: 'SiteDirectory',
  firstaidtreatmentregister: 'FirstAidTreatmentRegister',
};

const normaliseAction = (action: string): PermissionAction => {
  const key = action.toLowerCase();
  return ACTION_SYNONYMS[key] ?? 'view';
};

const normaliseModule = (moduleKey: string): string => {
  const key = moduleKey.replace(/[^a-z]/gi, '').toLowerCase();
  return MODULE_SYNONYMS[key] ?? moduleKey;
};

type PermissionIndex = Record<string, Set<PermissionAction>>;

const indexPermissions = (matrices: RolePermissionMatrix[]): PermissionIndex => {
  const map: PermissionIndex = {};

  matrices.forEach((matrix) => {
    (matrix.modulePermissions || []).forEach((entry: ModulePermission) => {
      const moduleName = entry?.module || '';
      if (!moduleName) return;
      const normalisedModule = normaliseModule(moduleName);
      map[normalisedModule] = map[normalisedModule] || new Set<PermissionAction>();
      entry.actions.forEach((action) => {
        map[normalisedModule].add(normaliseAction(action));
      });
    });
  });

  return map;
};

export const usePermissions = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [matrices, setMatrices] = useState<RolePermissionMatrix[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCurrentPermissions();
      const data: CurrentPermissionResponse | undefined = response?.result;
      setRoles(Array.isArray(data?.roles) ? data.roles : []);
      setMatrices(Array.isArray(data?.modulePermissions) ? data.modulePermissions : []);
    } catch (error: any) {
      console.error('fetchPermissions error:', error);
      showMessage(error?.message ?? 'Unable to load permissions', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const permissionIndex = useMemo(() => indexPermissions(matrices), [matrices]);

  const can = useCallback(
    (moduleKey: string, actionKey: string): boolean => {
      const moduleName = normaliseModule(moduleKey);
      const action = normaliseAction(actionKey);
      const moduleActions = permissionIndex[moduleName];
      if (!moduleActions) {
        return false;
      }
      if (moduleActions.has('all')) {
        return true;
      }
      return moduleActions.has(action);
    },
    [permissionIndex]
  );

  return {
    roles,
    loading,
    can,
    refresh: fetchPermissions,
  };
};

