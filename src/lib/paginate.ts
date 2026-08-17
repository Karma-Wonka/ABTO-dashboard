/** Shared sort + paginate for the small (dozens-of-rows) ABTO content tables. */
export function paginateAndSort<T extends Record<string, unknown>>(
  items: T[],
  {
    page = 1,
    limit = 10,
    sort
  }: {
    page?: number;
    limit?: number;
    sort?: string;
  },
  computed: Record<string, (item: T) => string | number> = {}
) {
  let sorted = items;

  if (sort) {
    try {
      const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
      if (sortItems.length > 0) {
        const { id, desc } = sortItems[0];
        const getValue = computed[id] ?? ((item: T) => item[id] as string | number);
        sorted = [...items].sort((a, b) => {
          const aVal = getValue(a);
          const bVal = getValue(b);
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return desc ? bVal - aVal : aVal - bVal;
          }
          const aStr = String(aVal ?? '').toLowerCase();
          const bStr = String(bVal ?? '').toLowerCase();
          return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
        });
      }
    } catch {
      // Invalid sort param — ignore
    }
  }

  const total = sorted.length;
  const offset = (page - 1) * limit;

  return { items: sorted.slice(offset, offset + limit), total, offset, limit };
}
