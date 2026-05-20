
export function getNestedValue(obj, key) {
  return key.split('.').reduce((acc, part) => acc?.[part], obj);
}

export function sortData(data, sortKey, direction = 'asc') {
  if (!sortKey) return data;

  return [...data].sort((a, b) => {
    const aVal = getNestedValue(a, sortKey);
    const bVal = getNestedValue(b, sortKey);

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const comparison =
      typeof aVal === 'string'
        ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
        : aVal < bVal ? -1 : aVal > bVal ? 1 : 0;

    return direction === 'asc' ? comparison : -comparison;
  });
}


export function paginateData(data, page, pageSize) {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}


export function getPaginationMeta(totalItems, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    page: safePage,
    totalPages,
    total: totalItems,
    pageSize,
    from: totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, totalItems),
  };
}


export function nextSortDirection(current) {
  if (!current) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}


export function resolveRowKey(row, rowKey, index) {
  if (typeof rowKey === 'function') return rowKey(row, index);
  if (typeof rowKey === 'string') return getNestedValue(row, rowKey);
  return index;
}
