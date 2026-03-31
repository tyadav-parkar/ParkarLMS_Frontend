import { Search, Users, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function Avatar({ name }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-[#0f2236] text-xs font-bold flex items-center justify-center flex-shrink-0">
      {initials}
    </div>
  );
}

function Row({ employee, selected, onToggle }) {
  return (
    <label className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
      selected ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-gray-50 border border-transparent'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(employee.id)}
          className="h-4 w-4 rounded accent-cyan-700 flex-shrink-0"
        />
        <Avatar name={employee.fullName} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{employee.fullName}</p>
          <p className="text-xs text-gray-400 truncate">{employee.email}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-medium text-gray-600">{employee.jobTitle || 'N/A'}</p>
        <p className="text-xs text-gray-400">{employee.department || 'N/A'}</p>
      </div>
    </label>
  );
}

export default function EligibleEmployeesPicker({
  employees,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  selectedIds,
  onToggle,
  onSelectAll,      // (visibleIds) => void  — selects current page
  onDeselectAll,    // () => void
  totalEligible,    // total across all pages from backend
  onSelectAllPages, // async () => void — fetches all IDs and selects them
}) {
  const [localSearch, setLocalSearch]         = useState('');
  const [selectingAll, setSelectingAll]       = useState(false);

  const filtered = localSearch.trim()
    ? employees.filter((e) =>
        e.fullName?.toLowerCase().includes(localSearch.toLowerCase()) ||
        e.email?.toLowerCase().includes(localSearch.toLowerCase()) ||
        e.department?.toLowerCase().includes(localSearch.toLowerCase())
      )
    : employees;

  const visibleIds     = filtered.map((e) => e.id);
  const allVisibleSel  = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSel = visibleIds.some((id) => selectedIds.includes(id));

  // Are all pages selected (selected count == total)
  const allPagesSelected = totalEligible > 0 && selectedIds.length >= totalEligible;
  // Did user just select all visible and there are more pages?
  const showSelectAllBanner = allVisibleSel && hasMore && !allPagesSelected && onSelectAllPages;

  function handleHeaderCheckbox() {
    if (allVisibleSel) {
      onDeselectAll?.();
    } else {
      onSelectAll?.(visibleIds);
    }
  }

  async function handleSelectAllPages() {
    if (!onSelectAllPages) return;
    setSelectingAll(true);
    try {
      await onSelectAllPages();
    } finally {
      setSelectingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Loading employees…
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
        <Users className="w-8 h-8 text-gray-200" />
        <p className="text-sm">No eligible employees found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">

      {/* ── Header row: select-all checkbox + count + local search ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Page select-all checkbox */}
          {onSelectAll && (
            <button
              type="button"
              onClick={handleHeaderCheckbox}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-cyan-700 transition-colors"
            >
              {allVisibleSel
                ? <CheckSquare className="w-4 h-4 text-cyan-700" />
                : someVisibleSel
                  ? <CheckSquare className="w-4 h-4 text-gray-400" />
                  : <Square className="w-4 h-4 text-gray-400" />
              }
              {allVisibleSel ? 'Bulk Deselect' : 'Bulk Select'}
            </button>
          )}

          {selectedIds.length > 0 && (
            <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        {/* Local search within loaded list */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter list…"
            className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-700 w-36"
          />
        </div>
      </div>

      {/* ── "Select all X employees" banner ── */}
      {showSelectAllBanner && (
        <div className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2.5">
          <p className="text-xs text-cyan-800">
            All <span className="font-bold">{employees.length}</span> employees on this page are selected.
          </p>
          <button
            type="button"
            disabled={selectingAll}
            onClick={handleSelectAllPages}
            className="ml-3 text-xs font-bold text-cyan-700 hover:text-cyan-900 underline disabled:opacity-50 whitespace-nowrap flex-shrink-0"
          >
            {selectingAll
              ? 'Selecting…'
              : `Select all ${totalEligible} employees`}
          </button>
        </div>
      )}

      {/* ── All pages selected confirmation banner ── */}
      {allPagesSelected && totalEligible > employees.length && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <p className="text-xs text-emerald-800 font-semibold">
            All {totalEligible} employees are selected.
          </p>
          <button
            type="button"
            onClick={() => onDeselectAll?.()}
            className="ml-3 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex-shrink-0"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── Employee list ── */}
      <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 space-y-0.5">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No results match &ldquo;{localSearch}&rdquo;.
          </p>
        ) : (
          <>
            {filtered.map((employee) => (
              <Row
                key={employee.id}
                employee={employee}
                selected={selectedIds.includes(employee.id)}
                onToggle={onToggle}
              />
            ))}

            {/* ── Load more trigger ── */}
            {hasMore && !localSearch && (
              <div className="pt-1 pb-0.5">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={onLoadMore}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Loading more…
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Load more employees
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Total count footer ── */}
      {totalEligible > 0 && (
        <p className="text-[10px] text-gray-400 text-right">
          Showing {employees.length} of {totalEligible} eligible employees
        </p>
      )}
    </div>
  );
}