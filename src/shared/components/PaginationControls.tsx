import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
}

/**
 * Contrôles de pagination réutilisables (précédent/suivant + résumé).
 *
 * <p>0-indexé côté données, affiché 1-indexé à l'utilisateur.</p>
 */
export function PaginationControls({ page, totalPages, totalElements, size, onPageChange }: PaginationControlsProps) {
  if (totalElements === 0) return null;

  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {from}–{to} sur {totalElements}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {page + 1} / {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
