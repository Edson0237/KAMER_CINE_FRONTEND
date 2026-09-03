import { useState, useEffect } from 'react';
import { useRoles, usePermissions } from '../hooks/useAdmin';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, KeyRound, Plus, Check } from 'lucide-react';

export function RoleManagementScreen() {
  const { roles, loading, error } = useRoles();
  const { permissions } = usePermissions();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [rolePerms, setRolePerms] = useState<string[]>([]);
  const [permLoading, setPermLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRoleId) {
      setPermLoading(true);
      adminService.getRolePermissions(selectedRoleId)
        .then(setRolePerms)
        .catch(() => setRolePerms([]))
        .finally(() => setPermLoading(false));
    } else {
      setRolePerms([]);
    }
  }, [selectedRoleId]);

  const togglePermission = async (permId: string, permCode: string, assigned: boolean) => {
    if (!selectedRoleId) return;
    setActionLoading(permId);
    try {
      if (assigned) {
        await adminService.removePermission(selectedRoleId, permId);
        setRolePerms(rolePerms.filter((c) => c !== permCode));
      } else {
        await adminService.assignPermission(selectedRoleId, permId);
        setRolePerms([...rolePerms, permCode]);
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <KeyRound className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rôles & permissions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">RBAC dynamique — Module M1</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
        </div>
      )}

      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-red-600 dark:text-red-400 text-sm">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles list */}
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Rôles</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-colors text-left ${
                    selectedRoleId === role.id
                      ? 'bg-kct-gold/10 text-kct-gold font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium">{role.libelle}</div>
                    <div className="text-xs text-gray-400">{role.code}</div>
                  </div>
                  <Badge variant="default">N{role.niveauHierarchique}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Permissions for selected role */}
          <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                {selectedRoleId
                  ? `Permissions — ${roles.find((r) => r.id === selectedRoleId)?.libelle ?? ''}`
                  : 'Sélectionnez un rôle'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedRoleId && (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
                  Choisissez un rôle pour voir et gérer ses permissions
                </p>
              )}

              {selectedRoleId && permLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-kct-gold" />
                </div>
              )}

              {selectedRoleId && !permLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permissions.map((perm) => {
                    const assigned = rolePerms.includes(perm.code);
                    return (
                      <div
                        key={perm.id}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-md border transition-colors ${
                          assigned
                            ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{perm.code}</div>
                          <div className="text-xs text-gray-400 truncate">{perm.libelle}</div>
                        </div>
                        <button
                          onClick={() => togglePermission(perm.id, perm.code, assigned)}
                          disabled={actionLoading === perm.id}
                          className={`shrink-0 ml-2 p-1.5 rounded-md transition-colors ${
                            assigned
                              ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {actionLoading === perm.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : assigned ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                  {permissions.length === 0 && (
                    <p className="col-span-2 text-sm text-gray-400 text-center py-4">Aucune permission définie</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
