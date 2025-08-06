import { usePermissions } from './usePermissions';

export const usePermissionCheck = () => {
  const { permissions, loading } = usePermissions();

  const hasPermission = (permission: string) => {
    if (loading || !permissions) return false;
    return (permissions as any)[permission] || false;
  };

  const hasAnyPermission = (permissionsToCheck: (keyof typeof permissions)[]) => {
    if (loading || !permissions) return false;
    return permissionsToCheck.some(permission => permissions[permission]);
  };

  const hasAllPermissions = (permissionsToCheck: (keyof typeof permissions)[]) => {
    if (loading || !permissions) return false;
    return permissionsToCheck.every(permission => permissions[permission]);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions,
    loading,
  };
}; 