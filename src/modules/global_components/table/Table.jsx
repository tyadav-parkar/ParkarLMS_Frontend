import TableEl, { THead, TBody, Tr, Th, Td } from '../table_elements/TableElements';
import Pagination from './components/Pagination';
import { getNestedValue, resolveRowKey, nextSortDirection } from './utils/tableUtils';
import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  rowKey,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No data available.',
  pagination,
  onRowClick,
  rowClassName,
  className = '',
  wrapperClassName = '',
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  function handleSort(col) {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      const next = nextSortDirection(sortDir);
      setSortDir(next);
      if (!next) setSortKey(null);
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  }

  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${wrapperClassName}`.trim()}>
      <div className="overflow-x-auto">
        <TableEl className={className}>

          <THead>
            <Tr>
              {columns.map((col) => (
                <Th
                  key={col.key}
                  className={[
                    alignClass[col.align] ?? '',
                    col.sortable ? 'select-none cursor-pointer hover:text-white' : '',
                    col.headerClassName ?? '',
                  ].filter(Boolean).join(' ')}
                  onClick={col.sortable ? () => handleSort(col) : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <SortIcon sortKey={sortKey} colKey={col.key} sortDir={sortDir} />}
                  </span>
                </Th>
              ))}
            </Tr>
          </THead>

          <TBody>
            {loading ? (
              <SkeletonRows rows={skeletonRows} cols={columns.length} />
            ) : data.length === 0 ? (
              <EmptyRow cols={columns.length} message={emptyMessage} />
            ) : (
              getSortedData(data, sortKey, sortDir).map((row, index) => {
                const key = resolveRowKey(row, rowKey, index);
                const extraRowClass = typeof rowClassName === 'function'
                  ? rowClassName(row, index)
                  : (rowClassName ?? '');

                return (
                  <Tr
                    key={key}
                    className={`hover:bg-cyan-50/30 ${extraRowClass}`.trim()}
                    onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                  >
                    {columns.map((col) => (
                      <Td
                        key={col.key}
                        className={[alignClass[col.align] ?? '', col.className ?? ''].filter(Boolean).join(' ')}
                      >
                        {col.render
                          ? col.render(getNestedValue(row, col.key), row, index)
                          : (getNestedValue(row, col.key) ?? '—')}
                      </Td>
                    ))}
                  </Tr>
                );
              })
            )}
          </TBody>

        </TableEl>
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onChange={pagination.onChange}
        />
      )}
    </div>
  );
}

function SortIcon({ sortKey, colKey, sortDir }) {
  if (sortKey !== colKey) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
  if (sortDir === 'asc') return <ArrowUp className="w-3 h-3" />;
  if (sortDir === 'desc') return <ArrowDown className="w-3 h-3" />;
  return <ArrowUpDown className="w-3 h-3 opacity-50" />;
}

function SkeletonRows({ rows, cols }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-5 py-4">
          <div className="animate-pulse bg-gray-200 rounded h-4 w-full" />
        </td>
      ))}
    </tr>
  ));
}

function EmptyRow({ cols, message }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-12 text-center text-sm text-gray-400">
        {message}
      </td>
    </tr>
  );
}

function getSortedData(data, sortKey, sortDir) {
  if (!sortKey || !sortDir) return data;
  return [...data].sort((a, b) => {
    const aVal = getNestedValue(a, sortKey);
    const bVal = getNestedValue(b, sortKey);
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const cmp = typeof aVal === 'string'
      ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
      : aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });
}
