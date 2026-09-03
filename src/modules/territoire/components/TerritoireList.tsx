import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTerritoires } from '../hooks/useTerritoires';
import { territoireService } from '../services/territoireService';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, MapPin, ChevronRight, ChevronDown, Users,
  GraduationCap, CalendarCheck, Building2, Globe, Map as MapIcon, Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Territoire } from '../types';

/**
 * Vérifie si un noeud ou l'un de ses descendants correspond à la recherche
 * (par nom de territoire ou de commune), pour filtrer l'arbre sans casser
 * la hiérarchie visuelle.
 */
function nodeMatchesSearch(
  node: TreeNode,
  needle: string,
  communes: Array<{ nom: string; territoireId: string }>,
): boolean {
  if (node.nom.toLowerCase().includes(needle)) return true;
  if (communes.some((c) => c.territoireId === node.id && c.nom.toLowerCase().includes(needle))) return true;
  return node.children.some((child) => nodeMatchesSearch(child, needle, communes));
}

const NIVEAU_LABELS: Record<number, string> = {
  1: 'N1 — National',
  2: 'N2 — Région',
  3: 'N3 — Département',
  4: 'N4 — Arrondissement',
  5: 'N5 — Commune',
};

const NIVEAU_ICONS: Record<number, typeof Globe> = {
  1: Globe,
  2: MapIcon,
  3: Building2,
  4: MapPin,
  5: MapPin,
};

type TreeNode = Territoire & {
  children: TreeNode[];
  communes?: Array<{
    id: string;
    nom: string;
    statutCommune: string;
    nombreApprenants: number;
    nombreEncadreurs: number;
    nombreSessions: number;
  }>;
};

function buildTree(territoires: Territoire[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  territoires.forEach((t) => {
    map.set(t.id, { ...t, children: [] });
  });

  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function TerritoryNode({
  node,
  depth,
  communes,
  onSelectCommune,
}: {
  node: TreeNode;
  depth: number;
  communes: Array<{ id: string; nom: string; statutCommune: string; nombreApprenants: number; nombreEncadreurs: number; nombreSessions: number; territoireId: string }>;
  onSelectCommune: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [extraChildren, setExtraChildren] = useState<Territoire[]>([]);
  const Icon = NIVEAU_ICONS[node.niveau] ?? MapPin;
  const hasChildren = node.children.length > 0 || extraChildren.length > 0;
  const allChildren = [...node.children, ...extraChildren.map((t) => ({ ...t, children: [] as TreeNode[] }))];

  const nodeCommunes = communes.filter((c) => c.territoireId === node.id);

  const handleExpand = async () => {
    if (!expanded && node.children.length === 0 && extraChildren.length === 0) {
      setLoadingChildren(true);
      try {
        const children = await territoireService.getChildren(node.id);
        setExtraChildren(children);
      } catch {
        // ignore
      } finally {
        setLoadingChildren(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`group flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200
          ${depth === 0 ? 'bg-gray-50 dark:bg-gray-800/50 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`
        }
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={hasChildren ? handleExpand : undefined}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
          )
        ) : (
          <div className="w-4 shrink-0" />
        )}
        <div className={`p-1.5 rounded-lg bg-kct-gold/10 shrink-0`}>
          <Icon className="h-4 w-4 text-kct-gold" />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">
          {node.nom}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
          {NIVEAU_LABELS[node.niveau] ?? `N${node.niveau}`}
        </span>
        {loadingChildren && <Loader2 className="h-3 w-3 animate-spin text-kct-gold shrink-0" />}
      </div>

      {expanded && (
        <div className="flex flex-col">
          {allChildren.map((child) => (
            <TerritoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              communes={communes}
              onSelectCommune={onSelectCommune}
            />
          ))}

          {nodeCommunes.length > 0 && (
            <div className="flex flex-col gap-1 mt-1 mb-1">
              {nodeCommunes.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-kct-gold/5 dark:hover:bg-kct-gold/10 transition-colors"
                  style={{ paddingLeft: `${(depth + 1) * 20 + 12}px` }}
                  onClick={() => onSelectCommune(c.id)}
                >
                  <div className="w-4 shrink-0" />
                  <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{c.nom}</span>
                  <Badge
                    variant={c.statutCommune === 'active' ? 'success' : c.statutCommune === 'en_cours' ? 'warning' : 'danger'}
                  >
                    {c.statutCommune}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{c.nombreApprenants}</span>
                    <span className="flex items-center gap-0.5"><GraduationCap className="h-3 w-3" />{c.nombreEncadreurs}</span>
                    <span className="flex items-center gap-0.5"><CalendarCheck className="h-3 w-3" />{c.nombreSessions}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TerritoireList() {
  const { territoires, communes, loading, error } = useTerritoires();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const tree = useMemo(() => buildTree(territoires), [territoires]);

  const filteredTree = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return tree;
    return tree.filter((node) => nodeMatchesSearch(node, needle, communes));
  }, [tree, communes, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-kct-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-kct-gold/10">
          <MapPin className="h-5 w-5 text-kct-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hiérarchie territoriale</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Naviguez la hiérarchie du périmètre — cliquez pour explorer</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un territoire ou une commune..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-2">
        {filteredTree.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {search ? 'Aucun résultat pour cette recherche' : 'Aucun territoire dans votre périmètre'}
            </p>
          </div>
        ) : (
          filteredTree.map((node) => (
            <TerritoryNode
              key={node.id}
              node={node}
              depth={0}
              communes={communes}
              onSelectCommune={(id) => navigate(`/communes/${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
