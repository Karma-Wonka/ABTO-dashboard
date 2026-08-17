'use client';

/**
 * Client-side hook for filtering navigation items based on permission.
 *
 * Fully client-side and synchronous — navigation visibility is UX only,
 * not a security boundary. Actual security (API routes, server actions)
 * always goes through `requirePermission`/`requireSelfOrPermission` in
 * src/lib/rbac.ts.
 */

import { useMemo } from 'react';
import { useRole } from './use-role';
import type { NavItem, NavGroup } from '@/types';

function matchesAccess(access: NavItem['access'], permissions: string[]) {
  if (!access?.permission) return true;
  return permissions.includes(access.permission);
}

export function useFilteredNavItems(items: NavItem[]) {
  const { permissions } = useRole();

  return useMemo(() => {
    return items
      .filter((item) => matchesAccess(item.access, permissions))
      .map((item) => {
        if (!item.items || item.items.length === 0) return item;
        return {
          ...item,
          items: item.items.filter((child) => matchesAccess(child.access, permissions))
        };
      });
  }, [items, permissions]);
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const filteredItems = useFilteredNavItems(allItems);

  return useMemo(() => {
    const filteredSet = new Set(filteredItems.map((item) => item.title));
    return groups
      .map((group) => ({
        ...group,
        items: filteredItems.filter((item) =>
          group.items.some((gi) => gi.title === item.title && filteredSet.has(gi.title))
        )
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, filteredItems]);
}
