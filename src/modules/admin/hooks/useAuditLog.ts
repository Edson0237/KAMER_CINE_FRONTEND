import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import type { AuditLogEntry } from '../types';

export function useAuditLog(params?: { utilisateurId?: string; entiteType?: string; page?: number; size?: number }) {
  const [data, setData] = useState<AuditLogEntry[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getAuditLog(params);
      setData(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [params?.utilisateurId, params?.entiteType, params?.page, params?.size]);

  useEffect(() => { load(); }, [load]);

  return { data, totalPages, loading, error, reload: load };
}
